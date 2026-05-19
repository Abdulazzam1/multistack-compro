import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getImageUrl } from '../utils/imageUrl';
import { COMPANY } from '../utils/constants';
import styles from './ProductDetailPage.module.css';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/products/${slug}`);
  const product = data?.data;
  const [activeImg, setActiveImg] = useState(0);

  if (loading) return <div className={styles.loading}>Memuat produk...</div>;
  if (error || !product) return (
    <div className={styles.notFound}>
      <h2>Produk tidak ditemukan</h2>
      <Link to="/produk" className="btn btn-red">← Kembali</Link>
    </div>
  );

  const specs = typeof product.specs === 'string' ? JSON.parse(product.specs || '{}') : (product.specs || {});
  const images = product.images || [];
  const waMsg = encodeURIComponent(`Halo Multistack, saya ingin menanyakan tentang produk: ${product.name}`);

  return (
    <div className="page-enter">
      <div className="page-hero" style={{ paddingBottom: '2rem' }}>
        <div className="container">
          <nav className="breadcrumb">
            <a href="/">Beranda</a><span>/</span>
            <Link to="/produk">Produk</Link><span>/</span>
            <span>{product.name}</span>
          </nav>
        </div>
      </div>

      <section className={styles.detail}>
        <div className="container">
          <div className={styles.grid}>
            {/* Gallery */}
            <div className={styles.gallery}>
              <div className={styles.mainImg}>
                {images[activeImg]
                  ? <img src={getImageUrl(images[activeImg])} alt={product.name} />
                  : <div className={styles.imgPlaceholder}>📦</div>}
              </div>
              {images.length > 1 && (
                <div className={styles.thumbs}>
                  {images.map((img, i) => (
                    <button key={i} className={`${styles.thumb} ${i === activeImg ? styles.activeThumb : ''}`} onClick={() => setActiveImg(i)}>
                      <img src={getImageUrl(img)} alt={`Gambar ${i+1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className={styles.info}>
              <div className={styles.tag}>{product.category}</div>
              {product.brand && <div className={styles.brand}>{product.brand}</div>}
              <h1 className={styles.name}>{product.name}</h1>
              {product.description && (
                <p className={styles.desc}>{product.description}</p>
              )}

              {Object.keys(specs).length > 0 && (
                <div className={styles.specs}>
                  <h4>Spesifikasi Teknis</h4>
                  <table className={styles.specsTable}>
                    <tbody>
                      {Object.entries(specs).map(([k, v]) => (
                        <tr key={k}>
                          <td className={styles.specKey}>{k}</td>
                          <td className={styles.specVal}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className={styles.actions}>
                <Link to="/kontak" className="btn btn-red">Request Penawaran</Link>
                <a href={`https://wa.me/${COMPANY.whatsapp}?text=${waMsg}`} target="_blank" rel="noreferrer" className="btn btn-outline">💬 WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
