import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Parse YouTube ISO 8601 duration (e.g., PT1H23M45S) to seconds
function parseIsoDuration(durationStr: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = durationStr.match(regex);
  if (!matches) return 0;
  const hours = parseInt(matches[1] || "0", 10);
  const minutes = parseInt(matches[2] || "0", 10);
  const seconds = parseInt(matches[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Parse description lines to find timestamps and game/chapter names
function parseChaptersFromDescription(description: string, defaultName: string): { gameName: string; startSeconds: number }[] {
  const lines = description.split("\n");
  const chapters: { gameName: string; startSeconds: number }[] = [];
  
  // Regex supporting timestamp formats: HH:MM:SS or MM:SS (e.g., 01:23:45 or 12:34 or 0:00)
  const timestampRegex = /(?:(\d+):)?(\d+):(\d+)/;

  for (const line of lines) {
    const match = line.match(timestampRegex);
    if (match) {
      const timestamp = match[0];
      const parts = timestamp.split(":").map(Number);
      let seconds = 0;
      if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
      }

      // Cleanup remaining text to extract clean chapter names
      const gameName = line
        .replace(timestamp, "")
        .replace(/[-–—:|🎮[\]()]/g, "")
        .trim();

      if (gameName) {
        chapters.push({ gameName, startSeconds: seconds });
      }
    }
  }

  chapters.sort((a, b) => a.startSeconds - b.startSeconds);

  if (chapters.length === 0) {
    chapters.push({ gameName: defaultName, startSeconds: 0 });
  }

  return chapters;
}

export async function GET(req: Request) {
  // Validate Vercel Cron authorization header
  const authHeader = req.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return NextResponse.json(
      { success: false, error: "Missing API credentials in environment variables" },
      { status: 500 }
    );
  }

  try {
    // 1. Get channel uploads playlist ID
    const playlistId = channelId.startsWith("UC")
      ? "UU" + channelId.substring(2)
      : channelId;

    // 2. Fetch recent uploads playlist items
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=30&key=${apiKey}`;
    const playlistRes = await fetch(playlistUrl);
    if (!playlistRes.ok) {
      throw new Error(`YouTube API returned ${playlistRes.status}: ${playlistRes.statusText}`);
    }

    const playlistData = await playlistRes.json();
    const items = playlistData.items ?? [];

    if (items.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No VODs found on channel" });
    }

    const videoIds = items.map((item: any) => item.contentDetails.videoId);

    // 3. Fetch detailed video details (to obtain duration and detailed descriptions)
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds.join(",")}&key=${apiKey}`;
    const videosRes = await fetch(videosUrl);
    if (!videosRes.ok) {
      throw new Error(`YouTube API returned ${videosRes.status}: ${videosRes.statusText}`);
    }

    const videosData = await videosRes.json();
    const videos = videosData.items ?? [];

    let syncedCount = 0;

    // 4. Sync each video item to database
    for (const video of videos) {
      const videoId = video.id;
      const title = video.snippet.title;
      const description = video.snippet.description || "";
      const createdAt = new Date(video.snippet.publishedAt);
      const rawDuration = video.contentDetails.duration;
      const durationSec = parseIsoDuration(rawDuration);
      
      const thumbnailUrl = 
        video.snippet.thumbnails?.maxres?.url ?? 
        video.snippet.thumbnails?.high?.url ?? 
        video.snippet.thumbnails?.medium?.url ?? 
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

      // Extract games and timestamps from description
      const parsedChapters = parseChaptersFromDescription(description, title);

      // Map chapters to schema model
      const gamesData = parsedChapters.map((ch, idx, arr) => {
        const nextCh = arr[idx + 1];
        const endSec = nextCh ? nextCh.startSeconds : durationSec;

        return {
          title: title,
          gameName: ch.gameName,
          startTime: String(ch.startSeconds),
          endTime: String(endSec),
          videoId: videoId,
          videoProvider: "youtube",
        };
      });

      // Transactional Upsert VOD and cascade delete/insert game segments
      await prisma.$transaction(async (tx) => {
        await tx.vod.upsert({
          where: { id: videoId },
          update: {
            title,
            duration: String(durationSec),
            thumbnailUrl,
          },
          create: {
            id: videoId,
            title,
            createdAt,
            duration: String(durationSec),
            thumbnailUrl,
          },
        });

        // Recreate segments to ensure accurate sync adjustments
        await tx.game.deleteMany({ where: { vodId: videoId } });
        await tx.game.createMany({
          data: gamesData.map((g) => ({ ...g, vodId: videoId })),
        });
      });

      syncedCount++;
    }

    return NextResponse.json({
      success: true,
      count: syncedCount,
      message: `Successfully synchronized ${syncedCount} VODs from channel`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync VODs" },
      { status: 500 }
    );
  }
}
