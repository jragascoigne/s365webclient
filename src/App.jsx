import { NavLink, Route, Routes } from 'react-router-dom';
import { apiBaseUrl } from './config.js';
import { HomePage } from './pages/HomePage.jsx';
import { SetupPage } from './pages/SetupPage.jsx';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/setup', label: 'Setup' },
];

export default function App() {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">SENG365 Assignment 2</p>
          <h1>Travel Blog Client</h1>
        </div>
        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage apiBaseUrl={apiBaseUrl} />} />
          <Route path="/setup" element={<SetupPage />} />
        </Routes>
      </main>
    </div>
  );
}
