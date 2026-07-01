import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/contact", label: "Add New Lyrics" },
  { href: "/policies-terms", label: "Policies & Terms" },
];

/* ─── Social Icons SVG Components ─────────────────── */
function FacebookIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
      <polygon points="10 15 15 12 10 9" />
    </svg>
  );
}

function WhatsappIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0A2540",
        borderTop: "1px solid #14355a",
        padding: "32px 24px",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Top Row: Brand on Left, Social Icons on Right */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Brand Info */}
          <div>
            <p
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "-0.015em",
              }}
            >
              Christian Lyrics
            </p>
          </div>

          {/* Social Icons / christianpraiseworship */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              color: "#8fa8c4",
              fontSize: "0.85rem",
            }}
          >
            <a
              href="https://facebook.com/christianpraiseworship"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Facebook"
            >
              <FacebookIcon style={{ width: "18px", height: "18px" }} />
            </a>
            <a
              href="https://instagram.com/christianpraiseworship"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Instagram"
            >
              <InstagramIcon style={{ width: "18px", height: "18px" }} />
            </a>
            <a
              href="https://www.youtube.com/channel/UCxmtIe7shk_5dy1077YRILg"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="YouTube"
            >
              <YoutubeIcon style={{ width: "18px", height: "18px" }} />
            </a>
          </div>
        </div>

        {/* Separator line */}
        <hr style={{ border: "none", borderTop: "1px solid #14355a", margin: 0 }} />

        {/* Bottom Row: Links and Copyright */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px 24px",
          }}
        >
          {/* Nav Links */}
          <nav
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px 24px",
              alignItems: "center",
            }}
            aria-label="Footer"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#C7DDF2",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
                className="footer-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p
            style={{
              fontSize: "0.8rem",
              color: "#8fa8c4",
              margin: 0,
            }}
          >
            © 2026 Christian Lyrics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
