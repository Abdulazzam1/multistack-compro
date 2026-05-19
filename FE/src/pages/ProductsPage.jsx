import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getProducts } from '../services/productService';
import { getImageUrl } from '../utils/imageUrl';
import { truncate } from '../utils/formatters';
import styles from './ProductsPage.module.css';

export default function ProductsPage() {
  const { data: catData } = useFetch('/categories?type=product');
  const categories = catData?.data || [];

  const [activeCategory, setActiveCategory] = useState('');
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;
    getProducts(params)
      .then(res => setProducts(res?.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  return (
    <div className="page-enter">
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb"><a href="/">Beranda</a><span>/</span><span>Produk</span></nav>
          <div className="section-label">Katalog</div>
          <h1 className="page-title">PRODUK <em style={{ color:'var(--red)',fontStyle:'normal' }}>KAMI</em></h1>
          <p className="section-sub">Ribuan produk MEP berkualitas dari brand terkemuka dunia</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Filter Produk</div>
          <div className={styles.filterGroup}>
            <button
              className={`${styles.filterBtn} ${!activeCategory ? styles.active : ''}`}
              onClick={() => setActiveCategory('')}
            >Semua Produk</button>
            {categories.map(c => (
              <button
                key={c.id}
                className={`${styles.filterBtn} ${activeCategory === c.name ? styles.active : ''}`}
                onClick={() => setActiveCategory(c.name)}
              >{c.name}</button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <div className={styles.main}>
          <div className={styles.mainHeader}>
            <h2>{activeCategory || 'Semua Produk'}</h2>
            <input
              type="search" placeholder="Cari produk atau brand..."
              className={styles.searchInput}
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <p className={styles.count}>{loading ? 'Memuat...' : `${products.length} produk ditemukan`}</p>

          {loading ? (
            <div className={styles.grid}>{[1,2,3,4,5,6].map(i=><div key={i} className={styles.skeleton}/>)}</div>
          ) : products.length === 0 ? (
            <div className={styles.empty}>Tidak ada produk yang ditemukan.</div>
          ) : (
            <div className={styles.grid}>
              {products.map(p => (
                <Link key={p.id} to={`/produk/${p.slug}`} className={styles.prodCard}>
                  <div className={styles.prodImg}>
                    {p.images?.[0]
                      ? <img src={getImageUrl(p.images[0])} alt={p.name} />
                      : <span className={styles.imgPlaceholder}>📦</span>}
                  </div>
                  <div className={styles.prodInfo}>
                    <div className={styles.prodBrand}>{p.brand || p.category}</div>
                    <div className={styles.prodName}>{p.name}</div>
                    <div className={styles.prodCat}>{p.category}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
