const setupSteps = [
  'Keep VITE_API_BASE_URL pointed at the local lab API for final submission, or the hosted reference API during remote development.',
  'Complete U1-U6 first because listing, search, filters, sorting, and pagination are reused across later views.',
  'Implement U7-U9 next with blog details, comments, reaction counts, and similar blogs.',
  'Implement authentication/session handling before protected travel-blog actions in U10-U18 and U21.',
  'Build each story as a complete vertical slice: route, API call, validation, error state, access checks, and browser check.',
  'Before submission, verify npm install, npm run dev, and Chrome access from a fresh checkout.',
];

export function SetupPage() {
  return (
    <section className="page-section">
      <div className="section-header">
        <p className="eyebrow">Setup Checklist</p>
        <h2>Submission path to keep green</h2>
      </div>

      <ol className="checklist">
        {setupSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
