import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { ZeffyModal } from './ZeffyModal';
import '../styles/Navigation.css';

export const Navigation = ({ theme = 'light', onToggleTheme = () => { } }) => {
  const { user, userRole, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showZeffyModal, setShowZeffyModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const navRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    closeMenu();
  };

  return (
    <header>
      <nav className="navbar" ref={navRef}>
        <div className="navbar-container">
          <div className="navbar-brand">
            <Link to="/" onClick={closeMenu}>
              <img src="/crta-logo.png" alt="CRTA Logo" className="navbar-logo" />
            </Link>
          </div>
          <div className="navbar-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={() => {
                onToggleTheme();
                closeMenu();
              }}
              aria-label="Toggle color theme"
              aria-pressed={theme === 'dark'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>

            <button
              className={`navbar-toggle ${isMenuOpen ? 'open' : ''}`}
              aria-label="Toggle navigation"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
              type="button"
            >
              <span className="navbar-toggle-bar"></span>
              <span className="navbar-toggle-bar"></span>
              <span className="navbar-toggle-bar"></span>
            </button>
          </div>
          <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            <ul>
              <li><Link to="/schedule" onClick={closeMenu}>Schedule</Link></li>

              {/* League Dropdown */}
              <li className="dropdown">
                <button
                  className="dropdown-toggle"
                  onClick={() => toggleDropdown('league')}
                  aria-expanded={openDropdown === 'league'}
                  aria-haspopup="menu"
                  type="button"
                >
                  <span>League</span>
                  <svg className="dropdown-arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <ul className={`dropdown-menu ${openDropdown === 'league' ? 'show' : ''}`} role="menu">
                  <li><Link to="/standings" onClick={closeMenu}>Standings</Link></li>
                  <li><Link to="/player-rankings" onClick={closeMenu}>Player Rankings</Link></li>
                  {user && <li><Link to="/sub-board" onClick={closeMenu}>Sub Board</Link></li>}
                  <li>
                    <a
                      href="http://www.couleeregiontennis.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMenu}
                    >
                      CRTA Website
                    </a>
                  </li>
                  <li><Link to="/rules" onClick={closeMenu}>Rules</Link></li>
                </ul>
              </li>

              {/* Player Hub Dropdown - only show if user is logged in */}
              {user && (
                <li className="dropdown">
                  <button
                    className="dropdown-toggle"
                    onClick={() => toggleDropdown('player')}
                    aria-expanded={openDropdown === 'player'}
                    aria-haspopup="menu"
                    type="button"
                  >
                    <span>My Hub</span>
                    <svg className="dropdown-arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <ul className={`dropdown-menu ${openDropdown === 'player' ? 'show' : ''}`} role="menu">
                    <li><Link to="/player-profile" onClick={closeMenu}>My Profile</Link></li>
                    <li><Link to="/my-schedule" onClick={closeMenu}>My Schedule</Link></li>
                    {userRole.isCaptain && (
                      <>
                        <li><Link to="/captain-dashboard" onClick={closeMenu}>Captain Dashboard</Link></li>
                        <li><Link to="/add-score" onClick={closeMenu}>Submit Scores</Link></li>
                      </>
                    )}
                  </ul>
                </li>
              )}

              {/* General Player Resources */}
              <li className="dropdown">
                <button
                  className="dropdown-toggle"
                  onClick={() => toggleDropdown('resources')}
                  aria-expanded={openDropdown === 'resources'}
                  aria-haspopup="menu"
                  type="button"
                >
                  <span>Resources</span>
                  <svg className="dropdown-arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <ul className={`dropdown-menu ${openDropdown === 'resources' ? 'show' : ''}`} role="menu">
                  <li><Link to="/courts-locations" onClick={closeMenu}>Courts & Locations</Link></li>
                  <li><Link to="/player-resources" onClick={closeMenu}>Player Resources</Link></li>
                  {user && (
                    <>
                      <li><Link to="/pay-dues" onClick={closeMenu}>Pay Dues</Link></li>
                      <li><Link to="/feedback" onClick={closeMenu}>Feedback</Link></li>
                    </>
                  )}
                </ul>
              </li>

              {/* Admin Dropdown - only show for admins */}
              {user && userRole.isAdmin && (
                <li className="dropdown">
                  <button
                    className="dropdown-toggle"
                    onClick={() => toggleDropdown('admin')}
                    aria-expanded={openDropdown === 'admin'}
                    aria-haspopup="menu"
                    type="button"
                  >
                    <span>Admin</span>
                    <svg className="dropdown-arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <ul className={`dropdown-menu ${openDropdown === 'admin' ? 'show' : ''}`} role="menu">
                    <li><Link to="/admin/schedule-generator" onClick={closeMenu}>Schedule Generator</Link></li>
                    <li><Link to="/admin/audit-logs" onClick={closeMenu}>Audit Logs</Link></li>
                    <li><Link to="/admin/player-management" onClick={closeMenu}>Player Management</Link></li>
                    <li><Link to="/admin/payment-management" onClick={closeMenu}>Payment Management</Link></li>
                    <li><Link to="/admin/team-management" onClick={closeMenu}>Team Management</Link></li>
                  </ul>
                </li>
              )}

              <li className="nav-action-item">
                <button
                  className="nav-btn-zeffy registration"
                  onClick={() => {
                    setShowZeffyModal(true);
                    closeMenu();
                  }}
                >
                  Pay Registration
                </button>
              </li>
              <li className="nav-action-item">
                <button
                  zeffy-form-link="https://www.zeffy.com/en-US/donation-form/donate-to-coulee-region-tennis-association"
                  className="nav-btn-zeffy donate"
                  onClick={closeMenu}
                >
                  <svg className="nav-heart-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>Donate</span>
                </button>
              </li>

              {/* Authentication */}
              {user ? (
                <li className="navbar-auth">
                  <div className="navbar-user-chip" title={user.email}>
                    <svg className="navbar-user-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="navbar-user-name">{user.email ? user.email.split('@')[0] : 'User'}</span>
                  </div>
                  <button className="navbar-logout-btn" onClick={handleLogout} title="Sign Out">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Logout</span>
                  </button>
                </li>
              ) : (
                <li className="navbar-auth">
                  <Link to="/login" title="Login" className="navbar-login-btn" onClick={closeMenu}>
                    <svg className="navbar-login-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>Login</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <ZeffyModal isOpen={showZeffyModal} onClose={() => setShowZeffyModal(false)} />
    </header>
  );
};
