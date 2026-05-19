import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getPortfolios } from '../services/portfolioService';
import { getImageUrl } from '../utils/imageUrl';
import { truncate } from '../utils/formatters';
import styles from './PortfolioPage.module.css';

export default function PortfolioPage() {
  const { data: catData } = useFetch('/categories?type=portfolio');
  const categories = catData?.data || [];
  const [activeFilter, setActiveFilter] = useState('');
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = activeFilter ? { category: activeFilter } : {};
    getPortfolios(params)
      .then(res => setItems(res?.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  return (
    <div className="page-enter">
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb"><a href="/">Beranda</a><span>/</span><span>Portfolio</span></nav>
          <div className="section-label">Rekam Jejak</div>
          <h1 className="page-title">PORT<em style={{ color:'var(--red)',fontStyle:'normal' }}>FOLIO</em></h1>
          <p className="section-sub">500+ proyek sukses di seluruh Indonesia</p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          {/* Filters */}
          <div className={styles.filters}>
            <button className={`${styles.filter} ${!activeFilter ? styles.active : ''}`} onClick={() => setActiveFilter('')}>Semua</button>
            {categories.map(c => (
              <button key={c.id} className={`${styles.filter} ${activeFilter === c.name ? styles.active : ''}`} onClick={() => setActiveFilter(c.name)}>{c.name}</button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className={styles.grid}>{[1,2,3,4,5,6].map(i=><div key={i} className={styles.skeleton}/>)}</div>
          ) : items.length === 0 ? (
            <div className={styles.empty}>Tidak ada proyek dalam kategori ini.</div>
          ) : (
            <div className={styles.grid}>
              {items.map(p => (
                <Link key={p.id} to={`/portfolio/${p.slug}`} className={styles.card}>
                  <div className={styles.cardImg}>
                    {p.images?.[0]
                      ? <img src={getImageUrl(p.images[0])} alt={p.title} />
                      : <div className={styles.imgPlaceholder}>🏗</div>}
                    <div className={styles.overlay}>
                      <span>Lihat Detail →</span>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardCat}>{p.category}</div>
                    <h3 className={styles.cardTitle}>{p.title}</h3>
                    <div className={styles.cardMeta}>
                      {p.location && <span>📍 {p.location}</span>}
                      {p.year && <span>📅 {p.year}</span>}
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
