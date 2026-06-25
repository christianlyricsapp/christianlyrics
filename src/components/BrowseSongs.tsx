"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategoryName, getLanguageName, type Song } from "@/lib/demo-data";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ALL_KEY = "*";
const HASH_KEY = "#";

const CATEGORIES = ["praise", "worship", "communion", "christmas", "new_year", "easter", "good_friday", "revival", "youth", "funeral"];
const CATEGORY_NAMES: Record<string, string> = {
  praise: "Praise",
  worship: "Worship",
  communion: "Communion",
  christmas: "Christmas",
  new_year: "New Year",
  easter: "Easter",
  good_friday: "Good Friday",
  revival: "Revival",
  youth: "Youth",
  funeral: "Funeral"
};

const LANGUAGES = ["english", "assamese", "bengali", "bodo", "dogri", "gujarati", "hindi", "kannada", "kashmiri", "konkani", "maithili", "malayalam", "manipuri", "marathi", "nepali", "odia", "punjabi", "sanskrit", "santali", "sindhi", "tamil", "telugu", "urdu"];
const LANGUAGE_NAMES: Record<string, string> = {
  english: "English",
  assamese: "Assamese",
  bengali: "Bengali",
  bodo: "Bodo",
  dogri: "Dogri",
  gujarati: "Gujarati",
  hindi: "Hindi",
  kannada: "Kannada",
  kashmiri: "Kashmiri",
  konkani: "Konkani",
  maithili: "Maithili",
  malayalam: "Malayalam",
  manipuri: "Manipuri",
  marathi: "Marathi",
  nepali: "Nepali",
  odia: "Odia",
  punjabi: "Punjabi",
  sanskrit: "Sanskrit",
  santali: "Santali",
  sindhi: "Sindhi",
  tamil: "Tamil",
  telugu: "Telugu",
  urdu: "Urdu"
};

function getFirstChar(title: string): string {
  const first = title.charAt(0).toUpperCase();
  if (/[A-Z]/.test(first)) return first;
  return HASH_KEY;
}

/* ─── Search Icon SVG ──────────────────────────────── */
function SearchIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/* ─── Music Note Icon SVG ──────────────────────────── */
function MusicIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export default function BrowseSongs({ initialSongs = [] }: { initialSongs?: Song[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("category");
  const initialLanguage = searchParams.get("language");
  const initialArtist = searchParams.get("artist");
  const initialLetter = searchParams.get("letter");
  const initialSearch = searchParams.get("search");

  const [isLoading, setIsLoading] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string>(() => initialLetter || ALL_KEY);
  const [searchQuery, setSearchQuery] = useState(() => initialSearch || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    initialCategory ? [initialCategory] : []
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() =>
    initialLanguage ? [initialLanguage] : []
  );
  const [selectedArtists, setSelectedArtists] = useState<string[]>(() =>
    initialArtist ? [initialArtist] : []
  );
  const [artistSearchQuery, setArtistSearchQuery] = useState("");
  const [typeSearchQuery, setTypeSearchQuery] = useState("");
  const [langSearchQuery, setLangSearchQuery] = useState("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const category = searchParams.get("category");
    const language = searchParams.get("language");
    const artist = searchParams.get("artist");
    const letter = searchParams.get("letter");
    const search = searchParams.get("search");

    setSelectedCategories(category ? [category] : []);
    setSelectedLanguages(language ? [language] : []);
    setSelectedArtists(artist ? [artist] : []);
    setActiveLetter(letter || ALL_KEY);
    setSearchQuery(search || "");
  }, [searchParams]);

  /* Build alphabet sets representing items available in the total dataset */
  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    initialSongs.forEach((s) => set.add(getFirstChar(s.title)));
    return set;
  }, [initialSongs]);

  /* Extract unique artists list dynamically */
  const allArtists = useMemo(() => {
    const set = new Set<string>();
    initialSongs.forEach((s) => {
      if (s.artist) set.add(s.artist);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [initialSongs]);

  /* Filter artists dynamically inside the filter section search box */
  const filteredUniqueArtists = useMemo(() => {
    const query = artistSearchQuery.toLowerCase().trim();
    if (!query) return allArtists;
    return allArtists.filter((art) => art.toLowerCase().includes(query));
  }, [allArtists, artistSearchQuery]);

  /* Filter category types dynamically inside Type filter section search box */
  const filteredCategories = useMemo(() => {
    const query = typeSearchQuery.toLowerCase().trim();
    if (!query) return CATEGORIES;
    return CATEGORIES.filter((cat) => CATEGORY_NAMES[cat].toLowerCase().includes(query));
  }, [typeSearchQuery]);

  /* Filter languages dynamically inside Language filter section search box */
  const filteredLanguages = useMemo(() => {
    const query = langSearchQuery.toLowerCase().trim();
    if (!query) return LANGUAGES;
    return LANGUAGES.filter((lang) => LANGUAGE_NAMES[lang].toLowerCase().includes(query));
  }, [langSearchQuery]);

  /* Filter songs list dynamically in real-time */
  const filteredSongs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return initialSongs.filter((song: Song) => {
      // Letter filter
      if (activeLetter !== ALL_KEY) {
        const songChar = getFirstChar(song.title);
        if (activeLetter === HASH_KEY) {
          if (songChar !== HASH_KEY) return false;
        } else {
          if (songChar !== activeLetter) return false;
        }
      }

      // Categories multi-select filter
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(song.category)) return false;
      }

      // Languages multi-select filter
      if (selectedLanguages.length > 0) {
        if (!selectedLanguages.includes(song.language)) return false;
      }

      // Artists multi-select filter
      if (selectedArtists.length > 0) {
        if (!song.artist || !selectedArtists.includes(song.artist)) return false;
      }

      // Main search query filter
      if (query) {
        const categoryName = getCategoryName(song.category).toLowerCase();
        const languageName = getLanguageName(song.language).toLowerCase();
        const matchesSearch =
          song.title.toLowerCase().includes(query) ||
          song.excerpt.toLowerCase().includes(query) ||
          (song.artist?.toLowerCase().includes(query) ?? false) ||
          categoryName.includes(query) ||
          languageName.includes(query) ||
          song.lyrics.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [activeLetter, selectedCategories, selectedLanguages, selectedArtists, searchQuery]);

  /* Group filtered songs alphabetically */
  const groupedSongs = useMemo(() => {
    const groups: Record<string, Song[]> = {};
    
    const sorted = [...filteredSongs].sort((a, b) => a.title.localeCompare(b.title));
    
    sorted.forEach((song) => {
      const char = getFirstChar(song.title);
      if (!groups[char]) {
        groups[char] = [];
      }
      groups[char].push(song);
    });
    
    const keys = Object.keys(groups).sort((a, b) => {
      if (a === HASH_KEY) return 1;
      if (b === HASH_KEY) return -1;
      return a.localeCompare(b);
    });
    
    return { keys, groups };
  }, [filteredSongs]);

  /* Filter toggling helpers */
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]
    );
  };

  const handleArtistToggle = (artist: string) => {
    setSelectedArtists((prev) =>
      prev.includes(artist) ? prev.filter((a) => a !== artist) : [...prev, artist]
    );
  };

  const handleLetterClick = (letter: string) => {
    setActiveLetter(letter);
  };

  const handleClearAll = () => {
    setActiveLetter(ALL_KEY);
    setSelectedCategories([]);
    setSelectedLanguages([]);
    setSelectedArtists([]);
    setSearchQuery("");
    setArtistSearchQuery("");
    setTypeSearchQuery("");
    setLangSearchQuery("");
  };

  const totalActiveFiltersCount =
    (activeLetter !== ALL_KEY ? 1 : 0) +
    selectedCategories.length +
    selectedLanguages.length +
    selectedArtists.length;

  const hasActiveFilters = totalActiveFiltersCount > 0 || searchQuery.trim() !== "";

  /* Render standard filter section contents */
  const renderFiltersPanel = () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Sidebar header: Filters title and Clear Filters button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "12px" }}>
        <span style={{ fontSize: "1.6rem", fontFamily: "var(--font-stack)", fontWeight: 700, color: "#ffffff" }}>Filters</span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        )}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #14355a", margin: "8px 0 16px" }} />

      {/* 1. Category Types Selection */}
      <div className="filter-section-card">
        <h3 className="filter-section-title" id="filter-type-title">Type</h3>
        <div
          role="group"
          aria-labelledby="filter-type-title"
          className="filter-scroll-list"
        >
          {filteredCategories.map((cat) => {
            const checked = selectedCategories.includes(cat);
            return (
              <label key={cat} className={`filter-checkbox-label ${checked ? "is-checked" : ""}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCategoryToggle(cat)}
                  className="filter-checkbox-input"
                />
                <span>{CATEGORY_NAMES[cat]}</span>
              </label>
            );
          })}
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #14355a", opacity: 0.6, margin: "16px 0" }} />

      {/* 2. Languages Selection */}
      <div className="filter-section-card">
        <h3 className="filter-section-title" id="filter-lang-title">Language</h3>
        <div
          role="group"
          aria-labelledby="filter-lang-title"
          className="filter-scroll-list"
        >
          {filteredLanguages.map((lang) => {
            const checked = selectedLanguages.includes(lang);
            return (
              <label key={lang} className={`filter-checkbox-label ${checked ? "is-checked" : ""}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleLanguageToggle(lang)}
                  className="filter-checkbox-input"
                />
                <span>{LANGUAGE_NAMES[lang]}</span>
              </label>
            );
          })}
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #14355a", opacity: 0.6, margin: "16px 0" }} />

      {/* 3. Artists Selection */}
      <div className="filter-section-card">
        <h3 className="filter-section-title" id="filter-artist-title">Artists / Bands / Churches</h3>
        <div
          role="group"
          aria-labelledby="filter-artist-title"
          style={{ display: "flex", flexDirection: "column" }}
        >
          {/* Sub-search inside Artists section */}
          <div style={{ position: "relative", marginBottom: "10px" }}>
            <SearchIcon
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "14px",
                height: "14px",
                color: "#8fa8c4",
                pointerEvents: "none",
              }}
            />
            <input
              type="search"
              value={artistSearchQuery}
              onChange={(e) => setArtistSearchQuery(e.target.value)}
              placeholder="Search artist, band or church..."
              className="filter-search-input"
              style={{ paddingLeft: "32px", height: "36px", borderRadius: "10px" }}
            />
          </div>

          {/* Scroll list */}
          <div className="filter-scroll-list">
            {filteredUniqueArtists.map((art) => {
              const checked = selectedArtists.includes(art);
              return (
                <label key={art} className={`filter-checkbox-label ${checked ? "is-checked" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleArtistToggle(art)}
                    className="filter-checkbox-input"
                  />
                  <span>{art}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  /* Loading State */
  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "65vh" }}>
        <p style={{ color: "#3a5a7c", fontWeight: 600, fontSize: "1.1rem" }}>Loading songs list…</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#F8FBFF", minHeight: "100vh", paddingInline: "24px" }}>
      <div
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: "20px 0 24px",
        }}
      >
        {/* ─── Layout Grid (Two Columns Desktop) ────────── */}
        <div className="browse-layout">
          
          {/* 1. Left Sidebar Filter Panel ────────────────── */}
          <aside className="browse-sidebar" aria-label="Filters sidebar">
            {renderFiltersPanel()}
          </aside>

          {/* 2. Main Content Area (Right Column) ────────── */}
          <main style={{ flex: 1, minWidth: 0 }} aria-label="Songs list browser">
            
            {/* ─── Centered Top Hero Section (Moved inside main to let filters align at top) ────────────────── */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                marginBottom: "40px",
              }}
            >
              <h1
                style={{
                  fontSize: "2.4rem",
                  fontWeight: 800,
                  color: "#0A2540",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Christian Lyrics Library
              </h1>
              <span className="title-accent-underline" style={{ margin: "12px auto" }} />
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "#355C85",
                  margin: "4px 0 28px",
                  maxWidth: "600px",
                }}
              >
                Find Christian lyrics by song, artist, language, or theme.
              </p>

              {/* Search bar (centered and highlighted) */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "800px",
                  position: "relative",
                  marginBottom: "24px",
                }}
              >
                <SearchIcon
                  style={{
                    position: "absolute",
                    left: "20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "20px",
                    height: "20px",
                    color: "#8fa8c4",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search songs, lyrics, artist, language, or theme…"
                  className="browse-search-input"
                  id="browse-search"
                  aria-label="Search songs"
                  style={{ paddingLeft: "54px" }}
                />
              </div>

              {/* A–Z Alphabet filter bar */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "6px",
                  maxWidth: "900px",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleLetterClick(ALL_KEY)}
                  className={`browse-alpha-btn ${activeLetter === ALL_KEY ? "browse-alpha-active" : ""}`}
                  style={{ width: "auto", paddingInline: "14px" }}
                  aria-label="Show all songs"
                  aria-pressed={activeLetter === ALL_KEY}
                >
                  All
                </button>

                {ALPHABET.map((letter) => {
                  const hasItems = availableLetters.has(letter);
                  const isActive = activeLetter === letter;

                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => hasItems && handleLetterClick(letter)}
                      className={`browse-alpha-btn ${
                        isActive
                          ? "browse-alpha-active"
                          : !hasItems
                          ? "browse-alpha-disabled"
                          : ""
                      }`}
                      aria-label={`Filter by letter ${letter}`}
                      aria-pressed={isActive}
                      aria-disabled={!hasItems}
                    >
                      {letter}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => availableLetters.has(HASH_KEY) && handleLetterClick(HASH_KEY)}
                  className={`browse-alpha-btn ${
                    activeLetter === HASH_KEY
                      ? "browse-alpha-active"
                      : !availableLetters.has(HASH_KEY)
                      ? "browse-alpha-disabled"
                      : ""
                  }`}
                  aria-label="Filter by non-alphabetic characters"
                  aria-pressed={activeLetter === HASH_KEY}
                  aria-disabled={!availableLetters.has(HASH_KEY)}
                >
                  #
                </button>

                <button
                  type="button"
                  onClick={() => handleLetterClick(ALL_KEY)}
                  className={`browse-alpha-btn ${activeLetter === ALL_KEY ? "browse-alpha-active" : ""}`}
                  aria-label="Filter by all songs"
                  aria-pressed={activeLetter === ALL_KEY}
                >
                  *
                </button>
              </div>
            </div>

            {/* Subtle separator line */}
            <hr className="browse-divider" style={{ marginBlock: "32px", opacity: 0.7 }} />
            
            {/* ─── Mobile Filters Drawer Toggle ─────────── */}
            <div className="mobile-filter-bar">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                className="mobile-filter-toggle-btn"
                aria-expanded={isMobileFiltersOpen}
                aria-controls="mobile-filter-tray"
              >
                ⚙ Filters {totalActiveFiltersCount > 0 ? `(${totalActiveFiltersCount})` : ""}
              </button>
            </div>

            {isMobileFiltersOpen && (
              <div id="mobile-filter-tray" className="mobile-filter-drawer" aria-label="Mobile filters">
                {renderFiltersPanel()}
              </div>
            )}

            {/* ─── Active Filter Pills Bar ────────────── */}
            {hasActiveFilters && (
              <div className="active-filters-bar" aria-label="Active filters">
                {activeLetter !== ALL_KEY && (
                  <span className="active-filter-pill">
                    {activeLetter === HASH_KEY ? "#" : activeLetter}
                    <button
                      type="button"
                      onClick={() => setActiveLetter(ALL_KEY)}
                      className="active-filter-remove"
                      aria-label="Remove letter filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
                
                {selectedCategories.map((cat) => (
                  <span key={cat} className="active-filter-pill">
                    {CATEGORY_NAMES[cat]}
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(cat)}
                      className="active-filter-remove"
                      aria-label={`Remove category filter for ${CATEGORY_NAMES[cat]}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {selectedLanguages.map((lang) => (
                  <span key={lang} className="active-filter-pill">
                    {LANGUAGE_NAMES[lang]}
                    <button
                      type="button"
                      onClick={() => handleLanguageToggle(lang)}
                      className="active-filter-remove"
                      aria-label={`Remove language filter for ${LANGUAGE_NAMES[lang]}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {selectedArtists.map((art) => (
                  <span key={art} className="active-filter-pill">
                    {art}
                    <button
                      type="button"
                      onClick={() => handleArtistToggle(art)}
                      className="active-filter-remove"
                      aria-label={`Remove artist filter for ${art}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {searchQuery.trim() !== "" && (
                  <span className="active-filter-pill">
                    &ldquo;{searchQuery.trim()}&rdquo;
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="active-filter-remove"
                      aria-label="Remove search filter"
                    >
                      ✕
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="clear-filters-btn"
                  style={{ borderRadius: "20px", padding: "4px 12px", fontSize: "0.8rem" }}
                  aria-label="Clear all filters"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* ─── Result Counter Info ─────────────────── */}
            <div style={{ marginBottom: "16px" }}>
              <span className="browse-result-count" style={{ fontSize: "0.9rem", color: "#3a5a7c", fontWeight: 700 }}>
                {filteredSongs.length} song{filteredSongs.length !== 1 ? "s" : ""} found
              </span>
            </div>

            {/* ─── Song Listings Table ─── */}
            {filteredSongs.length > 0 ? (
              <div className="table-responsive">
                <table className="songs-table">
                  <tbody>
                    {[...filteredSongs]
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map((song, index) => (
                        <tr
                          key={song.slug}
                          onClick={() => router.push(`/songs/${song.slug}`)}
                          style={{ cursor: "pointer" }}
                        >
                          <td style={{ width: "60px", color: "var(--accent)", fontWeight: 700, textAlign: "center", paddingRight: 0 }}>
                            {index + 1}.
                          </td>
                          <td>
                            <Link href={`/songs/${song.slug}`} className="song-table-title-link" style={{ fontSize: "1.05rem" }}>
                              {song.title}
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ─── Empty State ──────────────────────────── */
              <div className="browse-empty">
                <MusicIcon
                  style={{
                    width: "48px",
                    height: "48px",
                    margin: "0 auto 16px",
                    color: "#8fa8c4",
                  }}
                />
                <p
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  No songs found
                </p>
                <p style={{ fontSize: "0.95rem" }}>
                  Try changing the search or filters.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="browse-reset-btn"
                  style={{ marginTop: "20px" }}
                >
                  Show All Songs
                </button>
              </div>
            )}
          </main>

        </div>
      </div>

      {/* ─── Floating Back to Top Button ──────────────── */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="back-to-top-btn"
          style={{
            position: "fixed",
            bottom: "90px",
            right: "28px",
            zIndex: 90,
            background: "#0A2540",
            color: "#ffffff",
            border: "none",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            fontSize: "1.1rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(8, 43, 102, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Back to top of list"
        >
          ↑
        </button>
      )}
    </div>
  );
}
