import { Link } from 'react-router-dom';
import { apiBaseUrl } from '../config.js';
import { formatNzDate } from '../utils/date.js';
import { RemoteImage } from './RemoteImage.jsx';

export function BlogSummaryCard({ blog, categoryLookup, cityLookup }) {
  const categories = blog.categoryIds?.map((id) => categoryLookup[id] ?? `Category ${id}`) ?? [];
  const creatorName = `${blog.creatorFirstName} ${blog.creatorLastName}`;

  return (
    <article className="blog-card">
      <div className="blog-image-frame">
        <RemoteImage src={`${apiBaseUrl}/blogs/${blog.blogId}/image`} alt="" />
      </div>

      <div className="blog-card-body">
        <div>
          <p className="blog-meta">{formatNzDate(blog.creationDate)}</p>
          <h3>
            <Link to={`/blogs/${blog.blogId}`}>{blog.title}</Link>
          </h3>
        </div>

        <div className="creator-row">
          <div className="avatar-frame">
            <RemoteImage src={`${apiBaseUrl}/users/${blog.creatorId}/image`} alt="" />
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

        <Link className="text-link" to={`/blogs/${blog.blogId}`}>
          Read blog
        </Link>
      </div>
    </article>
  );
}
