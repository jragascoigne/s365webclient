import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiBaseUrl } from '../config.js';
import {
  getBlog,
  getBlogComments,
  getBlogReactions,
  getBlogs,
  getCategories,
  getCities,
} from '../api/blogs.js';
import { BlogSummaryCard } from '../components/BlogSummaryCard.jsx';
import { RemoteImage } from '../components/RemoteImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatNzDate } from '../utils/date.js';

function toLookup(items, key) {
  return Object.fromEntries(items.map((item) => [item[key], item.name]));
}

function sortNewestFirst(left, right) {
  return new Date(right.timestamp) - new Date(left.timestamp);
}

function sortOldestFirst(left, right) {
  return new Date(left.timestamp) - new Date(right.timestamp);
}

function getReactionCounts(reactions) {
  return reactions.reduce((counts, item) => {
    counts[item.reaction] = (counts[item.reaction] ?? 0) + 1;
    return counts;
  }, {});
}

function getSimilarBlogs(currentBlog, blogs) {
  if (!currentBlog) return [];
  const currentCategories = new Set(currentBlog.categoryIds ?? []);

  return blogs
    .filter((blog) => blog.blogId !== currentBlog.blogId)
    .filter((blog) => {
      const sharesCategory = blog.categoryIds?.some((id) => currentCategories.has(id));
      return sharesCategory || blog.cityId === currentBlog.cityId || blog.creatorId === currentBlog.creatorId;
    })
    .slice(0, 6);
}

function CommentList({ comments }) {
  const { topLevel, repliesByParent } = useMemo(() => {
    const groups = new Map();
    const parents = [];

    comments.forEach((comment) => {
      if (comment.parentId === null || comment.parentId === undefined) {
        parents.push(comment);
        return;
      }

      const replies = groups.get(comment.parentId) ?? [];
      replies.push(comment);
      groups.set(comment.parentId, replies);
    });

    parents.sort(sortNewestFirst);
    groups.forEach((replies) => replies.sort(sortOldestFirst));

    return { topLevel: parents, repliesByParent: groups };
  }, [comments]);

  if (topLevel.length === 0) {
    return <div className="notice">No comments yet.</div>;
  }

  return (
    <div className="comment-list">
      {topLevel.map((comment) => {
        const replies = repliesByParent.get(comment.commentId) ?? [];

        return (
          <article className="comment-card" key={comment.commentId}>
            <CommentBody comment={comment} replyCount={replies.length} />
            {replies.length > 0 && (
              <div className="reply-list">
                {replies.map((reply) => (
                  <CommentBody comment={reply} key={reply.commentId} />
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function CommentBody({ comment, replyCount }) {
  const commenterName = `${comment.commenterFirstName} ${comment.commenterLastName}`;

  return (
    <div className="comment-body">
      <div className="avatar-frame">
        <RemoteImage src={`${apiBaseUrl}/users/${comment.commenterId}/image`} alt="" />
      </div>
      <div>
        <div className="comment-header">
          <strong>{commenterName}</strong>
          <span>{formatNzDate(comment.timestamp)}</span>
        </div>
        <p>{comment.comment}</p>
        {typeof replyCount === 'number' && <span className="reply-count">{replyCount} replies</span>}
      </div>
    </div>
  );
}

export function BlogDetailPage() {
  const { blogId } = useParams();
  const { auth } = useAuth();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      getBlog(blogId),
      getBlogComments(blogId),
      getBlogReactions(blogId),
      getBlogs(),
      getCategories(),
      getCities(),
    ])
      .then(([blogResponse, commentResponse, reactionResponse, blogResponseList, categoryResponse, cityResponse]) => {
        if (!active) return;
        setBlog(blogResponse);
        setComments(commentResponse ?? []);
        setReactions(reactionResponse ?? []);
        setBlogs(blogResponseList.blogs ?? []);
        setCategories(categoryResponse ?? []);
        setCities(cityResponse ?? []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Could not load blog details.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [blogId]);

  const categoryLookup = useMemo(() => toLookup(categories, 'categoryId'), [categories]);
  const cityLookup = useMemo(() => toLookup(cities, 'cityId'), [cities]);
  const reactionCounts = useMemo(() => getReactionCounts(reactions), [reactions]);
  const similarBlogs = useMemo(() => getSimilarBlogs(blog, blogs), [blog, blogs]);
  const categoryNames = blog?.categoryIds?.map((id) => categoryLookup[id] ?? `Category ${id}`) ?? [];
  const creatorName = blog ? `${blog.creatorFirstName} ${blog.creatorLastName}` : '';

  return (
    <section className="page-section detail-section">
      <Link className="text-link" to="/">
        Back to blogs
      </Link>

      {loading && <div className="notice">Loading blog details...</div>}
      {error && <div className="notice error">{error}</div>}

      {!loading && !error && blog && (
        <div className="detail-layout">
          <article className="blog-detail">
            <div className="detail-image-frame">
              <RemoteImage src={`${apiBaseUrl}/blogs/${blog.blogId}/image`} alt="" />
            </div>

            <div className="detail-content">
              <p className="blog-meta">{formatNzDate(blog.creationDate)}</p>
              <h2>{blog.title}</h2>
              {auth?.userId === blog.creatorId && (
                <Link className="button-link fit-link" to={`/blogs/${blog.blogId}/edit`}>
                  Edit blog
                </Link>
              )}
              <p className="blog-description">{blog.description}</p>

              <div className="detail-grid">
                <div>
                  <span className="detail-label">Creator</span>
                  <div className="creator-row">
                    <div className="avatar-frame">
                      <RemoteImage src={`${apiBaseUrl}/users/${blog.creatorId}/image`} alt="" />
                    </div>
                    <span>{creatorName}</span>
                  </div>
                </div>
                <div>
                  <span className="detail-label">City</span>
                  <p>{cityLookup[blog.cityId] ?? `City ${blog.cityId}`}</p>
                </div>
                <div>
                  <span className="detail-label">Series</span>
                  <p>{blog.series ?? 'No Series'}</p>
                </div>
                <div>
                  <span className="detail-label">Unique commenters</span>
                  <p>{blog.numberOfUniqueCommenters ?? 0}</p>
                </div>
              </div>

              <div>
                <span className="detail-label">Categories</span>
                <div className="tag-list" aria-label={`Categories for ${blog.title}`}>
                  {categoryNames.map((category) => (
                    <span key={category}>{category}</span>
                  ))}
                </div>
              </div>

              <div>
                <span className="detail-label">Reactions</span>
                <div className="reaction-list">
                  {Object.entries(reactionCounts).length === 0 && <span>No reactions yet</span>}
                  {Object.entries(reactionCounts).map(([reaction, count]) => (
                    <span key={reaction}>
                      {reaction.replace('_', ' ')}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <section className="detail-panel">
            <div className="section-header compact">
              <p className="eyebrow">Comments</p>
              <h2>{comments.length} comments</h2>
            </div>
            <CommentList comments={comments} />
          </section>

          <section className="detail-panel">
            <div className="section-header compact">
              <p className="eyebrow">Similar Blogs</p>
              <h2>{similarBlogs.length} related posts</h2>
            </div>
            {similarBlogs.length === 0 ? (
              <div className="notice">No similar blogs found.</div>
            ) : (
              <div className="similar-grid">
                {similarBlogs.map((similarBlog) => (
                  <BlogSummaryCard
                    key={similarBlog.blogId}
                    blog={similarBlog}
                    categoryLookup={categoryLookup}
                    cityLookup={cityLookup}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
