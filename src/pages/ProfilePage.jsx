import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBlogs, getCategories, getCities } from '../api/blogs.js';
import { getUser } from '../api/users.js';
import { BlogSummaryCard } from '../components/BlogSummaryCard.jsx';
import { Notice } from '../components/Notice.jsx';
import { RemoteImage } from '../components/RemoteImage.jsx';
import { Separator } from '../components/ui/separator.jsx';
import { apiBaseUrl } from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';

function toLookup(items, key) {
  return Object.fromEntries(items.map((item) => [item[key], item.name]));
}

function groupBlogsBySeries(blogs) {
  const groups = new Map();

  blogs.forEach((blog) => {
    const key = blog.series || 'No Series';
    const group = groups.get(key) ?? [];
    group.push(blog);
    groups.set(key, group);
  });

  const sorted = [...groups.entries()].sort(([left], [right]) => {
    if (left === 'No Series') return 1;
    if (right === 'No Series') return -1;
    return left.localeCompare(right);
  });

  return sorted.map(([series, seriesBlogs]) => ({
    series,
    blogs: seriesBlogs.sort((left, right) => new Date(right.creationDate) - new Date(left.creationDate)),
  }));
}

export function ProfilePage() {
  const { userId } = useParams();
  const { auth } = useAuth();
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = auth?.userId === Number(userId);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      getUser(userId, isOwnProfile ? auth?.token : undefined),
      getBlogs({ creatorId: userId }),
      getCategories(),
      getCities(),
    ])
      .then(([userResponse, blogResponse, categoryResponse, cityResponse]) => {
        if (!active) return;
        setUser(userResponse);
        setBlogs(blogResponse.blogs ?? []);
        setCategories(categoryResponse ?? []);
        setCities(cityResponse ?? []);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load profile.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [auth?.token, isOwnProfile, userId]);

  const categoryLookup = useMemo(() => toLookup(categories, 'categoryId'), [categories]);
  const cityLookup = useMemo(() => toLookup(cities, 'cityId'), [cities]);
  const groupedBlogs = useMemo(() => groupBlogsBySeries(blogs), [blogs]);

  return (
    <section className="page-section">
      {loading && <Notice>Loading profile...</Notice>}
      {error && <Notice error>{error}</Notice>}

      {!loading && !error && user && (
        <>
          <section className="profile-header">
            <div className="profile-avatar">
              <RemoteImage src={`${apiBaseUrl}/users/${userId}/image`} alt="" />
            </div>
            <div>
              <p className="eyebrow">{isOwnProfile ? 'My Profile' : 'Profile'}</p>
              <h2>
                {user.firstName} {user.lastName}
              </h2>
              {isOwnProfile && user.email && <p>{user.email}</p>}
              {isOwnProfile && (
                <Link className="button-link fit-link" to="/profile/edit">
                  Edit profile
                </Link>
              )}
            </div>
          </section>

          <section className="detail-panel">
            <div className="section-header compact">
              <p className="eyebrow">Series</p>
              <h2>{blogs.length} blogs by series</h2>
            </div>

            {groupedBlogs.length === 0 ? (
              <Notice>No blogs created yet.</Notice>
            ) : (
              <div className="series-list">
                {groupedBlogs.map((group) => (
                  <section className="series-group" key={group.series}>
                    <h3>{group.series}</h3>
                    <Separator />
                    <div className="similar-grid">
                      {group.blogs.map((blog) => (
                        <BlogSummaryCard
                          key={blog.blogId}
                          blog={blog}
                          categoryLookup={categoryLookup}
                          cityLookup={cityLookup}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
