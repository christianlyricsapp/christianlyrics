import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Christian Lyrics and our mission.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold sm:text-4xl" style={{ color: "#0A2540" }}>
        About Christian Lyrics
      </h1>

      <div className="glass-strong mt-8 rounded-2xl p-6 sm:p-8">
        <div className="space-y-6 text-lg leading-relaxed text-foreground-dim">
          <p>
            Christian Lyrics is a simple, peaceful website created to help churches,
            families, and individuals find Christian song lyrics easily.
          </p>
          <p>
            Whether you are preparing for Sunday worship, a communion service, or
            a home prayer time, our goal is to make lyrics easy to read, search,
            and share — especially for elderly users and people of all ages.
          </p>
          <p>
            We focus on praise, worship, and communion songs in English, Hindi,
            and Marathi. More languages and features will be added over time.
          </p>
          <p className="text-muted">
            This website is currently in development with demo content. Real song
            data will be added in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
