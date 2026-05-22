import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBlog, getBlogs, getCategories, getCities, uploadBlogImage } from '../api/blogs';
import { BlogForm } from '../components/BlogForm';
import { Notice } from '../components/Notice';
import { useAuth } from '../stores/auth';

export function CreateBlogPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [seriesOptions, setSeriesOptions] = useState([]);
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

  useEffect(() => {
    if (!auth?.userId) return;

    getBlogs({ creatorId: auth.userId })
      .then((blogResponse) => {
        setSeriesOptions(
          [
            ...new Set(
              (blogResponse.blogs ?? [])
                .map((blog) => String(blog.series ?? '').trim())
                .filter(Boolean),
            ),
          ].sort((left, right) => String(left).localeCompare(String(right))),
        );
      })
      .catch(() => setSeriesOptions([]));
  }, [auth?.userId]);

  async function handleSubmit({ data, image }) {
    setError('');

    if (!image) {
      setError('An image is required for a new blog.');
      return;
    }

    setBusy(true);
    try {
      if (!auth?.token) {
        setError('Please log in again before creating a blog.');
        return;
      }

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
        <h2>Create a new blog</h2>
      </div>
      {error && <Notice error>{error}</Notice>}
      <BlogForm
        categories={categories}
        cities={cities}
        seriesOptions={seriesOptions}
        imageRequired
        onSubmit={handleSubmit}
        submitLabel="Create blog"
        busy={busy}
      />
    </section>
  );
}
