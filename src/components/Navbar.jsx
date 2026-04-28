import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home', path: '/dashboard' },
  { label: 'About Constitution', path: '/about' },
  { label: 'Articles', path: '/articles' },
];

const ROLE_COLORS = {
  admin: '#FF6B00',
  citizen: '#138808',
  student: '#138808',
  educator: '#1565C0',
  legal_expert: '#7B1FA2',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = user ? (ROLE_COLORS[user.role] || '#FF6B00') : '#FF6B00';
  const roleLabel = user?.role?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="navbar-logo">
          <span className="logo-emblem">⚖️</span>
          <span className="logo-text">
            <span className="logo-top">Constitution</span>
            <span className="logo-sub">Awareness</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <ul className="navbar-links">
            {NAV_LINKS.map(link => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Right side */}
        <div className="navbar-right">
          {user ? (
            <>
              <div className="user-chip" style={{ '--role-color': roleColor }}>
                <span className="user-avatar">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="user-name">{user.name}</span>
                <span className="user-role">{roleLabel}</span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}

          {/* Hamburger */}
          {user && (
            <button
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(p => !p)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {user && menuOpen && (
        <div className="mobile-menu" ref={menuRef}>
          {NAV_LINKS.map(link => (
            <Link key={link.path} to={link.path} className="mobile-link">
              {link.label}
            </Link>
          ))}
          <button className="btn btn-outline w-full mt-8" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
