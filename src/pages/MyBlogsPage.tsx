import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteBlog,
  getBlogComments,
  getBlogReactions,
  getBlogs,
  getCategories,
  getCities,
} from '../api/blogs';
import { BlogSummaryCard } from '../components/BlogSummaryCard';
import { Notice } from '../components/Notice';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useAuth } from '../stores/auth';

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
  const [deleteTarget, setDeleteTarget] = useState(null);

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
    try {
      await deleteBlog(blog.blogId, auth.token);
      setDeleteTarget(null);
      await loadMyBlogs();
    } catch (err) {
      setError(err.message || 'Could not delete blog. Blogs with comments cannot be deleted.');
    }
  }

  return (
    <section className="page-section narrow-section">
      <div className="section-header">
        <h2>My blogs</h2>
      </div>

      <div className="managed-panel">
        {error && <Notice error>{error}</Notice>}
        {loading && <Notice>Loading your blogs...</Notice>}
        {!loading && items.length === 0 && <Notice>No created, reacted, or commented blogs yet.</Notice>}

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
                  <Button type="button" variant="destructive" onClick={() => setDeleteTarget(blog)}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete blog?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `This will permanently delete "${deleteTarget.title}". Blogs with comments cannot be deleted.`
                : 'This will permanently delete the selected blog.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
