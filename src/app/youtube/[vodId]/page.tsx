import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ vodId: string }>;
  searchParams: Promise<{ t?: string; part?: string }>;
}

export default async function YouTubeVodAlias({ params, searchParams }: Props) {
  const { vodId } = await params;
  const { t, part } = await searchParams;
  const qs = new URLSearchParams();
  if (t) qs.set("t", t);
  if (part) qs.set("part", part);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/vods/${vodId}${query}`);
}
