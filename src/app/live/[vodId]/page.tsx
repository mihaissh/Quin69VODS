import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ vodId: string }>;
  searchParams: Promise<{ t?: string; seg?: string }>;
}

// The /live route was used by the old project; just redirect to /vods/:id
export default async function LiveVodPage({ params, searchParams }: Props) {
  const { vodId } = await params;
  const { t, seg } = await searchParams;
  const qs = new URLSearchParams();
  if (t) qs.set("t", t);
  if (seg) qs.set("seg", seg);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/vods/${vodId}${query}`);
}
