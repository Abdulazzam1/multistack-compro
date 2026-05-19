import { Link } from 'react-router-dom';
import styles from './CTASection.module.css';

export default function CTASection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className="section-label" style={{justifyContent:'center'}}>Mulai Sekarang</div>
        <h2 className="section-title" style={{textAlign:'center',fontSize:'clamp(2.5rem,5vw,4.5rem)'}}>
          Siap Memulai <em>Proyek</em> Anda?
        </h2>
        <p className="section-sub" style={{margin:'0 auto 2.5rem',textAlign:'center'}}>
          Tim ahli kami siap berkonsultasi dan memberikan solusi terbaik untuk kebutuhan MEP proyek Anda.
        </p>
        <div className={styles.actions}>
          <Link to="/kontak" className="btn btn-red">💬 Konsultasi Gratis</Link>
          <Link to="/kontak" state={{ tab: 'rfq' }} className="btn btn-outline">Request RFQ</Link>
        </div>
      </div>
    </section>
  );
}
