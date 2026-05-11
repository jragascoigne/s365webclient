import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getBlog, getCategories, getCities, updateBlog, uploadBlogImage } from '../api/blogs.js';
import { BlogForm } from '../components/BlogForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function EditBlogPage() {
  const { blogId } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([getBlog(blogId), getCategories(), getCities()])
      .then(([blogResponse, categoryResponse, cityResponse]) => {
        if (!active) return;
        setBlog(blogResponse);
        setCategories(categoryResponse ?? []);
        setCities(cityResponse ?? []);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load blog.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [blogId]);

  if (!loading && blog && blog.creatorId !== auth.userId) {
    return <Navigate to={`/blogs/${blog.blogId}`} replace />;
  }

  async function handleSubmit({ data, image }) {
    setBusy(true);
    setError('');
    try {
      await updateBlog(blogId, data, auth.token);
      if (image) await uploadBlogImage(blogId, image, auth.token);
      navigate(`/blogs/${blogId}`);
    } catch (err) {
      setError(err.message || 'Could not update blog.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section narrow-section">
      <Link className="text-link" to={`/blogs/${blogId}`}>
        Back to blog
      </Link>
      <div className="section-header">
        <p className="eyebrow">Managing Blogs</p>
        <h2>Edit blog</h2>
      </div>
      {loading && <div className="notice">Loading blog...</div>}
      {error && <div className="notice error">{error}</div>}
      {blog && (
        <BlogForm
          blog={blog}
          categories={categories}
          cities={cities}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          busy={busy}
        />
      )}
    </section>
  );
}
