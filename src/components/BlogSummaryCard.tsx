import { Link } from 'react-router-dom';
import { apiBaseUrl } from '../config';
import { formatNzDate } from '../utils/date';
import { RemoteImage } from './RemoteImage';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function BlogSummaryCard({ blog, categoryLookup, cityLookup }) {
  const categories = blog.categoryIds?.map((id) => categoryLookup[id] ?? `Category ${id}`) ?? [];
  const creatorName = `${blog.creatorFirstName} ${blog.creatorLastName}`;
  const reactionCount = Number(blog.numReactions ?? 0);
  const reactionLabel = `${reactionCount} ${reactionCount === 1 ? 'reaction' : 'reactions'}`;

  return (
    <Card className="blog-card overflow-hidden">
      <Link className="blog-image-frame" to={`/blogs/${blog.blogId}`} aria-label={`Read ${blog.title}`}>
        <RemoteImage src={`${apiBaseUrl}/blogs/${blog.blogId}/image`} alt="" />
      </Link>

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
          <span>{reactionLabel}</span>
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
