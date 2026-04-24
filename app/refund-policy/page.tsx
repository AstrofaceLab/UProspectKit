import Link from "next/link";

export default function RefundPolicy() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", padding: "80px 24px" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <Link href="/" style={{ color: "var(--accent)", fontSize: "14px", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", marginBottom: "40px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
        
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "48px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-0.02em" }}>Refund Policy</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "48px", fontFamily: "var(--font-mono)" }}>Last Updated: April 24, 2026</p>

        <section style={{ display: "flex", flexDirection: "column", gap: "32px", fontFamily: "var(--font-body)", lineHeight: "1.8", color: "var(--text-secondary)" }}>
          <div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginBottom: "12px" }}>1. Subscription Refunds</h2>
            <p>We offer a 7-day money-back guarantee for our Pro subscription if you are not satisfied with the quality of the generated proposals. To request a refund, please contact our support team.</p>
          </div>

          <div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginBottom: "12px" }}>2. Eligibility</h2>
            <p>Refunds are only eligible for the first-time purchase of a subscription. Renewal payments are generally non-refundable, but we may make exceptions in specific cases at our discretion.</p>
          </div>

          <div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginBottom: "12px" }}>3. Process</h2>
            <p>Once a refund is approved, it may take 5-10 business days to appear on your original payment method, depending on your bank's processing times.</p>
          </div>

          <div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginBottom: "12px" }}>4. Cancellation</h2>
            <p>You can cancel your subscription at any time through your account settings. Your Pro access will continue until the end of the current billing period.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
