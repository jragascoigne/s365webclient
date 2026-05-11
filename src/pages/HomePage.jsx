import { BlogBrowser } from '../components/BlogBrowser.jsx';

export function HomePage({ apiBaseUrl }) {
  return (
    <>
      <section className="page-section intro-section">
        <div className="section-header">
          <p className="eyebrow">Current Focus</p>
          <h2>Search, filter, sort, and page through travel posts</h2>
        </div>

        <div className="status-grid">
          <article className="status-card">
            <h3>API target</h3>
            <p>{apiBaseUrl}</p>
          </article>
          <article className="status-card">
            <h3>First milestone</h3>
            <p>U1-U6 blog discovery flows are the foundation for most later stories.</p>
          </article>
          <article className="status-card">
            <h3>Next slice</h3>
            <p>Blog detail pages with comments, reaction counts, and similar posts.</p>
          </article>
        </div>
      </section>

      <section className="page-section browser-section">
        <p className="eyebrow">Current Focus</p>
        <BlogBrowser />
      </section>
    </>
  );
}
