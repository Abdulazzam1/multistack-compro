// ── Hero.jsx ──────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.bg} />
      {/* Grid lines */}
      <div className={styles.gridLines}>
        <span style={{ left: '25%' }} /><span style={{ left: '50%' }} /><span style={{ left: '75%' }} />
      </div>
      <div className={styles.content}>
        <div className={styles.label}>
          <span className={styles.dot} />
          PT. Multistack Indonesia — Est. 2008
        </div>
        <h1 className={styles.title}>
          SOLUSI<br />
          <span className={styles.outline}>TERPADU</span><br />
          MEP
        </h1>
        <p className={styles.sub}>
          Mekanikal, Elektrikal &amp; VAC untuk industri, komersial, dan proyek infrastruktur skala nasional. Teknologi terdepan, layanan komprehensif.
        </p>
        <div className={styles.actions}>
          <Link to="/produk"  className="btn btn-red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            Lihat Produk
          </Link>
          <Link to="/kontak" className="btn btn-outline">Request Penawaran</Link>
        </div>
      </div>
      <div className={styles.scrollHint}>
        <span>Scroll</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
