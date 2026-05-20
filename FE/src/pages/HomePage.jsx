// ── HomePage.jsx ──────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { Link }          from 'react-router-dom';
import BannerSlider      from '../components/home/BannerSlider';  // ← posisi pertama
import Marquee           from '../components/home/Banner';         // ← ticker
import CTASection        from '../components/home/CTASection';
import FeaturedProducts  from '../components/home/FeaturedProducts';
import ServicesSummary   from '../components/home/ServicesSummary';
import Testimonials      from '../components/home/Testimonials';
import NewsSection       from '../components/home/NewsSection';
import styles            from './HomePage.module.css';
import useFetch          from '../hooks/useFetch';

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* 1. Banner Slider fullscreen — posisi paling atas */}
      {/* Jika ada banner di CMS → tampil carousel gambar */}
      {/* Jika tidak ada banner   → fallback ke Hero teks */}
      <BannerSlider />

      {/* 2. Ticker marquee */}
      <Marquee />

      {/* 3. Tentang Kami singkat */}
      <AboutHome />

      {/* 4. Statistik */}
      <StatsSection />

      {/* 5. Produk Unggulan */}
      <FeaturedProducts />

      {/* 6. Layanan */}
      <ServicesSummary />

      {/* 7. Testimoni */}
      <Testimonials />

      {/* 8. Berita */}
      <NewsSection />

      {/* 9. CTA */}
      <CTASection />
    </div>
  );
}

// ── AboutHome ─────────────────────────────────────────────────────────────────
function AboutHome() {
  const { data } = useFetch('/settings');
  const settings = data?.data || {};

  return (
    <section className={styles.aboutHome}>
      <div className="container">
        <div className={styles.aboutGrid}>
          {/* Gambar */}
          <div className={styles.aboutVisual}>
            <div className={styles.aboutImgWrap}>
              {settings.about_image
                ? <img src={`/uploads/${settings.about_image}`} alt="Tentang Multistack" />
                : <div className={styles.imgPlaceholder}>🏗</div>}
              <div className={styles.aboutBadge}>
                <span className={styles.badgeNum}>16+</span>
                <span className={styles.badgeLabel}>Tahun Pengalaman</span>
              </div>
            </div>
          </div>

          {/* Teks */}
          <div className={styles.aboutContent}>
            <div className="section-label">Tentang Kami</div>
            <h2 className="section-title">
              Kepercayaan Dibangun dari <em>Setiap Proyek</em>
            </h2>
            <p className="section-sub">
              {settings.about_description ||
                'PT. Multistack Indonesia adalah perusahaan terkemuka dalam penyediaan solusi MEP terpadu. Dengan rekam jejak lebih dari 16 tahun, kami melayani berbagai sektor industri dari Sabang sampai Merauke.'}
            </p>
            <div className="red-line" />
            <div className={styles.valuesGrid}>
              {[
                { icon: '🎯', title: 'Presisi & Kualitas', desc: 'Standar internasional di setiap pekerjaan' },
                { icon: '🤝', title: 'Partnership',        desc: 'Mitra terpercaya brand global' },
                { icon: '⚡', title: 'Inovasi',            desc: 'Teknologi terkini & solusi terdepan' },
                { icon: '🛡', title: 'Sertifikasi',        desc: 'ISO 9001 & standar keselamatan' },
              ].map(v => (
                <div key={v.title} className={styles.valItem}>
                  <span className={styles.valIcon}>{v.icon}</span>
                  <div>
                    <h4>{v.title}</h4>
                    <p>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/tentang-kami"
              className="btn btn-red"
              style={{ marginTop: '2rem', display: 'inline-flex' }}
            >
              Selengkapnya →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── StatsSection ──────────────────────────────────────────────────────────────
function StatsSection() {
  const ref      = useRef(null);
  const animated = useRef(false);

  const stats = [
    { num: 500, suffix: '+',  label: 'Proyek Selesai' },
    { num: 200, suffix: '+',  label: 'Klien Puas' },
    { num: 16,  suffix: '+',  label: 'Tahun Pengalaman' },
    { num: 24,  suffix: '/7', label: 'Dukungan Teknis' },
  ];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        el.querySelectorAll('[data-target]').forEach(span => {
          const target = parseInt(span.dataset.target);
          let count    = 0;
          const step   = Math.ceil(target / 60);
          const timer  = setInterval(() => {
            count = Math.min(count + step, target);
            span.textContent = count;
            if (count >= target) clearInterval(timer);
          }, 30);
        });
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.statsSection} ref={ref}>
      <div className={styles.statsGrid}>
        {stats.map(s => (
          <div key={s.label} className={styles.statItem}>
            <div className="stat-num">
              <span data-target={s.num}>0</span>{s.suffix}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}