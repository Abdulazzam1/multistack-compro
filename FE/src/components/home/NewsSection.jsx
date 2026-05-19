import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { getImageUrl } from '../../utils/imageUrl';
import { formatDate, truncate } from '../../utils/formatters';
import styles from './NewsSection.module.css';

const CAT_CLS = { berita:'badge-berita', aktivitas:'badge-aktivitas', csr:'badge-csr' };

export default function NewsSection() {
  const { data } = useFetch('/news?show_on_home=true&limit=3');
  const news = data?.data || [];
  if (!news.length) return null;
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <div className="section-label">Informasi Terkini</div>
            <h2 className="section-title">Berita &amp; <em>Aktivitas</em></h2>
          </div>
          <Link to="/informasi" className="btn btn-outline">Semua Berita →</Link>
        </div>
        <div className={styles.grid}>
          {news.map(n => (
            <Link key={n.id} to={`/informasi/${n.slug}`} className="card">
              <div className="card-img">
                {n.cover_image
                  ? <img src={getImageUrl(n.cover_image)} alt={n.title} />
                  : <div className={styles.imgPlaceholder}>📰</div>}
              </div>
              <div className="card-body">
                <span className={`news-badge ${CAT_CLS[n.category]||'badge-berita'}`}>{n.category}</span>
                <div className="card-title">{n.title}</div>
                <div className="card-text">{truncate(n.excerpt || n.content, 110)}</div>
                <div className={styles.meta}>{formatDate(n.created_at)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
