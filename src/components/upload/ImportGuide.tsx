const STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Öffne Amazons Datenschutz-Seite",
    body: (
      <>
        Gehe zu{" "}
        <a
          href="https://www.amazon.de/hz/privacy-central/data-requests/preview.html"
          target="_blank"
          rel="noreferrer noopener"
        >
          amazon.de/hz/privacy-central/data-requests
        </a>
        .
      </>
    ),
  },
  {
    title: "Wähle \u201EDeine Bestellungen\u201C",
    body: "Such in der Dropdown-Liste die Option \u201EIhre Bestellungen / Deine Bestellungen\u201C.",
  },
  {
    title: "Anfrage absenden",
    body: "Klick auf \u201EAnfrage absenden\u201C und bestätige per E-Mail.",
  },
  {
    title: "Warten (6–36 h)",
    body: "Amazon bereitet den Export vor und schickt dir eine E-Mail mit Download-Link.",
  },
  {
    title: "ZIP herunterladen",
    body: "Lade die ZIP-Datei aus der E-Mail.",
  },
  {
    title: "Hier hochladen",
    body: "Zieh die ZIP in den Bereich links — oder klick zum Auswählen. Alles bleibt in deinem Browser.",
  },
];

export function ImportGuide() {
  return (
    <div>
      <h2
        style={{
          fontSize: "var(--font-size-lg)",
          marginBottom: "var(--space-md)",
        }}
      >
        Anleitung — Bestellungen anfragen
      </h2>
      <ol
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
          paddingLeft: "var(--space-lg)",
          margin: 0,
          color: "var(--color-text-secondary)",
        }}
      >
        {STEPS.map((step, idx) => (
          <li key={idx}>
            <div style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
              Schritt {idx + 1}: {step.title}
            </div>
            <div style={{ marginTop: "var(--space-xs)", fontSize: "var(--font-size-sm)" }}>
              {step.body}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
