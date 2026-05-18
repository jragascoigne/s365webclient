import { useEffect, useMemo, useState } from 'react';
import { getBlogs, getCategories, getCities, sortOptions } from '../api/blogs';
import { BlogSummaryCard } from './BlogSummaryCard';
import { Notice } from './Notice';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const pageSizeOptions = [5, 10];

function toLookup(items, key = 'categoryId') {
  return Object.fromEntries(items.map((item) => [item[key], item.name]));
}

function toggleSelection(current, value) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
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
            <Input
              id="blog-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="coffee, hiking, art..."
            />
            <Button type="submit">Search</Button>
          </div>
        </div>

        <div className="control-group">
          <label htmlFor="sort-blogs">Sort</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sort-blogs" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <fieldset className="control-group">
          <legend>Cities</legend>
          <div className="checkbox-grid">
            {cities.map((city) => {
              const value = String(city.cityId);
              return (
              <label key={city.cityId}>
                <Checkbox
                  checked={selectedCities.includes(value)}
                  onCheckedChange={() => {
                    setSelectedCities((current) => toggleSelection(current, value));
                    setPage(1);
                  }}
                />
                <span>{city.name}</span>
              </label>
            );
            })}
          </div>
        </fieldset>

        <fieldset className="control-group">
          <legend>Categories</legend>
          <div className="checkbox-grid">
            {categories.map((category) => {
              const value = String(category.categoryId);
              return (
              <label key={category.categoryId}>
                <Checkbox
                  checked={selectedCategories.includes(value)}
                  onCheckedChange={() => {
                    setSelectedCategories((current) => toggleSelection(current, value));
                    setPage(1);
                  }}
                />
                <span>{category.name}</span>
              </label>
            );
            })}
          </div>
        </fieldset>

        <div className="split-controls">
          <div className="control-group">
            <label htmlFor="minimum-reactions">Minimum reactions</label>
            <Input
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
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger id="page-size" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="secondary" type="button" onClick={clearFilters}>
          Reset
        </Button>
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

        {error && <Notice error>{error}</Notice>}
        {loading && <Notice>Loading blogs...</Notice>}
        {!loading && !error && visibleBlogs.length === 0 && (
          <Notice>No blogs match the current controls.</Notice>
        )}

        <div className="blog-list">
          {visibleBlogs.map((blog) => (
            <BlogSummaryCard key={blog.blogId} blog={blog} categoryLookup={categoryLookup} cityLookup={cityLookup} />
          ))}
        </div>

        <div className="pagination-bar" aria-label="Pagination">
          <Button type="button" variant="outline" disabled={safePage === 1} onClick={() => setPage(1)}>
            First
          </Button>
          <Button type="button" variant="outline" disabled={safePage === 1} onClick={() => setPage((current) => current - 1)}>
            Previous
          </Button>
          <Button type="button" variant="outline" disabled={safePage === pageCount} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
          <Button type="button" variant="outline" disabled={safePage === pageCount} onClick={() => setPage(pageCount)}>
            Last
          </Button>
        </div>
      </div>
    </section>
  );
}
