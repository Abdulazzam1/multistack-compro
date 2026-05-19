import { useQuery } from '@tanstack/react-query';
import { getMetrics } from '@/services/dashboardService';
import { Link } from 'react-router-dom';
import { Package, Wrench, Briefcase, Newspaper, Star, Phone, FileText, AlertCircle } from 'lucide-react';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const admin = JSON.parse(localStorage.getItem('multistack_admin') || '{}');
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => getMetrics().then(r => r.data.data),
    refetchInterval: 60_000,
  });

  const cards = data ? [
    { label: 'Produk Aktif',      val: data.products_active,   icon: Package,   path: '/products' },
    { label: 'Layanan',           val: data.services_total,    icon: Wrench,    path: '/services' },
    { label: 'Portfolio',         val: data.portfolio_total,   icon: Briefcase, path: '/portfolio' },
    { label: 'Berita Terbit',     val: data.news_published,    icon: Newspaper, path: '/news' },
    { label: 'Testimoni',         val: data.testimonials_total,icon: Star,      path: '/testimonials' },
    { label: 'Total RFQ',         val: data.rfq_total,         icon: FileText,  path: '/rfq' },
    { label: 'Total Pesan',       val: data.contact_total,     icon: Phone,     path: '/contact' },
  ] : [];

  return (
    <div className="animate-in">
      <div className={styles.header}>
        <div>
          <h1 className="page-title">DASHBOARD</h1>
          <p className={styles.greet}>Selamat datang, <strong>{admin.name || 'Admin'}</strong>!</p>
        </div>
        <div className={styles.alertRow}>
          {data?.rfq_unread > 0 && (
            <Link to="/rfq" className={styles.alertBadge}>
              <AlertCircle size={14} />
              {data.rfq_unread} RFQ baru
            </Link>
          )}
          {data?.contact_unread > 0 && (
            <Link to="/contact" className={styles.alertBadge}>
              <AlertCircle size={14} />
              {data.contact_unread} pesan baru
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.grid}>{[1,2,3,4,5,6,7].map(i=><div key={i} className={styles.skeleton}/>)}</div>
      ) : (
        <div className={styles.grid}>
          {cards.map(c => {
            const Icon = c.icon;
            return (
              <Link key={c.label} to={c.path} className={`card ${styles.card}`}>
                <div className={styles.cardIcon}><Icon size={20}/></div>
                <div className={styles.cardVal}>{c.val}</div>
                <div className={styles.cardLabel}>{c.label}</div>
              </Link>
            );
          })}
        </div>
      )}

      <div className={styles.quickActions}>
        <h3 className={styles.qaTitle}>Aksi Cepat</h3>
        <div className={styles.qaGrid}>
          {[
            { label: 'Tambah Produk Baru',  path: '/products/new' },
            { label: 'Tulis Berita',         path: '/news/new' },
            { label: 'Kelola Layanan',       path: '/services' },
            { label: 'Lihat RFQ Masuk',      path: '/rfq' },
            { label: 'Edit Pengaturan',       path: '/settings' },
          ].map(a => (
            <Link key={a.label} to={a.path} className={`btn btn-outline ${styles.qaBtn}`}>{a.label} →</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
