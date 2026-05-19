import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../utils/constants';
import styles from './Header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoMark}>MI</div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>MULTISTACK</span>
            <span className={styles.logoSub}>INDONESIA</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav}>
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/kontak" className={styles.navCta}>Hubungi Kami</Link>
        </nav>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${mobileOpen ? styles.open : ''}`}
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className={styles.mobileNav} onClick={() => setMobileOpen(false)}>
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.active : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/kontak" className={styles.mobileCta}>Hubungi Kami →</Link>
        </div>
      )}
    </header>
  );
}
