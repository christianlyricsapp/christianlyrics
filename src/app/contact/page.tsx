import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Christian Lyrics team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold sm:text-4xl">
        Contact Us
      </h1>
      <p className="mt-4 text-lg text-muted">
        We would love to hear from you. Send us a message and we will get back
        to you as soon as we can.
      </p>

      <div className="glass-strong mt-8 rounded-2xl p-6 sm:p-8">
        <form className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-base font-medium text-foreground-dim"
            >
              Your Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your name"
              className="form-input-premium w-full rounded-xl px-4 py-3 text-lg text-foreground placeholder:text-muted"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-base font-medium text-foreground-dim"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              className="form-input-premium w-full rounded-xl px-4 py-3 text-lg text-foreground placeholder:text-muted"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-2 block text-base font-medium text-foreground-dim"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder="How can we help you?"
              className="form-input-premium w-full rounded-xl px-4 py-3 text-lg text-foreground placeholder:text-muted"
            />
          </div>

          <button
            type="button"
            className="btn-glow rounded-xl px-6 py-3 text-lg font-medium cursor-pointer"
          >
            Send Message
          </button>

          <p className="text-base text-muted">
            Note: This form is for display only. It will be connected in a future
            update.
          </p>
        </form>
      </div>
    </div>
  );
}
