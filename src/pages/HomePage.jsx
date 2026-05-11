export function HomePage({ apiBaseUrl }) {
  return (
    <section className="page-section">
      <div className="section-header">
        <p className="eyebrow">Current Focus</p>
        <h2>Build against the reference travel-blog API</h2>
      </div>

      <div className="status-grid">
        <article className="status-card">
          <h3>API target</h3>
          <p>{apiBaseUrl}</p>
        </article>
        <article className="status-card">
          <h3>Assessment priority</h3>
          <p>Correct, easy-to-use user stories first; visual polish after core flows are stable.</p>
        </article>
        <article className="status-card">
          <h3>Next input needed</h3>
          <p>The separate Learn user-stories document determines the first real feature slice.</p>
        </article>
      </div>
    </section>
  );
}
