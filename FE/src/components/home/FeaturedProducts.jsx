import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { getImageUrl } from '../../utils/imageUrl';
import { truncate } from '../../utils/formatters';
import styles from './FeaturedProducts.module.css';

export default function FeaturedProducts() {
  const { data, loading } = useFetch('/products?featured=true&limit=3');
  const products = data?.data || [];

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <div className="section-label">Produk Unggulan</div>
            <h2 className="section-title">Portofolio <em>Produk</em></h2>
          </div>
          <Link to="/produk" className="btn btn-outline">Semua Produk →</Link>
        </div>
        {loading ? (
          <div className={styles.grid}>{[1,2,3].map(i=><div key={i} className={styles.skeleton}/>)}</div>
        ) : (
          <div className={styles.grid}>
            {products.length > 0 ? products.map(p => (
              <Link key={p.id} to={`/produk/${p.slug}`} className="card">
                <div className="card-img">
                  {p.images?.[0]
                    ? <img src={getImageUrl(p.images[0])} alt={p.name} />
                    : <div className={styles.imgPlaceholder}>📦</div>}
                </div>
                <div className="card-body">
                  <div className="card-tag">{p.category || p.brand}</div>
                  <div className="card-title">{p.name}</div>
                  <div className="card-text">{truncate(p.description, 100)}</div>
                </div>
              </Link>
            )) : (
              <div className={styles.empty}>Belum ada produk unggulan.</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
