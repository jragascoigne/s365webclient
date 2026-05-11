import { NavLink, Route, Routes } from 'react-router-dom';
import { apiBaseUrl } from './config.js';
import { BlogDetailPage } from './pages/BlogDetailPage.jsx';
import { CreateBlogPage } from './pages/CreateBlogPage.jsx';
import { EditBlogPage } from './pages/EditBlogPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { MyBlogsPage } from './pages/MyBlogsPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { SetupPage } from './pages/SetupPage.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

const publicNavItems = [{ to: '/', label: 'Dashboard' }];
const privateNavItems = [
  { to: '/blogs/new', label: 'Create Blog' },
  { to: '/my-blogs', label: 'My Blogs' },
];

export default function App() {
  const { currentUser, isAuthenticated, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">SENG365 Assignment 2</p>
          <h1>Travel Blog Client</h1>
        </div>
        <nav aria-label="Primary navigation">
          {[...publicNavItems, ...(isAuthenticated ? privateNavItems : [])].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/setup">Setup</NavLink>
          {isAuthenticated ? (
            <button className="nav-button" type="button" onClick={handleLogout}>
              Log out{currentUser?.firstName ? ` ${currentUser.firstName}` : ''}
            </button>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage apiBaseUrl={apiBaseUrl} />} />
          <Route path="/blogs/:blogId" element={<BlogDetailPage />} />
          <Route
            path="/blogs/new"
            element={
              <ProtectedRoute>
                <CreateBlogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blogs/:blogId/edit"
            element={
              <ProtectedRoute>
                <EditBlogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-blogs"
            element={
              <ProtectedRoute>
                <MyBlogsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/setup" element={<SetupPage />} />
        </Routes>
      </main>
    </div>
  );
}
