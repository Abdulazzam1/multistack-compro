import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Image, Tag, Package, Wrench, Briefcase,
  Newspaper, MessageSquare, Star, Phone, FileText, Settings,
  Award, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import styles from './CMSLayout.module.css';

const NAV = [
  { label: 'Dashboard',    path: '/dashboard',    icon: LayoutDashboard },
  { label: 'Banner',       path: '/banners',      icon: Image },
  { label: 'Kategori',     path: '/categories',   icon: Tag },
  { label: 'Produk',       path: '/products',     icon: Package },
  { label: 'Layanan',      path: '/services',     icon: Wrench },
  { label: 'Portfolio',    path: '/portfolio',    icon: Briefcase },
  { label: 'Berita',       path: '/news',         icon: Newspaper },
  { label: 'Testimoni',    path: '/testimonials', icon: Star },
  { label: 'Penghargaan',  path: '/awards',       icon: Award },
  { label: 'Pesan Masuk',  path: '/contact',      icon: Phone },
  { label: 'RFQ',          path: '/rfq',          icon: FileText },
  { label: 'Pengaturan',   path: '/settings',     icon: Settings },
];

export default function CMSLayout() {
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const admin = JSON.parse(localStorage.getItem('multistack_admin') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('multistack_token');
    localStorage.removeItem('multistack_admin');
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <div className={styles.logoMark}>MI</div>
          <div className={styles.logoText}>
            <span>MULTISTACK</span>
            <span className={styles.logoSub}>CMS PANEL</span>
          </div>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}><X size={18}/></button>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {NAV.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                <ChevronRight size={14} className={styles.arrow} />
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className={styles.userBox}>
          <div className={styles.userAvatar}>{(admin.name || 'A').slice(0,2).toUpperCase()}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{admin.name || 'Admin'}</div>
            <div className={styles.userEmail}>{admin.email || ''}</div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} title="Logout"><LogOut size={16}/></button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className={styles.main}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}><Menu size={20}/></button>
          <div className={styles.topRight}>
            <a href="http://localhost:5173" target="_blank" rel="noreferrer" className={styles.viewSite}>
              Lihat Website ↗
            </a>
          </div>
        </header>

        {/* Content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
