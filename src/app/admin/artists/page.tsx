import type { Metadata } from "next";
import ArtistsList from "./ArtistsList";

export const metadata: Metadata = {
  title: "Artists & Musicians",
};

export default function ArtistsPage() {
  return <ArtistsList />;
}
