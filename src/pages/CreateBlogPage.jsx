import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBlog, getCategories, getCities, uploadBlogImage } from '../api/blogs.js';
import { BlogForm } from '../components/BlogForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function CreateBlogPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([getCategories(), getCities()])
      .then(([categoryResponse, cityResponse]) => {
        setCategories(categoryResponse ?? []);
        setCities(cityResponse ?? []);
      })
      .catch((err) => setError(err.message || 'Could not load blog form data.'));
  }, []);

  async function handleSubmit({ data, image }) {
    setError('');

    if (!image) {
      setError('An image is required for a new blog.');
      return;
    }

    setBusy(true);
    try {
      const created = await createBlog(data, auth.token);
      await uploadBlogImage(created.blogId, image, auth.token);
      navigate(`/blogs/${created.blogId}`);
    } catch (err) {
      setError(err.message || 'Could not create blog.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section narrow-section">
      <div className="section-header">
        <p className="eyebrow">Managing Blogs</p>
        <h2>Create a new blog</h2>
      </div>
      {error && <div className="notice error">{error}</div>}
      <BlogForm categories={categories} cities={cities} onSubmit={handleSubmit} submitLabel="Create blog" busy={busy} />
    </section>
  );
}
