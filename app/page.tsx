"use client";

import { useState, useEffect } from "react";
import * as Select from "@radix-ui/react-select";
import { useSession, signIn, signOut } from "next-auth/react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProposalResult {
  hook: string;
  proposal: string;
  followUp: string;
}

interface SavedProposal extends ProposalResult {
  id: string;
  jobPost: string;
  createdAt: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
          fontFamily: "var(--font-display)",
        }}
      >
        {label}
      </label>
      <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text-primary)",
            fontSize: "13px",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            fontFamily: "var(--font-body)",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!disabled)
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--border-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor =
              "var(--border)";
          }}
        >
          <Select.Value />
          <Select.Icon>
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={4}
            style={{
              background: "#242220",
              border: "1px solid var(--border-hover)",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              zIndex: 50,
              minWidth: "160px",
            }}
          >
            <Select.Viewport style={{ padding: "4px" }}>
              {options.map((opt) => (
                <Select.Item
                  key={opt}
                  value={opt}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--accent-muted)";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--text-primary)";
                  }}
                >
                  <Select.ItemText>{opt}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

function CopyButton({ text, disabled }: { text: string; disabled: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (disabled || !text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      toast.error("Failed to copy");
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={disabled}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "4px 10px",
        color: copied ? "var(--accent)" : "var(--text-secondary)",
        fontSize: "11px",
        fontFamily: "var(--font-mono)",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
          (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
          (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.color = copied ? "var(--accent)" : "var(--text-secondary)";
        (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="4"
          y="4"
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M8 4V2.5A1.5 1.5 0 0 0 6.5 1H2.5A1.5 1.5 0 0 0 1 2.5v4A1.5 1.5 0 0 0 2.5 8H4"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function OutputCard({
  label,
  tag,
  content,
  placeholder,
  loading,
  animationClass,
}: {
  label: string;
  tag: string;
  content: string | null;
  placeholder: string;
  loading: boolean;
  animationClass: string;
}) {
  return (
    <div
      className={content && !loading ? animationClass : ""}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-muted)",
              letterSpacing: "0.05em",
            }}
          >
            {tag}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "13px",
              color: "var(--text-primary)",
              letterSpacing: "0.01em",
            }}
          >
            {label}
          </span>
        </div>
        <CopyButton text={content ?? ""} disabled={!content || loading} />
      </div>

      {/* Card body */}
      <div style={{ padding: "20px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              className="shimmer"
              style={{ height: "14px", borderRadius: "4px", width: "95%" }}
            />
            <div
              className="shimmer"
              style={{ height: "14px", borderRadius: "4px", width: "80%" }}
            />
            <div
              className="shimmer"
              style={{ height: "14px", borderRadius: "4px", width: "60%" }}
            />
          </div>
        ) : content ? (
          <p
            style={{
              color: "var(--text-primary)",
              fontSize: "15px",
              lineHeight: "1.8",
              margin: 0,
              fontFamily: "var(--font-body)",
              whiteSpace: "pre-wrap",
            }}
          >
            {content}
          </p>
        ) : (
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: 0,
              fontFamily: "var(--font-body)",
              opacity: 0.8,
            }}
          >
            {placeholder}
          </p>
        )}
      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 5l4 4 4-4"
        stroke="var(--text-secondary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="22" height="22" rx="6" fill="var(--accent)" />
      <path
        d="M6 15l4-8 3 5 2-3 2 3"
        stroke="#0f0e0d"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { data: session, status } = useSession();
  const [jobPost, setJobPost] = useState("");
  const [tone, setTone] = useState("Professional");
  const [experience, setExperience] = useState("Expert");
  const [result, setResult] = useState<ProposalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedProposal[]>([]);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  
  const usageCount = session?.user?.usageCount || 0;
  const isProUser = session?.user?.isPro || false;
  const [showPaywall, setShowPaywall] = useState(false);

  const FREE_LIMIT = 5;

  // Initialize Paddle v2 on mount
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Paddle) {
      (window as any).Paddle.Initialize({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
      });
    }
  }, []);

  // Load history from API on mount/session change
  useEffect(() => {
    if (session) {
      fetch("/api/proposals")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setHistory(data);
        })
        .catch((err) => console.error("Failed to fetch history", err));
    }
  }, [session]);

  const handleSave = async () => {
    if (!result || !session || saving) return;
    setSaving(true);

    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPost,
          ...result,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      const savedProposal = await response.json();
      setHistory([savedProposal, ...history]);
      setSaveFeedback(true);
      toast.success("Proposal saved");
      setTimeout(() => setSaveFeedback(false), 2000);
    } catch (err) {
      toast.error("Failed to save proposal");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadHistory = (saved: SavedProposal) => {
    setJobPost(saved.jobPost);
    setResult({
      hook: saved.hook,
      proposal: saved.proposal,
      followUp: saved.followUp,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenerate = async () => {
    if (!jobPost.trim() || loading) return;

    // Check limit
    if (!session) {
      toast.error("Please sign in to generate proposals");
      setError("Please sign in to generate proposals");
      return;
    }

    if (!isProUser && usageCount >= FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPost, tone, experience }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Something went wrong");
      }

      const data: ProposalResult = await response.json();
      setResult(data);
      toast.success("Proposal generated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    if (upgrading) return;
    setUpgrading(true);
    try {
      if (typeof window !== "undefined" && (window as any).Paddle && session?.user?.id) {
        (window as any).Paddle.Checkout.open({
          items: [
            {
              priceId: process.env.NEXT_PUBLIC_PADDLE_PRODUCT_ID!,
              quantity: 1,
            },
          ],
          customData: {
            userId: session.user.id,
          },
        });
      } else {
        signIn("google");
      }
    } finally {
      // Reset after a short delay (checkout opens in overlay)
      setTimeout(() => setUpgrading(false), 2000);
    }
  };

  const isDisabled = loading || !jobPost.trim();

  return (
    <>
      <div
        style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "0 32px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-surface)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <LogoIcon />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "16px",
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            ProposalKit
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-muted)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              padding: "2px 7px",
              borderRadius: "4px",
              marginLeft: "4px",
            }}
          >
            v0.1 · day 1
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {status === "authenticated" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                {session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              style={{
                background: "var(--accent)",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#1a1a1a",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
          <span
            style={{
              width: "6px",
              height: "6px",
              background: "#4ade80",
              borderRadius: "50%",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-muted)",
            }}
          >
            API ready
          </span>
        </div>
      </div>
      </header>

      {/* ── Main layout ── */}
      <main
        style={{
          flex: 1,
          padding: "32px",
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Page title */}
        <div style={{ marginBottom: "36px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "42px",
              color: "var(--text-primary)",
              margin: 0,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            Write Upwork Proposals <br /> That Get Replies
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              marginTop: "12px",
              fontSize: "17px",
              fontFamily: "var(--font-body)",
              maxWidth: "600px",
              lineHeight: "1.5",
            }}
          >
            Paste a job post, choose your tone, and generate a tailored,
            human-sounding proposal in seconds.
          </p>
        </div>

        {/* 2-column layout */}
        <div
          className="main-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* ── LEFT PANEL ── */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              position: "sticky",
              top: "80px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-display)",
                  marginBottom: "8px",
                }}
              >
                Job Post
              </label>
              <textarea
                value={jobPost}
                onChange={(e) => setJobPost(e.target.value)}
                placeholder="Paste full Upwork job post here..."
                disabled={loading}
                style={{
                  width: "100%",
                  minHeight: "240px",
                  padding: "18px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  lineHeight: "1.7",
                  opacity: loading ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--border-hover)";
                  e.target.style.boxShadow = "0 0 0 2px rgba(232,160,32,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "10px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Paste the full Upwork job description for best results. More
                  detail = better proposals.
                </p>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color:
                      jobPost.length > 3000
                        ? "var(--accent)"
                        : "var(--text-muted)",
                  }}
                >
                  {jobPost.length} chars
                </span>
              </div>
            </div>

            {/* Selects row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <SelectField
                label="Tone"
                value={tone}
                onChange={setTone}
                options={["Professional", "Confident", "Conversational"]}
                disabled={loading}
              />
              <SelectField
                label="Experience Level"
                value={experience}
                onChange={setExperience}
                options={["Beginner", "Intermediate", "Expert"]}
                disabled={loading}
              />
            </div>
            
            {/* Usage limit indicator */}
            <div 
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
                {isProUser ? "✨ Unlimited Pro Access" : `${Math.max(0, FREE_LIMIT - usageCount)} free generations left`}
              </span>
              {!isProUser && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(FREE_LIMIT)].map((_, i) => (
                    <div 
                      key={i} 
                      style={{
                        width: "8px",
                        height: "4px",
                        borderRadius: "2px",
                        background: i < usageCount ? "var(--accent)" : "var(--border)",
                        opacity: i < usageCount ? 1 : 0.5
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={isDisabled}
              className={loading ? "pulse" : ""}
              style={{
                width: "100%",
                padding: "13px",
                background: isDisabled
                  ? "var(--bg-input)"
                  : "var(--accent)",
                color: isDisabled ? "var(--text-muted)" : "#0f0e0d",
                border: isDisabled ? "1px solid var(--border)" : "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                letterSpacing: "0.01em",
                cursor: isDisabled ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: isDisabled ? "none" : "0 4px 12px rgba(232,160,32,0.25)",
              }}
              onMouseEnter={(e) => {
                if (!isDisabled) {
                  (e.currentTarget as HTMLElement).style.background = "white";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(232,160,32,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled) {
                  (e.currentTarget as HTMLElement).style.background = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(232,160,32,0.25)";
                }
              }}
              onMouseDown={(e) => {
                if (!isDisabled)
                  (e.currentTarget as HTMLElement).style.transform =
                    "scale(0.98)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Generating...
                </>
              ) : !isProUser && usageCount >= FREE_LIMIT ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                  </svg>
                  Upgrade to Continue
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 1v12M1 7h12"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  Generate Proposal
                </>
              )}
            </button>

            {/* Error state */}
            {error && (
              <div
                style={{
                  padding: "12px 14px",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: "7px",
                  color: "#f87171",
                  fontSize: "13px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ⚠ {error}
              </div>
            )}

            {/* Helper tip */}
            <p
              style={{
                margin: 0,
                padding: "12px",
                fontSize: "12px",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
                lineHeight: 1.6,
                background: "rgba(255,255,255,0.03)",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>💡 Pro Tip:</span> Include
              budget, timeline, and tech stack for better results.
            </p>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Panel header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Output
              </span>
              {result && !loading && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      background: saveFeedback ? "rgba(74, 222, 128, 0.1)" : "var(--bg-card)",
                      border: `1px solid ${saveFeedback ? "#4ade80" : "var(--border)"}`,
                      borderRadius: "6px",
                      padding: "5px 12px",
                      color: saveFeedback ? "#4ade80" : "var(--text-secondary)",
                      fontSize: "12px",
                      fontFamily: "var(--font-mono)",
                      cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {saving ? (
                      <span className="spinner" style={{ width: "12px", height: "12px", borderWidth: "1.5px" }} />
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                    )}
                    {saving ? "Saving..." : saveFeedback ? "Saved!" : "Save Proposal"}
                  </button>
                  <button
                    onClick={() => {
                      const text = `HOOK\n${result.hook}\n\nPROPOSAL\n${result.proposal}\n\nFOLLOW-UP\n${result.followUp}`;
                      navigator.clipboard.writeText(text);
                      toast.success("All sections copied");
                    }}
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "5px 12px",
                      color: "var(--text-secondary)",
                      fontSize: "12px",
                      fontFamily: "var(--font-mono)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="7"
                        height="7"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M8 4V2.5A1.5 1.5 0 0 0 6.5 1H2.5A1.5 1.5 0 0 0 1 2.5v4A1.5 1.5 0 0 0 2.5 8H4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                    </svg>
                    Copy all
                  </button>
                </div>
              )}
            </div>

            {/* Micro feedback during generation */}
            {loading && (
              <div
                className="fade-up"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  background: "rgba(232,160,32,0.05)",
                  border: "1px dashed var(--accent-muted)",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              >
                <span className="spinner" style={{ borderColor: "rgba(232,160,32,0.2)", borderTopColor: "var(--accent)" }} />
                <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
                  {jobPost.length > 500 ? "Analyzing job requirements..." : "Writing custom proposal..."}
                </span>
              </div>
            )}

            <OutputCard
              label="Hook"
              tag="01 — opener"
              content={result?.hook ?? null}
              placeholder="A strong opening line that grabs the client's attention."
              loading={loading}
              animationClass="fade-up-1"
            />
            <OutputCard
              label="Proposal"
              tag="02 — body"
              content={result?.proposal ?? null}
              placeholder="A tailored proposal based on the job post and your selected tone."
              loading={loading}
              animationClass="fade-up-2"
            />
            <OutputCard
              label="Follow-up"
              tag="03 — close"
              content={result?.followUp ?? null}
              placeholder="A natural follow-up message to send if the client doesn’t respond."
              loading={loading}
              animationClass="fade-up-3"
            />

            {/* Word count footer */}
            {result && !loading && (
              <div
                className="fade-up"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "16px",
                  paddingTop: "4px",
                }}
              >
                {[
                  {
                    label: "Hook",
                    words: result.hook.split(" ").length,
                  },
                  {
                    label: "Body",
                    words: result.proposal.split(" ").length,
                  },
                  {
                    label: "Close",
                    words: result.followUp.split(" ").length,
                  },
                ].map(({ label, words }) => (
                  <span
                    key={label}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--text-muted)",
                    }}
                  >
                    {label}:{" "}
                    <span style={{ color: "var(--text-secondary)" }}>
                      {words}w
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── SAVED PROPOSALS ── */}
        <div style={{ marginTop: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "20px",
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Saved Proposals
            </h2>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--text-muted)",
                background: "var(--border)",
                padding: "2px 8px",
                borderRadius: "12px",
              }}
            >
              {history.length}
            </span>
          </div>

          {history.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                background: "var(--bg-surface)",
                border: "1px dashed var(--border)",
                borderRadius: "12px",
                color: "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
              }}
            >
              No saved proposals yet. Generate and save one to see it here!
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              {history.map((saved) => (
                <div
                  key={saved.id}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    transition: "transform 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                        marginBottom: "4px",
                      }}
                    >
                      {new Date(saved.createdAt).toLocaleDateString()}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-body)",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {saved.proposal}
                    </p>
                  </div>
                  <button
                    onClick={() => handleLoadHistory(saved)}
                    style={{
                      marginTop: "auto",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "6px",
                      color: "var(--text-secondary)",
                      fontSize: "12px",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--accent-muted)";
                      (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    }}
                  >
                    View & Load
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          Upwork Proposal Tool · Day 1 scaffold
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          AI integration → Day 2
        </span>
      </footer>

      {/* ── PAYWALL MODAL ── */}
      {showPaywall && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 14, 13, 0.85)",
            backdropFilter: "blur(12px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            animation: "fadeUp 0.3s ease-out"
          }}
        >
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--accent)",
              borderRadius: "24px",
              padding: "40px",
              maxWidth: "480px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 24px 64px rgba(232, 160, 32, 0.15)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Background glow */}
            <div 
              style={{
                position: "absolute",
                top: "-100px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "200px",
                height: "200px",
                background: "var(--accent)",
                filter: "blur(100px)",
                opacity: 0.15,
                pointerEvents: "none"
              }}
            />

            <div 
              style={{
                width: "64px",
                height: "64px",
                background: "var(--accent-muted)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                color: "var(--accent)"
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
              </svg>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "32px",
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: "16px",
                lineHeight: 1.1,
                letterSpacing: "-0.02em"
              }}
            >
              Upgrade to continue generating proposals
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "17px",
                color: "var(--text-secondary)",
                marginBottom: "32px",
                lineHeight: 1.6
              }}
            >
              You've reached your free limit. Upgrade for unlimited access and start winning more jobs today.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: upgrading ? "var(--bg-input)" : "var(--accent)",
                  color: upgrading ? "var(--text-muted)" : "#0f0e0d",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  cursor: upgrading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  if (!upgrading) {
                    (e.currentTarget as HTMLElement).style.background = "white";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!upgrading) {
                    (e.currentTarget as HTMLElement).style.background = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }
                }}
              >
                {upgrading && <span className="spinner" />}
                {upgrading ? "Opening checkout..." : "Upgrade Now"}
              </button>
              <button
                onClick={() => setShowPaywall(false)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
              >
                Maybe later
              </button>
            </div>
            
            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                {["Unlimited AI", "Priority Support", "History Sync"].map((feat) => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
