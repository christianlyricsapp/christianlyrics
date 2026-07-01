"use client";

import { useState } from "react";
import Link from "next/link";

const drawerLinks = [
  { href: "/contact", label: "Add New Lyrics" },
  { href: "/", label: "Browse Songs" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/policies-terms", label: "Policy & Terms" },
];

function HamburgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: "18px", height: "18px" }}
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: "20px", height: "20px" }}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ width: "18px", height: "18px" }}
    >
      <path d="M12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function PhoneIcon({ style }: { style?: React.CSSProperties }) {
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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

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

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header
        className="main-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 80,
          background: "var(--card-bg)",
          borderBottom: "1px solid var(--border-color)",
          boxShadow: "none",
          height: "76px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="header-inner">
          {/* Menu Button (Left on Mobile) */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            style={{
              background: "transparent",
              border: "1.5px solid var(--border-color)",
              color: "var(--foreground-color)",
              borderRadius: "6px",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            className="header-menu-btn hamburger-btn-dark browse-reset-btn"
            aria-label="Open menu drawer"
          >
            <HamburgerIcon />
          </button>

          {/* Logo / Brand Name (Centered on Mobile) */}
          <div className="header-logo-container">
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <img
                src="/logo.png"
                alt="Logo"
                style={{ height: "30px", width: "auto", objectFit: "contain" }}
              />
            </Link>
          </div>

          {/* Admin / Login Avatar (Right on Mobile) */}
          <Link
            href="/admin/login"
            style={{
              background: "var(--bg-page)",
              border: "1.5px solid var(--border-color)",
              color: "var(--foreground-color)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            className="header-login-btn browse-reset-btn"
            aria-label="Admin login"
          >
            <UserIcon />
          </Link>
        </div>
      </header>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Side Drawer Panel */}
      <nav
        className={`side-drawer ${!isOpen ? "side-drawer-closed" : ""}`}
        aria-label="Menu drawer"
        style={{ display: isOpen ? "flex" : "none" }}
      >
        {/* Top Header inside Drawer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img
                src="/logo.png"
                alt="Logo"
                style={{ height: "22px", width: "auto", objectFit: "contain" }}
              />
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--foreground-color)", letterSpacing: "-0.015em" }}>
                Christian Lyrics
              </span>
            </div>
            <button
              type="button"
              className="drawer-close-btn browse-reset-btn"
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "1.5px solid var(--border-color)",
                color: "var(--muted-color)",
                borderRadius: "10px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              aria-label="Close menu drawer"
            >
              <CloseIcon />
            </button>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border-color)", opacity: 0.5, margin: 0 }} />

          {/* Login / Sign in premium card */}
          <Link
            href="/admin/login"
            className="drawer-login-card"
            onClick={() => setIsOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "22px", height: "22px", flexShrink: 0 }}
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, textAlign: "left" }}>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--foreground-color)" }}>
                Login / Sign in
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--muted-color)" }}>
                Access your account
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "18px", height: "18px", flexShrink: 0 }}
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>

          {/* Links list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {drawerLinks.map((link) => {
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="drawer-link-premium"
                  onClick={() => setIsOpen(false)}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Area inside Drawer (Get in Touch, Socials, Phone) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            marginTop: "auto",
            paddingTop: "24px",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <div>
            <h4
              style={{
                color: "var(--accent)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 700,
                margin: "0 0 12px",
              }}
            >
              Get in Touch
            </h4>
            <a
              href="https://wa.me/919920360570"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                color: "var(--foreground-color)",
                fontSize: "1.2rem",
                fontWeight: 700,
              }}
              className="drawer-phone-link"
            >
              <PhoneIcon style={{ width: "18px", height: "18px", color: "var(--accent)" }} />
              <span>+91 99203 60570</span>
            </a>
          </div>

          <div>
            <h4
              style={{
                color: "var(--muted-color)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
                margin: "0 0 12px",
              }}
            >
              Follow Us
            </h4>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <a
                href="https://wa.me/919920360570"
                target="_blank"
                rel="noopener noreferrer"
                className="drawer-social-icon-btn whatsapp-btn"
                aria-label="WhatsApp"
              >
                <WhatsappIcon style={{ width: "20px", height: "20px" }} />
              </a>
              <a
                href="https://facebook.com/christianpraiseworship"
                target="_blank"
                rel="noopener noreferrer"
                className="drawer-social-icon-btn facebook-btn"
                aria-label="Facebook"
              >
                <FacebookIcon style={{ width: "20px", height: "20px" }} />
              </a>
              <a
                href="https://www.youtube.com/channel/UCxmtIe7shk_5dy1077YRILg"
                target="_blank"
                rel="noopener noreferrer"
                className="drawer-social-icon-btn youtube-btn"
                aria-label="YouTube"
              >
                <YoutubeIcon style={{ width: "20px", height: "20px" }} />
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
