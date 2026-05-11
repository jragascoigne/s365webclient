const setupSteps = [
  'Confirm the reference API base URL and copy .env.example to .env if needed.',
  'Add the Learn user stories to docs/ and rank them by marks, dependencies, and risk.',
  'Implement authentication/session handling before protected travel-blog actions.',
  'Build each story as a complete vertical slice: route, API call, validation, error state, and browser check.',
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
