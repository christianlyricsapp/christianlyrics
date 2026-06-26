import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Policies & Terms",
  description: "Privacy Policy and Terms of Use for Christian Lyrics.",
};

export default function PoliciesTermsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold text-foreground sm:text-4xl text-center">
        Policies & Terms
      </h1>
      <p className="mt-2 text-base text-muted text-center">Last updated: June 2026</p>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        {/* Privacy Policy */}
        <div className="space-y-6 text-base leading-relaxed text-foreground">
          <div className="border-b border-border pb-3">
            <h2 className="text-2xl font-semibold text-primary">Privacy Policy</h2>
          </div>

          <section>
            <h3 className="text-lg font-bold">Overview</h3>
            <p className="mt-2 text-muted">
              Christian Lyrics (christianlyrics.app) respects your privacy. This
              page explains what information we may collect and how we use it.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold">Information We Collect</h3>
            <p className="mt-2 text-muted">
              At this stage, the website uses static demo content and does not
              require user accounts. When fully launched, we may collect basic
              usage data to improve the site experience.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold">Cookies</h3>
            <p className="mt-2 text-muted">
              We may use essential cookies to keep the website working properly.
              We do not use cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold">Contact</h3>
            <p className="mt-2 text-muted">
              If you have questions about this privacy policy, please visit our{" "}
              <a href="/contact" className="text-primary hover:text-primary-light">
                contact page
              </a>
              .
            </p>
          </section>
        </div>

        {/* Terms of Use */}
        <div className="space-y-6 text-base leading-relaxed text-foreground">
          <div className="border-b border-border pb-3">
            <h2 className="text-2xl font-semibold text-primary">Terms of Use</h2>
          </div>

          <section>
            <h3 className="text-lg font-bold">Acceptance of Terms</h3>
            <p className="mt-2 text-muted">
              By using Christian Lyrics (christianlyrics.app), you agree to these
              terms of use. If you do not agree, please do not use the website.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold">Use of Content</h3>
            <p className="mt-2 text-muted">
              Song lyrics displayed on this website are provided for personal,
              church, and worship use. Lyrics may be subject to copyright by
              their respective owners. Always respect copyright laws when using
              or sharing lyrics.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold">Demo Content</h3>
            <p className="mt-2 text-muted">
              During development, the website may display placeholder demo lyrics
              that are not real copyrighted songs.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold">Changes</h3>
            <p className="mt-2 text-muted">
              We may update these terms from time to time. Continued use of the
              website after changes means you accept the updated terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
