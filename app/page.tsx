"use client";

import { useState, useEffect, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
type Profile = {
  id: string;
  name: string;
  dob: string;
  difficulty: string;
  style: string;
  genre: string;
  length: string;
  comments: string;
};

// ── Constants ──────────────────────────────────────────────────────────────────
const GENRES = [
  "Adventure","Fantasy","Animals & Nature","Space & Sci-Fi","Mystery",
  "Fairy Tale","Mythology & Legends","Ocean & Sea Creatures","Dinosaurs",
  "Superheroes","Magic School","Robots & Technology","Sports","Music & Arts",
  "Friendship","Family","Time Travel","Underwater World","Jungle Safari",
  "Arctic & Polar","Desert & Outback","Medieval Knights","Pirates",
  "Ghosts & Spooky (mild)","Holidays & Seasons","Cooking & Food",
  "Construction & Vehicles","Farm Life","City Life","Dreams & Imagination",
  "Rainforest & Jungle","Wizards & Witches","Dragons","Treasure Hunting",
  "Ancient Egypt","Enchanted Forest","Circus & Carnival","Bugs & Insects",
  "Volcanoes & Geology","Weather & Natural Wonders","Under the Sea Kingdom",
];

const STYLES = [
  "Fun & Silly","Calm & Soothing","Magical & Whimsical","Funny & Humorous",
  "Exciting & Action-Packed","Heartwarming","Mysterious","Educational",
  "Rhyming & Poetic","Suspenseful (mild)","Inspirational","Cozy & Bedtime",
  "Adventurous & Bold","Gentle & Nurturing","Quirky & Unexpected",
  "Dreamlike & Surreal","Brave & Empowering","Witty & Clever",
  "Nature & Mindful","Silly & Slapstick","Philosophical & Thoughtful",
  "Musical & Rhythmic","Spooky but Safe","Fast-Paced & Thrilling",
  "Detective & Problem-Solving","Sweet & Wholesome",
];

const LENGTHS = ["Shortest (3 min)","Short (5 min)","Medium (8 min)","Long (12 min)","Longest (15 min)"];
const DIFFICULTIES = ["Auto (based on age)","Beginner","Elementary","Intermediate","Advanced"];

const FREE_STORY_LIMIT = 999;

// Demo builds never persist access state and never show a real paywall.
const FAMILY_CODE = "demo";
const FAMILY_KEY  = "ts_family_unlocked";

function isFamilyDevice(): boolean {
  void FAMILY_KEY;
  return true;
}
function unlockFamilyDevice(): void {
  return;
}

const STORAGE_KEY = "ts_profiles_v1";
const LAST_KEY    = "ts_last_v1";
const COUNT_KEY   = "ts_story_count_v1";
const SESSION_KEY = "ts_session_v1";

// ── Helpers ────────────────────────────────────────────────────────────────────
function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function getOrCreateSessionId(): string {
  void SESSION_KEY;
  return "demo-session";
}

function calcAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age < 0 ? 0 : age;
}

function ageLabel(dob: string): string {
  const age = calcAge(dob);
  if (age === null) return "No DOB set";
  return `Age ${age}`;
}

function readingLevel(age: number | null, difficulty: string): string {
  if (difficulty !== "Auto (based on age)" && difficulty !== "") return difficulty;
  if (age === null) return "Elementary Level 2";
  if (age <= 4)  return "Pre-K – Emergent Reader";
  if (age <= 5)  return "Kindergarten Level 1";
  if (age <= 6)  return "Grade 1 Level 2";
  if (age <= 7)  return "Grade 2 Level 2";
  if (age <= 8)  return "Grade 3 Level 2";
  if (age <= 9)  return "Grade 3 Level 3";
  if (age <= 10) return "Grade 4 Level 2";
  if (age <= 11) return "Grade 5 Level 3";
  if (age <= 12) return "Grade 6 Level 3";
  if (age <= 14) return "Grade 7-8 Level 4";
  return "High School Level 4";
}

function loadProfiles(): Profile[] {
  void STORAGE_KEY;
  // Default: 6 empty slots — no personal data hardcoded
  return Array.from({ length: 6 }, () => ({
    id: makeId(), name: "", dob: "",
    difficulty: "Auto (based on age)", style: "Fun & Silly",
    genre: "Adventure", length: "Short (5 min)", comments: "",
  }));
}

function saveProfiles(profiles: Profile[]) {
  void profiles;
}

function loadLast(): Partial<Profile> {
  void LAST_KEY;
  return {};
}

function saveLast(p: Partial<Profile>) {
  void p;
}

function loadStoriesUsed(): number {
  void COUNT_KEY;
  return 0;
}

function saveStoriesUsed(n: number) {
  void n;
}

function createDemoStory(profile: { name: string; age: string; readingLevel: string }, style: string, genre: string, length: string, comments: string): string {
  const hero = profile.name || "the young explorer";
  const detail = comments ? ` They remembered your note: ${comments}.` : "";
  return [
    `${hero} opened a small glowing notebook and found a map that redrew itself whenever someone made a brave choice.`,
    `The adventure had a ${style.toLowerCase()} feeling, with a ${genre.toLowerCase()} setting and language matched to ${profile.readingLevel}.`,
    `Together with a talking lantern, ${hero} crossed a bridge of moonlight, solved a kind puzzle, and learned that the best endings are the ones you help write yourself.${detail}`,
    `This is a ${length.toLowerCase()} demo sample. In the paid version, this moment would be generated freshly for the child and their selected settings.`
  ].join("\n\n");
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const [profiles, setProfiles]     = useState<Profile[]>([]);
  const [name, setName]             = useState("");
  const [dob, setDob]               = useState("");
  const [difficulty, setDifficulty] = useState("Auto (based on age)");
  const [style, setStyle]           = useState("Fun & Silly");
  const [genre, setGenre]           = useState("Adventure");
  const [length, setLength] = useState("Short (5 min)");
  const [comments, setComments]     = useState("");
  const [story, setStory]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [status, setStatus]         = useState("Ready");
  const [storiesUsed, setStoriesUsed] = useState(0);
  const [familyUnlocked, setFamilyUnlocked] = useState(false);

  // Hidden family code entry — tap status bar 5 times to open
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [familyInput, setFamilyInput]         = useState("");
  const [familyMsg, setFamilyMsg]             = useState("");
  const statusTapCount = useRef(0);
  const statusTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Paywall modal
  const [showPaywall, setShowPaywall] = useState(false);

  // Profile editor modal
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editData, setEditData]             = useState<Profile | null>(null);

  // Profile required warning
  const [profileWarning, setProfileWarning] = useState(false);

  // Content violation warning
  const [violationMsg, setViolationMsg]       = useState("");
  const [warningsRemaining, setWarningsRemaining] = useState<number | null>(null);
  const [suspended, setSuspended]             = useState(false);

  // Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason]       = useState("");
  const [reportDetail, setReportDetail]       = useState("");
  const [reportSent, setReportSent]           = useState(false);

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = loadProfiles();
    setProfiles(saved);
    const last = loadLast();
    if (last.name)      setName(last.name);
    if (last.dob)       setDob(last.dob);
    if (last.difficulty) setDifficulty(last.difficulty);
    if (last.style)     setStyle(last.style);
    if (last.genre)     setGenre(last.genre);
    if (last.length)    setLength(last.length);
    if (last.comments !== undefined) setComments(last.comments);
    setStoriesUsed(loadStoriesUsed());
    setFamilyUnlocked(isFamilyDevice());
  }, []);

  // ── Hidden status bar tap handler ──
  const handleStatusTap = () => {
    if (familyUnlocked) return;
    statusTapCount.current += 1;
    if (statusTapTimer.current) clearTimeout(statusTapTimer.current);
    statusTapTimer.current = setTimeout(() => { statusTapCount.current = 0; }, 2000);
    if (statusTapCount.current >= 5) {
      statusTapCount.current = 0;
      setShowFamilyModal(true);
    }
  };

  const submitFamilyCode = () => {
    if (familyInput.trim().toLowerCase() === FAMILY_CODE) {
      unlockFamilyDevice();
      setFamilyUnlocked(true);
      setShowFamilyModal(false);
      setFamilyInput("");
      setStatus("✨ Family access unlocked — unlimited stories!");
    } else {
      setFamilyMsg("Incorrect code. Please try again.");
    }
  };

  const persistProfiles = (updated: Profile[]) => {
    setProfiles(updated);
    saveProfiles(updated);
  };

  const loadProfile = (profile: Profile) => {
    setName(profile.name || "");
    setDob(profile.dob || "");
    setDifficulty(profile.difficulty);
    setStyle(profile.style);
    setGenre(profile.genre);
    setLength(profile.length);
    setComments(profile.comments);
    setProfileWarning(false);
    setStatus(`Loaded ${profile.name || "profile"}`);
  };

  const startEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setEditData({ ...profile });
  };

  const saveEdit = () => {
    if (!editData) return;
    const updated = profiles.map(p => p.id === editData.id ? editData : p);
    persistProfiles(updated);
    setEditingProfile(null);
    setEditData(null);
    setStatus(`Saved ${editData.name || "profile"}`);
  };

  const cancelEdit = () => {
    setEditingProfile(null);
    setEditData(null);
  };

  const handlePressStart = (profile: Profile) => {
    pressTimer.current = setTimeout(() => startEdit(profile), 600);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; }
  };

  const generateStory = async (overrideProfile?: Profile) => {
    setViolationMsg("");

    // ── Profile gate: DOB required for age/reading level. Name is optional.
    // If no name is written in Extra Details, the API will choose a random child name.
    const usedName = overrideProfile?.name ?? name;
    const usedDob  = overrideProfile?.dob  ?? dob;
    if (!usedDob) {
      setProfileWarning(true);
      setStatus("Please add a date of birth first.");
      return;
    }
    setProfileWarning(false);

    // ── Story limit gate — skipped for family devices ──
    if (!familyUnlocked && storiesUsed >= FREE_STORY_LIMIT) {
      setShowPaywall(true);
      return;
    }

    // ── Suspended ──
    if (suspended) {
      setStatus("Your access has been suspended.");
      return;
    }

    try {
      setLoading(true);
      setStory("");
      setStatus("Generating your story...");

      const usedDifficulty = overrideProfile?.difficulty ?? difficulty;
      const usedStyle      = overrideProfile?.style      ?? style;
      const usedGenre      = overrideProfile?.genre      ?? genre;
      const usedLength     = overrideProfile?.length     ?? length;
      const usedComments   = overrideProfile?.comments   ?? comments;
      const age            = calcAge(usedDob);
      const level          = readingLevel(age, usedDifficulty);

      // Save last used settings
      saveLast({ name: usedName, dob: usedDob, difficulty: usedDifficulty, style: usedStyle, genre: usedGenre, length: usedLength, comments: usedComments });

      // ── Build payload. The API uses a name from Extra Details if supplied, otherwise it chooses a random name. ──
      const payload = {
        profile: {
          name: usedName,
          age: age !== null ? String(age) : "Unknown",
          readingLevel: level,
        },
        style: usedStyle,
        genre: usedGenre,
        length: usedLength,
        comments: usedComments,
        storiesUsed,
        familyUnlocked,
        sessionId: getOrCreateSessionId(),
        // purchaseToken: "..." — add here once Google Play Billing is live
      };

      const demoStory = createDemoStory(payload.profile, usedStyle, usedGenre, usedLength, usedComments);

      // ── Success ──
      const newCount = storiesUsed + 1;
      setStoriesUsed(newCount);
      saveStoriesUsed(newCount);
      setStory(demoStory);
      setStatus("Demo story ready. Nothing was saved or sent anywhere.");
      if (overrideProfile) loadProfile(overrideProfile);

    } catch (error: any) {
      setStory("Failed to generate story. Please try again.");
      setStatus("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const age   = calcAge(dob);
  const level = readingLevel(age, difficulty);
  const storiesLeft = Math.max(0, FREE_STORY_LIMIT - storiesUsed);

  return (
    <main className="app-shell">
      <div className="card" style={{ borderColor: "#38bdf8", background: "rgba(56,189,248,0.08)" }}>
        <p style={{ margin: 0, color: "#38bdf8", fontWeight: 600 }}>
          Demo mode: generate sample stories locally. Nothing is saved or sent to a server.
        </p>
      </div>

      {/* ── Header ── */}
      <div className="topbar">
        <h1 className="app-title">Tale Sparks</h1>
        <p>Personalised, educational bedtime stories for kids</p>
        <p className="status-text" onClick={handleStatusTap} style={{ cursor: "default", userSelect: "none" }}>
          Status: {status}
        </p>
        <p className="status-text">
          {familyUnlocked
            ? "✨ Family — unlimited stories"
            : storiesLeft > 0
              ? `✨ ${storiesLeft} free ${storiesLeft === 1 ? "story" : "stories"} remaining`
              : "✨ Free stories used — unlock more below"}
        </p>
      </div>

      {/* ── Profile warning banner ── */}
      {profileWarning && (
        <div className="card" style={{ borderColor: "#f472b6", background: "rgba(244,114,182,0.08)" }}>
          <p style={{ margin: 0, color: "#f472b6", fontWeight: 600 }}>
            👤 Please add a date of birth before generating a story. The name field is optional.
            If you want a specific name in the story, write it in Extra Details, for example: “The child’s name is Hunter.”
          </p>
        </div>
      )}

      {/* ── Content violation warning ── */}
      {violationMsg && (
        <div className="card" style={{ borderColor: "#fb923c", background: "rgba(251,146,60,0.08)" }}>
          <p style={{ margin: 0, color: "#fb923c", fontWeight: 600 }}>
            ⚠️ {violationMsg}
            {warningsRemaining !== null && warningsRemaining > 0 &&
              ` — ${warningsRemaining} warning${warningsRemaining === 1 ? "" : "s"} remaining before access is suspended.`}
          </p>
        </div>
      )}

      {/* ── Suspended banner ── */}
      {suspended && (
        <div className="card" style={{ borderColor: "#ef4444", background: "rgba(239,68,68,0.08)" }}>
          <p style={{ margin: 0, color: "#ef4444", fontWeight: 600 }}>
            🚫 Your access has been suspended due to repeated attempts to generate inappropriate content.
            This app is designed for children.
          </p>
        </div>
      )}

      {/* ── Main form ── */}
      <div className="card">
        <div className="form-row">
          <div className="form-col">
            <label>Child's Name</label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setProfileWarning(false); }}
              placeholder="Enter name..."
            />
          </div>
          <div className="form-col">
            <label>Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={e => { setDob(e.target.value); setProfileWarning(false); }}
            />
            {dob && <p className="hint">{ageLabel(dob)}</p>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <label>Reading Level Override</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
            <p className="hint">Level: {level}</p>
          </div>
          <div className="form-col">
            <label>Story Length</label>
            <select value={length} onChange={e => setLength(e.target.value)}>
              {LENGTHS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <label>Genre</label>
        <div className="tag-grid">
          {GENRES.map(g => (
            <button key={g} type="button" className={`tag ${genre === g ? "tag-active" : ""}`}
              onClick={() => setGenre(g)}>{g}</button>
          ))}
        </div>

        <label style={{ marginTop: 16 }}>Story Style</label>
        <div className="tag-grid">
          {STYLES.map(s => (
            <button key={s} type="button" className={`tag ${style === s ? "tag-active" : ""}`}
              onClick={() => setStyle(s)}>{s}</button>
          ))}
        </div>

        <label style={{ marginTop: 16 }}>Extra Details</label>
        <textarea rows={3} value={comments} onChange={e => setComments(e.target.value)}
          placeholder="Add characters, places, pets, favourite things, what you want to learn about..." />

        <button
          type="button"
          className="btn-primary"
          onClick={() => generateStory()}
          disabled={loading || suspended}
        >
          {loading ? "✨ Generating..." : familyUnlocked ? "✨ Generate Story" : storiesLeft > 0 ? `✨ Generate Story (${storiesLeft} left)` : "✨ Unlock More Stories"}
        </button>
      </div>

      {/* ── Story output ── */}
      <div className="card">
        <h2>📚 Story Output</h2>
        <p style={{ fontSize: "0.75rem", color: "#475569", margin: "0 0 8px", fontStyle: "italic" }}>
          ✨ All stories are AI generated and unique to your child
        </p>
        <div className="story-box">
          {story || "Your personalised story will appear here."}
        </div>

        {/* Action buttons — always visible */}
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          {/* Report button — required by Google Play for AI content apps */}
          <button
            type="button"
            onClick={() => { setShowReportModal(true); setReportSent(false); setReportReason(""); setReportDetail(""); }}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid rgba(248,113,113,0.4)",
              background: "rgba(248,113,113,0.08)",
              color: "#f87171",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            🚩 Report Content
          </button>
          {story && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(story);
                alert("Story copied to clipboard!");
              }}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#94a3b8",
                fontSize: "0.82rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              📋 Copy Story
            </button>
          )}
        </div>
      </div>

      {/* ── Profiles ── */}
      <div className="profiles-section">
        <h2>👦 Quick Profiles <span className="hint-inline">Hold to edit</span></h2>
        <div className="profiles-grid">
          {profiles.map(profile => (
            <div
              key={profile.id}
              className="profile-card"
              onMouseDown={() => handlePressStart(profile)}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={() => handlePressStart(profile)}
              onTouchEnd={handlePressEnd}
            >
              <div className="profile-avatar">
                {profile.name ? profile.name[0].toUpperCase() : "?"}
              </div>
              <h3>{profile.name || "Empty Slot"}</h3>
              {profile.dob && <p className="profile-age">{ageLabel(profile.dob)}</p>}
              <p className="profile-detail">{profile.genre}</p>
              <div className="profile-actions">
                <button type="button" className="btn-small"
                  onClick={() => loadProfile(profile)} disabled={loading}>Load</button>
                <button type="button" className="btn-small btn-accent"
                  onClick={() => generateStory(profile)} disabled={loading || suspended}>
                  {loading ? "..." : "Generate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editingProfile && editData && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Profile</h2>

            <label>Name</label>
            <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })}
              placeholder="Child's name" />

            <label>Date of Birth</label>
            <input type="date" value={editData.dob}
              onChange={e => setEditData({ ...editData, dob: e.target.value })} />
            {editData.dob && (
              <p className="hint">{ageLabel(editData.dob)} — age updates automatically each year</p>
            )}

            <label>Reading Level Override</label>
            <select value={editData.difficulty}
              onChange={e => setEditData({ ...editData, difficulty: e.target.value })}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>

            <label>Genre</label>
            <div className="tag-grid">
              {GENRES.map(g => (
                <button key={g} type="button"
                  className={`tag ${editData.genre === g ? "tag-active" : ""}`}
                  onClick={() => setEditData({ ...editData, genre: g })}>{g}</button>
              ))}
            </div>

            <label style={{ marginTop: 12 }}>Style</label>
            <div className="tag-grid">
              {STYLES.map(s => (
                <button key={s} type="button"
                  className={`tag ${editData.style === s ? "tag-active" : ""}`}
                  onClick={() => setEditData({ ...editData, style: s })}>{s}</button>
              ))}
            </div>

            <label style={{ marginTop: 12 }}>Length</label>
            <select value={editData.length}
              onChange={e => setEditData({ ...editData, length: e.target.value })}>
              {LENGTHS.map(l => <option key={l}>{l}</option>)}
            </select>

            <label>Extra Details</label>
            <textarea rows={3} value={editData.comments}
              onChange={e => setEditData({ ...editData, comments: e.target.value })}
              placeholder="Favourite things, characters, topics to learn about..." />

            <div className="modal-actions">
              <button type="button" className="btn-primary" onClick={saveEdit}>💾 Save Profile</button>
              <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Paywall Modal ── */}
      {showPaywall && (
        <div className="modal-overlay" onClick={() => setShowPaywall(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>✨ You've used your {FREE_STORY_LIMIT} free stories!</h2>
            <p style={{ color: "#94a3b8", marginBottom: 4 }}>
              Keep the adventure going with a story pack — each story is freshly
              created just for your child. A small contribution helps cover the AI
              costs that make every unique story possible.
            </p>
            <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: 20 }}>
              One-time purchases — no subscription required.
            </p>

            {/* Pricing tiers */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <div className="card" style={{ margin: 0, textAlign: "center", borderColor: "#0ea5e9" }}>
                <h3 style={{ margin: "0 0 4px", color: "#38bdf8" }}>5 Stories — $0.49</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
                  Perfect starter pack — less than 10¢ a story
                </p>
              </div>
              <div className="card" style={{ margin: 0, textAlign: "center", borderColor: "#a78bfa" }}>
                <h3 style={{ margin: "0 0 4px", color: "#a78bfa" }}>10 Stories — $0.79</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
                  Great value — two weeks of bedtime stories
                </p>
              </div>
              <div className="card" style={{ margin: 0, textAlign: "center", borderColor: "#f472b6" }}>
                <h3 style={{ margin: "0 0 4px", color: "#f472b6" }}>30 Stories — $1.49</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
                  Best value — a full month of nightly adventures
                </p>
              </div>
            </div>

            {/* Placeholder button — wire to Google Play Billing when ready */}
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                // TODO: trigger Google Play Billing purchase flow here
                alert("Purchase flow coming soon! Check back after the next update.");
              }}
            >
              🛒 Unlock Stories
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowPaywall(false)}>
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* ── Family Code Modal ── */}
      {showFamilyModal && (
        <div className="modal-overlay" onClick={() => { setShowFamilyModal(false); setFamilyInput(""); setFamilyMsg(""); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Family Access</h2>
            <p style={{ color: "#94a3b8", marginBottom: 16 }}>
              Enter your family code for unlimited stories.
            </p>
            <label>Code</label>
            <input
              type="password"
              value={familyInput}
              onChange={e => { setFamilyInput(e.target.value); setFamilyMsg(""); }}
              onKeyDown={e => e.key === "Enter" && submitFamilyCode()}
              placeholder="Enter code..."
              autoFocus
            />
            {familyMsg && (
              <p style={{ color: "#f472b6", fontSize: "0.85rem", marginTop: 8 }}>{familyMsg}</p>
            )}
            <div className="modal-actions">
              <button type="button" className="btn-primary" onClick={submitFamilyCode}>
                Unlock
              </button>
              <button type="button" className="btn-secondary"
                onClick={() => { setShowFamilyModal(false); setFamilyInput(""); setFamilyMsg(""); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Report Content Modal — required by Google Play for AI apps ── */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {reportSent ? (
              <>
                <h2>✅ Report Received</h2>
                <p style={{ color: "#94a3b8", marginBottom: 20 }}>
                  Thank you for your report. We take all feedback seriously and will
                  use it to improve our content filtering to keep Tale Sparks safe
                  for all children.
                </p>
                <button type="button" className="btn-primary"
                  onClick={() => setShowReportModal(false)}>
                  Close
                </button>
              </>
            ) : (
              <>
                <h2>🚩 Report Content</h2>
                <p style={{ color: "#94a3b8", marginBottom: 16 }}>
                  If a generated story contains anything inappropriate or not suitable
                  for children, please let us know. Your report is anonymous and helps
                  us keep this app safe.
                </p>

                <label>Reason for report</label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="inappropriate">Inappropriate content for children</option>
                  <option value="violent">Violent or scary content</option>
                  <option value="sexual">Sexual or adult content</option>
                  <option value="hateful">Hateful or discriminatory content</option>
                  <option value="other">Other concern</option>
                </select>

                <label style={{ marginTop: 12 }}>Additional details (optional)</label>
                <textarea
                  rows={3}
                  value={reportDetail}
                  onChange={e => setReportDetail(e.target.value)}
                  placeholder="Describe what was inappropriate in the story..."
                />

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={!reportReason}
                    onClick={() => {
                      // Log report anonymously — in production connect to your backend
                      console.log("[REPORT]", {
                        reason: reportReason,
                        time: new Date().toISOString(),
                        // detail intentionally not logged to protect privacy
                      });
                      setReportSent(true);
                    }}
                  >
                    Submit Report
                  </button>
                  <button type="button" className="btn-secondary"
                    onClick={() => setShowReportModal(false)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
