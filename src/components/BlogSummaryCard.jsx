import { Link } from 'react-router-dom';
import { apiBaseUrl } from '../config.js';
import { formatNzDate } from '../utils/date.js';
import { RemoteImage } from './RemoteImage.jsx';
import { Badge } from './ui/badge.jsx';
import { Button } from './ui/button.jsx';
import { Card, CardContent } from './ui/card.jsx';

export function BlogSummaryCard({ blog, categoryLookup, cityLookup }) {
  const categories = blog.categoryIds?.map((id) => categoryLookup[id] ?? `Category ${id}`) ?? [];
  const creatorName = `${blog.creatorFirstName} ${blog.creatorLastName}`;

  return (
    <Card className="blog-card overflow-hidden">
      <div className="blog-image-frame">
        <RemoteImage src={`${apiBaseUrl}/blogs/${blog.blogId}/image`} alt="" />
      </div>

      <CardContent className="blog-card-body p-4">
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
          <Link className="text-link" to={`/users/${blog.creatorId}`}>
            {creatorName}
          </Link>
        </div>

        <div className="blog-detail-row">
          <span>{cityLookup[blog.cityId] ?? `City ${blog.cityId}`}</span>
          <span>{blog.numReactions} reactions</span>
        </div>

        <div className="tag-list" aria-label={`Categories for ${blog.title}`}>
          {categories.map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>

        <Button asChild variant="link" className="fit-link text-link">
          <Link to={`/blogs/${blog.blogId}`}>Read blog</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
