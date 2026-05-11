import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteBlog,
  getBlogComments,
  getBlogReactions,
  getBlogs,
  getCategories,
  getCities,
} from '../api/blogs.js';
import { BlogSummaryCard } from '../components/BlogSummaryCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function toLookup(items, key) {
  return Object.fromEntries(items.map((item) => [item[key], item.name]));
}

function mergeInvolvement(existing, blog, role) {
  const current = existing.get(blog.blogId) ?? { blog, roles: new Set() };
  current.roles.add(role);
  existing.set(blog.blogId, current);
}

export function MyBlogsPage() {
  const { auth } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadMyBlogs() {
    setLoading(true);
    setError('');

    try {
      const [createdResponse, allResponse, categoryResponse, cityResponse] = await Promise.all([
        getBlogs({ creatorId: auth.userId }),
        getBlogs(),
        getCategories(),
        getCities(),
      ]);

      const involved = new Map();
      createdResponse.blogs?.forEach((blog) => mergeInvolvement(involved, blog, 'Created'));

      await Promise.all(
        (allResponse.blogs ?? []).map(async (blog) => {
          const [reactions, comments] = await Promise.all([
            getBlogReactions(blog.blogId).catch(() => []),
            getBlogComments(blog.blogId).catch(() => []),
          ]);

          if (reactions.some((reaction) => reaction.userId === auth.userId)) {
            mergeInvolvement(involved, blog, 'Reacted');
          }
          if (comments.some((comment) => comment.commenterId === auth.userId)) {
            mergeInvolvement(involved, blog, 'Commented');
          }
        }),
      );

      setItems([...involved.values()]);
      setCategories(categoryResponse ?? []);
      setCities(cityResponse ?? []);
    } catch (err) {
      setError(err.message || 'Could not load your blogs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.userId]);

  const categoryLookup = useMemo(() => toLookup(categories, 'categoryId'), [categories]);
  const cityLookup = useMemo(() => toLookup(cities, 'cityId'), [cities]);

  async function handleDelete(blog) {
    const confirmed = window.confirm(`Delete "${blog.title}"?`);
    if (!confirmed) return;

    try {
      await deleteBlog(blog.blogId, auth.token);
      await loadMyBlogs();
    } catch (err) {
      setError(err.message || 'Could not delete blog. Blogs with comments cannot be deleted.');
    }
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <p className="eyebrow">Managing Blogs</p>
        <h2>My blogs</h2>
      </div>

      {error && <div className="notice error">{error}</div>}
      {loading && <div className="notice">Loading your blogs...</div>}
      {!loading && items.length === 0 && <div className="notice">No created, reacted, or commented blogs yet.</div>}

      <div className="managed-list">
        {items.map(({ blog, roles }) => (
          <div className="managed-card" key={blog.blogId}>
            <div className="involvement-row">
              {[...roles].map((role) => (
                <span key={role}>{role}</span>
              ))}
            </div>
            <BlogSummaryCard blog={blog} categoryLookup={categoryLookup} cityLookup={cityLookup} />
            {blog.creatorId === auth.userId && (
              <div className="action-row">
                <Link className="button-link" to={`/blogs/${blog.blogId}/edit`}>
                  Edit
                </Link>
                <button type="button" className="danger-button" onClick={() => handleDelete(blog)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
