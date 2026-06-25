import EditSongPage from "./EditSongPageClient";

export async function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return <EditSongPage />;
}
