import Link from "next/link";

export default function TermsOfService() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", padding: "80px 24px" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <Link href="/" style={{ color: "var(--accent)", fontSize: "14px", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", marginBottom: "40px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
        
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "48px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-0.02em" }}>Terms of Service</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "48px", fontFamily: "var(--font-mono)" }}>Last Updated: April 24, 2026</p>

        <section style={{ display: "flex", flexDirection: "column", gap: "32px", fontFamily: "var(--font-body)", lineHeight: "1.8", color: "var(--text-secondary)" }}>
          <div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginBottom: "12px" }}>1. Acceptance of Terms</h2>
            <p>By accessing and using UProspectKit, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          </div>

          <div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginBottom: "12px" }}>2. Use License</h2>
            <p>UProspectKit grants you a limited, non-exclusive, non-transferable license to use our AI-powered proposal generation tools for your personal or business freelance activities on platforms like Upwork.</p>
          </div>

          <div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginBottom: "12px" }}>3. Prohibited Conduct</h2>
            <p>You agree not to use the service for any unlawful purpose or to generate content that violates the terms of service of third-party platforms (e.g., Upwork's policies on automated bidding or spam).</p>
          </div>

          <div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginBottom: "12px" }}>4. Disclaimer</h2>
            <p>The materials on UProspectKit are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
