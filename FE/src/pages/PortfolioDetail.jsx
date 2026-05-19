import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getImageUrl } from '../utils/imageUrl';
import styles from './PortfolioDetail.module.css';

export default function PortfolioDetail() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/portfolio/${slug}`);
  const p = data?.data;
  const [activeImg, setActiveImg] = useState(0);

  if (loading) return <div className={styles.loading}>Memuat...</div>;
  if (error || !p) return (
    <div className={styles.notFound}>
      <h2>Proyek tidak ditemukan</h2>
      <Link to="/portfolio" className="btn btn-red">← Kembali</Link>
    </div>
  );

  const images = p.images || [];

  return (
    <div className="page-enter">
      <div className="page-hero" style={{ paddingBottom: '2rem' }}>
        <div className="container">
          <nav className="breadcrumb">
            <a href="/">Beranda</a><span>/</span>
            <Link to="/portfolio">Portfolio</Link><span>/</span>
            <span>{p.title}</span>
          </nav>
          <div className={styles.cat}>{p.category}</div>
          <h1 className={styles.title}>{p.title}</h1>
        </div>
      </div>

      <section className={styles.detail}>
        <div className="container">
          {/* Meta */}
          <div className={styles.metaGrid}>
            {[
              { label: 'Klien',    val: p.client },
              { label: 'Lokasi',   val: p.location },
              { label: 'Kategori', val: p.category },
              { label: 'Tahun',    val: p.year },
            ].filter(m => m.val).map(m => (
              <div key={m.label} className={styles.metaItem}>
                <label>{m.label}</label>
                <strong>{m.val}</strong>
              </div>
            ))}
          </div>

          {/* Gallery */}
          {images.length > 0 && (
            <div className={styles.gallery}>
              <div className={styles.mainImg}>
                <img src={getImageUrl(images[activeImg])} alt={p.title} />
              </div>
              {images.length > 1 && (
                <div className={styles.thumbRow}>
                  {images.map((img, i) => (
                    <button key={i} className={`${styles.thumb} ${i === activeImg ? styles.activeThumb : ''}`} onClick={() => setActiveImg(i)}>
                      <img src={getImageUrl(img)} alt={`Foto ${i+1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className={styles.content}>
            {p.description && (
              <div className={styles.contentBlock}>
                <h3>Deskripsi Proyek</h3>
                <p>{p.description}</p>
              </div>
            )}
            {p.scope && (
              <div className={styles.contentBlock}>
                <h3>Lingkup Pekerjaan</h3>
                <div className={styles.scopeList}>
                  {p.scope.split('\n').filter(Boolean).map((s, i) => (
                    <div key={i} className={styles.scopeItem}><span>✦</span>{s.trim()}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.backRow}>
            <Link to="/portfolio" className="btn btn-outline">← Semua Proyek</Link>
            <Link to="/kontak" className="btn btn-red">Diskusikan Proyek Serupa</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
