import { useEffect, useMemo, useState } from 'react';
import { validateImage } from '../utils/validation';
import { Notice } from './Notice';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

function toInitialCategoryIds(blog) {
  return blog?.categoryIds?.map(String) ?? [];
}

export function BlogForm({ blog, categories, cities, onSubmit, submitLabel, busy }: any) {
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
      {error && <Notice error>{error}</Notice>}

      <div className="control-group">
        <Label htmlFor="blog-title">Title</Label>
        <Input id="blog-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
      </div>

      <div className="control-group">
        <Label htmlFor="blog-description">Description</Label>
        <Textarea
          id="blog-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows="7"
          required
        />
      </div>

      <div className="split-controls">
        <div className="control-group">
          <Label htmlFor="blog-city">City</Label>
          <Select value={cityId} onValueChange={setCityId} required>
            <SelectTrigger id="blog-city" className="w-full">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.cityId} value={String(city.cityId)}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="control-group">
          <Label htmlFor="blog-series">Series</Label>
          <Input
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
          {categoryOptions.map((category) => {
            const value = String(category.categoryId);
            return (
            <label key={category.categoryId}>
              <Checkbox checked={categoryIds.includes(value)} onCheckedChange={() => toggleCategory(value)} />
              <span>{category.name}</span>
            </label>
          );
          })}
        </div>
      </fieldset>

      <div className="control-group">
        <Label htmlFor="blog-image">Image</Label>
        <Input
          id="blog-image"
          type="file"
          accept="image/png,image/jpeg,image/gif"
          onChange={(event) => setImage(event.target.files?.[0] ?? null)}
        />
      </div>

      <Button type="submit" disabled={busy}>
        {busy ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
