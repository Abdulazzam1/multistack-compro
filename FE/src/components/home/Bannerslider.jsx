// ── BannerSlider.jsx ──────────────────────────────────────────────────────────
// Carousel fullscreen yang tampil di posisi pertama halaman beranda.
// Mengambil data banner dari API CMS. Jika tidak ada banner, fallback ke Hero.
import { useState, useEffect, useCallback } from 'react';
import { Link }  from 'react-router-dom';
import useFetch  from '../../hooks/useFetch';
import Hero      from './Hero';
import { getImageUrl } from '../../utils/imageUrl';
import styles    from './BannerSlider.module.css';

const AUTO_PLAY_MS = 5000;

export default function BannerSlider() {
  const { data, loading } = useFetch('/banner');
  const banners = data?.data || [];

  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  const total = banners.length;

  const goTo   = useCallback((idx) => setCurrent((idx + total) % total), [total]);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-play
  useEffect(() => {
    if (total < 2 || paused) return;
    const id = setInterval(goNext, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, [total, paused, goNext]);

  // Reset index saat jumlah banner berubah
  useEffect(() => { setCurrent(0); }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext]);

  // Masih loading — tampilkan skeleton agar tidak layout shift
  if (loading) {
    return <div className={styles.skeleton} aria-hidden="true" />;
  }

  // Tidak ada banner — fallback ke Hero statis
  if (total === 0) {
    return <Hero />;
  }

  const active = banners[current];

  return (
    <section
      className={styles.slider}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Banner Promosi"
    >
      {/* ── Slides ── */}
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`${styles.slide} ${i === current ? styles.active : ''}`}
          aria-hidden={i !== current}
        >
          {/* Gambar latar */}
          <img
            src={getImageUrl(b.image_url)}
            alt={b.title || `Banner ${i + 1}`}
            className={styles.img}
            draggable={false}
          />

          {/* Overlay gelap */}
          <div className={styles.overlay} />

          {/* Konten teks (opsional — tampil hanya jika ada judul) */}
          {b.title && (
            <div className={styles.caption}>
              <p className={styles.captionLabel}>Informasi Terbaru</p>
              <h2 className={styles.captionTitle}>{b.title}</h2>
              {b.link_url && (
                b.link_url.startsWith('http')
                  ? (
                    <a href={b.link_url} target="_blank" rel="noreferrer" className={`btn btn-red ${styles.captionBtn}`}>
                      Selengkapnya →
                    </a>
                  )
                  : (
                    <Link to={b.link_url} className={`btn btn-red ${styles.captionBtn}`}>
                      Selengkapnya →
                    </Link>
                  )
              )}
            </div>
          )}
        </div>
      ))}

      {/* ── Navigasi Panah ── */}
      {total > 1 && (
        <>
          <button
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={goPrev}
            aria-label="Banner sebelumnya"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={goNext}
            aria-label="Banner berikutnya"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </>
      )}

      {/* ── Dots Indikator ── */}
      {total > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Pilih banner">
          {banners.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Banner ${i + 1}`}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => { goTo(i); setPaused(true); }}
            />
          ))}
        </div>
      )}

      {/* ── Progress bar auto-play ── */}
      {total > 1 && !paused && (
        <div className={styles.progressBar} key={current}>
          <div className={styles.progressFill} style={{ animationDuration: `${AUTO_PLAY_MS}ms` }} />
        </div>
      )}

      {/* ── Scroll hint ── */}
      <div className={styles.scrollHint}>
        <span>Scroll</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}