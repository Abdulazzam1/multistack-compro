// ── HomePage.jsx ──────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { Link }          from 'react-router-dom';
import BannerSlider      from '../components/home/BannerSlider';
import Marquee           from '../components/home/Banner';
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
      <BannerSlider />
      <Marquee />
      <AboutHome />
      <StatsSection />
      <FeaturedProducts />
      <ServicesSummary />
      <Testimonials />
      <NewsSection />
      <CTASection />
    </div>
  );
}

// ── AboutHome ─────────────────────────────────────────────────────────────────
function AboutHome() {
  const { data } = useFetch('/settings');
  const s = data?.data || {};

  return (
    <section className={styles.aboutHome}>
      <div className="container">
        <div className={styles.aboutGrid}>
          <div className={styles.aboutVisual}>
            <div className={styles.aboutImgWrap}>
              {s.about_image
                ? <img src={`/uploads/${s.about_image}`} alt="Tentang Multistack" />
                : <div className={styles.imgPlaceholder}>🏗</div>}
              {/* Badge tahun pengalaman — dari CMS stats_years */}
              <div className={styles.aboutBadge}>
                <span className={styles.badgeNum}>{s.stats_years || '16+'}</span>
                <span className={styles.badgeLabel}>Tahun Pengalaman</span>
              </div>
            </div>
          </div>

          <div className={styles.aboutContent}>
            <div className="section-label">Tentang Kami</div>
            <h2 className="section-title">
              Kepercayaan Dibangun dari <em>Setiap Proyek</em>
            </h2>
            <p className="section-sub">
              {s.about_description ||
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
            <Link to="/tentang-kami" className="btn btn-red" style={{ marginTop: '2rem', display: 'inline-flex' }}>
              Selengkapnya →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── StatsSection — murni dari CMS, sinkron dengan AboutPage ──────────────────
// Beranda: stats_projects, stats_clients, stats_years, stats_support
// AboutPage: stats_projects, stats_clients, stats_staff, stats_years
// Ubah sekali di CMS → update otomatis di kedua halaman
const parseNum    = (str) => parseInt((str || '0').replace(/\D/g, '')) || 0;
const parseSuffix = (str) => {
  if (!str) return '';
  if (str.includes('/7')) return '/7';
  if (str.includes('+'))  return '+';
  return '';
};

function StatsSection() {
  const ref      = useRef(null);
  const animated = useRef(false);

  const { data, loading } = useFetch('/settings');
  const s = data?.data || {};

  const stats = [
    { num: parseNum(s.stats_projects), suffix: parseSuffix(s.stats_projects), label: 'Proyek Selesai' },
    { num: parseNum(s.stats_clients),  suffix: parseSuffix(s.stats_clients),  label: 'Klien Puas' },
    { num: parseNum(s.stats_years),    suffix: parseSuffix(s.stats_years),    label: 'Tahun Pengalaman' },
    { num: parseNum(s.stats_support),  suffix: parseSuffix(s.stats_support),  label: 'Dukungan Teknis' },
  ];

  useEffect(() => {
    animated.current = false;
  }, [s.stats_projects, s.stats_clients, s.stats_years, s.stats_support]);

  useEffect(() => {
    const el = ref.current;
    if (!el || loading) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        el.querySelectorAll('[data-target]').forEach(span => {
          const target = parseInt(span.dataset.target) || 0;
          if (target === 0) return;
          let count   = 0;
          const step  = Math.max(1, Math.ceil(target / 60));
          const timer = setInterval(() => {
            count = Math.min(count + step, target);
            span.textContent = count;
            if (count >= target) clearInterval(timer);
          }, 30);
        });
      }
    }, { threshold: 0.3 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, s.stats_projects, s.stats_clients, s.stats_years, s.stats_support]);

  return (
    <section className={styles.statsSection} ref={ref}>
      <div className={styles.statsGrid}>
        {stats.map(stat => (
          <div key={stat.label} className={styles.statItem}>
            <div className="stat-num">
              {loading
                ? <span>—</span>
                : <><span data-target={stat.num}>0</span>{stat.suffix}</>
              }
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}