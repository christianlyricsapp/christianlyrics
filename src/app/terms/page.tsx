import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for Christian Lyrics.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
        Terms of Use
      </h1>
      <p className="mt-4 text-base text-muted">Last updated: June 2026</p>

      <div className="mt-8 space-y-6 text-lg leading-relaxed text-foreground">
        <section>
          <h2 className="text-xl font-semibold">Acceptance of Terms</h2>
          <p className="mt-2 text-muted">
            By using Christian Lyrics (christianlyrics.app), you agree to these
            terms of use. If you do not agree, please do not use the website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Use of Content</h2>
          <p className="mt-2 text-muted">
            Song lyrics displayed on this website are provided for personal,
            church, and worship use. Lyrics may be subject to copyright by
            their respective owners. Always respect copyright laws when using
            or sharing lyrics.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Demo Content</h2>
          <p className="mt-2 text-muted">
            During development, the website may display placeholder demo lyrics
            that are not real copyrighted songs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Changes</h2>
          <p className="mt-2 text-muted">
            We may update these terms from time to time. Continued use of the
            website after changes means you accept the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
