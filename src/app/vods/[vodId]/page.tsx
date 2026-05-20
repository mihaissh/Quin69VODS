import { notFound } from "next/navigation";
import { fetchVod } from "@/lib/api";
import { VodPlayerPage } from "@/components/player/VodPlayerPage";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ vodId: string }>;
  searchParams: Promise<{ t?: string; seg?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vodId } = await params;
  try {
    const vod = await fetchVod(vodId);
    return { title: vod.title || `VOD ${vodId}` };
  } catch {
    return { title: `VOD ${vodId}` };
  }
}

export default async function VodPage({ params, searchParams }: Props) {
  const { vodId }   = await params;
  const { t, seg }  = await searchParams;

  let vod;
  try {
    vod = await fetchVod(vodId);
  } catch {
    notFound();
  }

  const timestamp = t ? parseInt(t, 10) : 0;
  const gameIdx   = seg ? Math.max(0, parseInt(seg, 10)) : 0;

  return <VodPlayerPage vod={vod} initialTimestamp={timestamp} initialGameIdx={gameIdx} />;
}
