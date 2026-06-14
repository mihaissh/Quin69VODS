import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playlist",
  description: "Check what song Quin69 is playing on Spotify in real-time, view playlist request history, and search request list.",
};

export default function PlaylistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
