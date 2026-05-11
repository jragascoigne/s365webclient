import { useEffect, useMemo, useState } from 'react';
import { apiBaseUrl } from '../config.js';
import { getBlogs, getCategories, getCities, sortOptions } from '../api/blogs.js';
import { formatNzDate } from '../utils/date.js';

const pageSizeOptions = [5, 10];

function toLookup(items, key = 'categoryId') {
  return Object.fromEntries(items.map((item) => [item[key], item.name]));
}

function toggleSelection(current, value) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

function BlogImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className="image-placeholder" aria-hidden="true">No image</div>;
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

function BlogCard({ blog, categoryLookup, cityLookup }) {
  const categories = blog.categoryIds?.map((id) => categoryLookup[id] ?? `Category ${id}`) ?? [];
  const creatorName = `${blog.creatorFirstName} ${blog.creatorLastName}`;

  return (
    <article className="blog-card">
      <div className="blog-image-frame">
        <BlogImage src={`${apiBaseUrl}/blogs/${blog.blogId}/image`} alt="" />
      </div>

      <div className="blog-card-body">
        <div>
          <p className="blog-meta">{formatNzDate(blog.creationDate)}</p>
          <h3>{blog.title}</h3>
        </div>

        <div className="creator-row">
          <div className="avatar-frame">
            <BlogImage src={`${apiBaseUrl}/users/${blog.creatorId}/image`} alt="" />
          </div>
          <span>{creatorName}</span>
        </div>

        <div className="blog-detail-row">
          <span>{cityLookup[blog.cityId] ?? `City ${blog.cityId}`}</span>
          <span>{blog.numReactions} reactions</span>
        </div>

        <div className="tag-list" aria-label={`Categories for ${blog.title}`}>
          {categories.map((category) => (
            <span key={category}>{category}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function BlogBrowser() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [sortBy, setSortBy] = useState('CREATED_DESC');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [minimumReactions, setMinimumReactions] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      getBlogs({ q: submittedQuery, sortBy }),
      getCategories(),
      getCities(),
    ])
      .then(([blogResponse, categoryResponse, cityResponse]) => {
        if (!active) return;
        setBlogs(blogResponse.blogs ?? []);
        setCategories(categoryResponse ?? []);
        setCities(cityResponse ?? []);
        setPage(1);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Could not load blogs.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [submittedQuery, sortBy]);

  const categoryLookup = useMemo(() => toLookup(categories, 'categoryId'), [categories]);
  const cityLookup = useMemo(() => toLookup(cities, 'cityId'), [cities]);

  const filteredBlogs = useMemo(() => {
    const minReactions = minimumReactions === '' ? 0 : Number(minimumReactions);

    return blogs.filter((blog) => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.some((id) => blog.categoryIds?.includes(Number(id)));
      const cityMatch = selectedCities.length === 0 || selectedCities.includes(String(blog.cityId));
      const reactionMatch = Number(blog.numReactions ?? 0) >= minReactions;

      return categoryMatch && cityMatch && reactionMatch;
    });
  }, [blogs, minimumReactions, selectedCategories, selectedCities]);

  const pageCount = Math.max(1, Math.ceil(filteredBlogs.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * pageSize;
  const visibleBlogs = filteredBlogs.slice(pageStart, pageStart + pageSize);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmittedQuery(query);
  }

  function clearFilters() {
    setQuery('');
    setSubmittedQuery('');
    setSortBy('CREATED_DESC');
    setSelectedCategories([]);
    setSelectedCities([]);
    setMinimumReactions('');
    setPage(1);
  }

  return (
    <section className="browser-layout" aria-label="Blog browser">
      <form className="filter-panel" onSubmit={handleSubmit}>
        <div className="control-group">
          <label htmlFor="blog-search">Search title or description</label>
          <div className="inline-control">
            <input
              id="blog-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="coffee, hiking, art..."
            />
            <button type="submit">Search</button>
          </div>
        </div>

        <div className="control-group">
          <label htmlFor="sort-blogs">Sort</label>
          <select id="sort-blogs" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="control-group">
          <legend>Cities</legend>
          <div className="checkbox-grid">
            {cities.map((city) => (
              <label key={city.cityId}>
                <input
                  type="checkbox"
                  checked={selectedCities.includes(String(city.cityId))}
                  onChange={() => {
                    setSelectedCities((current) => toggleSelection(current, String(city.cityId)));
                    setPage(1);
                  }}
                />
                <span>{city.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="control-group">
          <legend>Categories</legend>
          <div className="checkbox-grid">
            {categories.map((category) => (
              <label key={category.categoryId}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(String(category.categoryId))}
                  onChange={() => {
                    setSelectedCategories((current) => toggleSelection(current, String(category.categoryId)));
                    setPage(1);
                  }}
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="split-controls">
          <div className="control-group">
            <label htmlFor="minimum-reactions">Minimum reactions</label>
            <input
              id="minimum-reactions"
              type="number"
              min="0"
              value={minimumReactions}
              onChange={(event) => {
                setMinimumReactions(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="control-group">
            <label htmlFor="page-size">Page size</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="secondary-button" type="button" onClick={clearFilters}>
          Reset
        </button>
      </form>

      <div className="results-panel">
        <div className="results-toolbar">
          <div>
            <p className="eyebrow">Blogs</p>
            <h2>{filteredBlogs.length} matching posts</h2>
          </div>
          <p>
            Page {safePage} of {pageCount}
          </p>
        </div>

        {error && <div className="notice error">{error}</div>}
        {loading && <div className="notice">Loading blogs...</div>}
        {!loading && !error && visibleBlogs.length === 0 && (
          <div className="notice">No blogs match the current controls.</div>
        )}

        <div className="blog-list">
          {visibleBlogs.map((blog) => (
            <BlogCard key={blog.blogId} blog={blog} categoryLookup={categoryLookup} cityLookup={cityLookup} />
          ))}
        </div>

        <div className="pagination-bar" aria-label="Pagination">
          <button type="button" disabled={safePage === 1} onClick={() => setPage(1)}>
            First
          </button>
          <button type="button" disabled={safePage === 1} onClick={() => setPage((current) => current - 1)}>
            Previous
          </button>
          <button type="button" disabled={safePage === pageCount} onClick={() => setPage((current) => current + 1)}>
            Next
          </button>
          <button type="button" disabled={safePage === pageCount} onClick={() => setPage(pageCount)}>
            Last
          </button>
        </div>
      </div>
    </section>
  );
}
