import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Christian Lyrics.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-4 text-base text-muted">Last updated: June 2026</p>

      <div className="mt-8 space-y-6 text-lg leading-relaxed text-foreground">
        <section>
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="mt-2 text-muted">
            Christian Lyrics (christianlyrics.app) respects your privacy. This
            page explains what information we may collect and how we use it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <p className="mt-2 text-muted">
            At this stage, the website uses static demo content and does not
            require user accounts. When fully launched, we may collect basic
            usage data to improve the site experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Cookies</h2>
          <p className="mt-2 text-muted">
            We may use essential cookies to keep the website working properly.
            We do not use cookies for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-2 text-muted">
            If you have questions about this privacy policy, please visit our{" "}
            <a href="/contact" className="text-primary hover:text-primary-light">
              contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
