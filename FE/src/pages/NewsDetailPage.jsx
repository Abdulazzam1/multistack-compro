import { useParams, Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getImageUrl } from '../utils/imageUrl';
import { formatDate } from '../utils/formatters';
import styles from './NewsDetailPage.module.css';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/news/${slug}`);
  const n = data?.data;

  if (loading) return <div className={styles.loading}>Memuat berita...</div>;
  if (error || !n) return (
    <div className={styles.notFound}>
      <h2>Berita tidak ditemukan</h2>
      <Link to="/informasi" className="btn btn-red">← Kembali</Link>
    </div>
  );

  return (
    <div className="page-enter">
      <div className="page-hero" style={{ paddingBottom: '2rem' }}>
        <div className="container">
          <nav className="breadcrumb">
            <a href="/">Beranda</a><span>/</span>
            <Link to="/informasi">Informasi</Link><span>/</span>
            <span>{n.title}</span>
          </nav>
          <span className={`news-badge badge-${n.category}`} style={{ marginBottom: '1rem', display: 'inline-block' }}>{n.category}</span>
          <h1 className={styles.title}>{n.title}</h1>
          <div className={styles.meta}>
            <span>📅 {formatDate(n.created_at)}</span>
            <span>✍ {n.author}</span>
          </div>
        </div>
      </div>

      <section className={styles.articleSection}>
        <div className="container">
          <div className={styles.article}>
            {n.cover_image && (
              <div className={styles.coverWrap}>
                <img src={getImageUrl(n.cover_image)} alt={n.title} className={styles.cover} />
              </div>
            )}
            {n.excerpt && <p className={styles.excerpt}>{n.excerpt}</p>}
            {n.content && (
              <div
                className={styles.body}
                dangerouslySetInnerHTML={{ __html: n.content }}
              />
            )}
            <div className={styles.backRow}>
              <Link to="/informasi" className="btn btn-outline">← Semua Berita</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
