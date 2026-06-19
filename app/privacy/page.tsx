export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px", lineHeight: 1.7 }}>
      <h1>Demo Privacy Note</h1>
      <p>
        This demo version generates sample stories locally in the browser session.
        It does not send story settings, profile details, or free-text inputs to a
        backend service.
      </p>
      <p>
        Saving is disabled in this demo package. Any edits, profile details, or
        generated sample stories reset when the page is refreshed.
      </p>
    </main>
  );
}
