import { useEffect, useMemo, useState } from 'react';
import { validateImage } from '../utils/validation.js';

function toInitialCategoryIds(blog) {
  return blog?.categoryIds?.map(String) ?? [];
}

export function BlogForm({ blog, categories, cities, onSubmit, submitLabel, busy }) {
  const [title, setTitle] = useState(blog?.title ?? '');
  const [description, setDescription] = useState(blog?.description ?? '');
  const [cityId, setCityId] = useState(blog?.cityId ? String(blog.cityId) : '');
  const [categoryIds, setCategoryIds] = useState(toInitialCategoryIds(blog));
  const [series, setSeries] = useState(blog?.series ?? '');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const hasExistingSeries = Boolean(blog?.series);

  useEffect(() => {
    setTitle(blog?.title ?? '');
    setDescription(blog?.description ?? '');
    setCityId(blog?.cityId ? String(blog.cityId) : '');
    setCategoryIds(toInitialCategoryIds(blog));
    setSeries(blog?.series ?? '');
    setImage(null);
  }, [blog]);

  const categoryOptions = useMemo(() => categories ?? [], [categories]);

  function toggleCategory(value) {
    setCategoryIds((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    const imageError = validateImage(image);

    if (!title.trim() || !description.trim() || !cityId || categoryIds.length === 0) {
      setError('Title, description, city, and at least one category are required.');
      return;
    }

    if (imageError) {
      setError(imageError);
      return;
    }

    setError('');
    onSubmit({
      data: {
        title: title.trim(),
        description: description.trim(),
        cityId: Number(cityId),
        categoryIds: categoryIds.map(Number),
        ...(series.trim() ? { series: series.trim() } : {}),
      },
      image,
    });
  }

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      {error && <div className="notice error">{error}</div>}

      <div className="control-group">
        <label htmlFor="blog-title">Title</label>
        <input id="blog-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
      </div>

      <div className="control-group">
        <label htmlFor="blog-description">Description</label>
        <textarea
          id="blog-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows="7"
          required
        />
      </div>

      <div className="split-controls">
        <div className="control-group">
          <label htmlFor="blog-city">City</label>
          <select id="blog-city" value={cityId} onChange={(event) => setCityId(event.target.value)} required>
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city.cityId} value={city.cityId}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="blog-series">Series</label>
          <input
            id="blog-series"
            value={series}
            disabled={hasExistingSeries}
            onChange={(event) => setSeries(event.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <fieldset className="control-group">
        <legend>Categories</legend>
        <div className="checkbox-grid spacious">
          {categoryOptions.map((category) => (
            <label key={category.categoryId}>
              <input
                type="checkbox"
                checked={categoryIds.includes(String(category.categoryId))}
                onChange={() => toggleCategory(String(category.categoryId))}
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="control-group">
        <label htmlFor="blog-image">Image</label>
        <input
          id="blog-image"
          type="file"
          accept="image/png,image/jpeg,image/gif"
          onChange={(event) => setImage(event.target.files?.[0] ?? null)}
        />
      </div>

      <button type="submit" disabled={busy}>
        {busy ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
