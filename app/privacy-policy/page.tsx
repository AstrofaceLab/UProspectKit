import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", padding: "80px 24px" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <Link href="/" style={{ color: "var(--accent)", fontSize: "14px", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", marginBottom: "40px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
        
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "48px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-0.02em" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "48px", fontFamily: "var(--font-mono)" }}>Last Updated: April 24, 2026</p>

        <section style={{ display: "flex", flexDirection: "column", gap: "32px", fontFamily: "var(--font-body)", lineHeight: "1.8", color: "var(--text-secondary)" }}>
          <div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginBottom: "12px" }}>1. Information Collection</h2>
            <p>We collect information you provide directly to us when you create an account, use our proposal generation tool, or communicate with us. This includes your email and any job descriptions you paste into the tool.</p>
          </div>

          <div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginBottom: "12px" }}>2. How We Use Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, including the AI models used to generate proposals. We do not sell your personal data to third parties.</p>
          </div>

          <div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginBottom: "12px" }}>3. Data Security</h2>
            <p>We implement reasonable security measures to protect your information from unauthorized access, alteration, or destruction.</p>
          </div>

          <div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginBottom: "12px" }}>4. Cookies</h2>
            <p>We use cookies and similar technologies to track activity on our service and hold certain information to improve your user experience.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
