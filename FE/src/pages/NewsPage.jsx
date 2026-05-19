import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNews } from '../services/newsService';
import { getImageUrl } from '../utils/imageUrl';
import { formatDate, truncate } from '../utils/formatters';
import styles from './NewsPage.module.css';

const CATS = [
  { value: '',         label: 'Semua' },
  { value: 'berita',   label: 'Berita' },
  { value: 'aktivitas',label: 'Aktivitas' },
  { value: 'csr',      label: 'CSR' },
];

export default function NewsPage() {
  const [activeCat, setActiveCat] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = activeCat ? { category: activeCat } : {};
    getNews(params)
      .then(res => setItems(res?.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeCat]);

  return (
    <div className="page-enter">
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb"><a href="/">Beranda</a><span>/</span><span>Informasi</span></nav>
          <div className="section-label">Berita & Aktivitas</div>
          <h1 className="page-title">INFOR<em style={{ color:'var(--red)',fontStyle:'normal' }}>MASI</em></h1>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.filters}>
            {CATS.map(c => (
              <button key={c.value} className={`${styles.filter} ${activeCat === c.value ? styles.active : ''}`} onClick={() => setActiveCat(c.value)}>{c.label}</button>
            ))}
          </div>

          {loading ? (
            <div className={styles.grid}>{[1,2,3,4,5,6].map(i=><div key={i} className={styles.skeleton}/>)}</div>
          ) : items.length === 0 ? (
            <div className={styles.empty}>Tidak ada berita untuk kategori ini.</div>
          ) : (
            <div className={styles.grid}>
              {items.map(n => (
                <Link key={n.id} to={`/informasi/${n.slug}`} className="card">
                  <div className="card-img">
                    {n.cover_image
                      ? <img src={getImageUrl(n.cover_image)} alt={n.title} />
                      : <div className={styles.imgPlaceholder}>📰</div>}
                  </div>
                  <div className="card-body">
                    <span className={`news-badge badge-${n.category}`}>{n.category}</span>
                    <div className="card-title">{n.title}</div>
                    {n.excerpt && <div className="card-text">{truncate(n.excerpt, 110)}</div>}
                    <div className={styles.meta}>
                      <span>{formatDate(n.created_at)}</span>
                      <span>{n.author}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
