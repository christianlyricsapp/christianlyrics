import Link from "next/link";
import Badge from "./Badge";
import { getCategoryName, getLanguageName, type Song } from "@/lib/demo-data";

type SongCardProps = {
  song: Song;
};

export default function SongCard({ song }: SongCardProps) {
  return (
    <Link
      href={`/songs/${song.slug}`}
      className="gradient-border glow-hover group block rounded-2xl p-5 transition-all duration-300"
    >
      <h3 className="text-lg font-semibold text-foreground transition-colors duration-200 group-hover:text-primary sm:text-xl">
        {song.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-base text-muted">{song.excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="category">{getCategoryName(song.category)}</Badge>
        <Badge variant="language">{getLanguageName(song.language)}</Badge>
      </div>
    </Link>
  );
}
