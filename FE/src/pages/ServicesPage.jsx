import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getImageUrl } from '../utils/imageUrl';
import styles from './ServicesPage.module.css';

export default function ServicesPage() {
  const { data, loading } = useFetch('/services');
  const services = data?.data || [];
  const [selected, setSelected] = useState(null);

  return (
    <div className="page-enter">
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb"><a href="/">Beranda</a><span>/</span><span>Layanan</span></nav>
          <div className="section-label">Apa yang Kami Kerjakan</div>
          <h1 className="page-title">LAYANAN <em style={{ color:'var(--red)',fontStyle:'normal' }}>KAMI</em></h1>
          <p className="section-sub">Komprehensif dari desain, pengadaan, instalasi, hingga purna jual</p>
        </div>
      </div>

      {/* Service Detail Modal */}
      {selected && (
        <div className={styles.modal} onClick={() => setSelected(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <div className={styles.modalIcon}>{selected.icon || '⚙'}</div>
            <div className="section-label" style={{ justifyContent: 'flex-start' }}>Layanan</div>
            <h2 className={styles.modalTitle}>{selected.name}</h2>
            <p className={styles.modalDesc}>{selected.description}</p>
            {selected.scope && (
              <>
                <h4 className={styles.scopeTitle}>Lingkup Pekerjaan</h4>
                <div className={styles.scopeList}>
                  {selected.scope.split('\n').filter(Boolean).map((s, i) => (
                    <div key={i} className={styles.scopeItem}>
                      <span className={styles.scopeDot}>✦</span>{s.trim()}
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className={styles.modalActions}>
              <Link to="/kontak" className="btn btn-red" onClick={() => setSelected(null)}>Konsultasi Sekarang</Link>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      <section className={styles.servicesSection}>
        <div className="container">
          {loading ? (
            <div className={styles.loadingList}>{[1,2,3,4].map(i=><div key={i} className={styles.skeleton}/>)}</div>
          ) : (
            <div className={styles.serviceList}>
              {services.map((s, i) => (
                <div key={s.id} className={styles.serviceRow} onClick={() => setSelected(s)}>
                  <div className={styles.rowNum}>0{i+1}</div>
                  <div className={styles.rowInfo}>
                    <h3>{s.name}</h3>
                    <p>{s.description}</p>
                  </div>
                  <div className={styles.rowArrow}>→</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Butuh Bantuan?</div>
          <h2 className="section-title">Konsultasikan Kebutuhan <em>Proyek Anda</em></h2>
          <p className="section-sub" style={{ margin: '0 auto 2rem' }}>Tim ahli kami siap membantu menemukan solusi MEP terbaik untuk kebutuhan spesifik Anda.</p>
          <Link to="/kontak" className="btn btn-red">Hubungi Tim Kami →</Link>
        </div>
      </section>
    </div>
  );
}
