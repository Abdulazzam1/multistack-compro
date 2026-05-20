import { useEffect, useRef } from 'react';
import useFetch from '../../hooks/useFetch';
import styles   from './StatsSection.module.css';

// ── Parsing angka dari string CMS misal "500+" → 500, "16+" → 16 ──────────
const parseNum = (str) => parseInt((str || '0').replace(/\D/g, '')) || 0;
const getSuffix = (str) => {
  if (!str) return '';
  if (str.includes('/7')) return '/7';
  if (str.includes('+'))  return '+';
  return '';
};

export default function StatsSection() {
  const ref      = useRef(null);
  const animated = useRef(false);

  // Ambil dari CMS settings — sama persis dengan yang dipakai di AboutPage
  const { data } = useFetch('/settings');
  const s = data?.data || {};

  // Susun stats dari data CMS
  // Beranda: Proyek, Klien, Tahun, Dukungan
  const stats = [
    {
      num:    parseNum(s.stats_projects) || 500,
      suffix: getSuffix(s.stats_projects) || '+',
      label:  'Proyek Selesai',
    },
    {
      num:    parseNum(s.stats_clients) || 200,
      suffix: getSuffix(s.stats_clients) || '+',
      label:  'Klien Puas',
    },
    {
      num:    parseNum(s.stats_years) || 16,
      suffix: getSuffix(s.stats_years) || '+',
      label:  'Tahun Pengalaman',
    },
    {
      num:    parseNum(s.stats_support) || 24,
      suffix: getSuffix(s.stats_support) || '/7',
      label:  'Dukungan Teknis',
    },
  ];

  // Animasi counter ketika section masuk viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reset animasi setiap kali data berubah
    animated.current = false;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        el.querySelectorAll('[data-target]').forEach(span => {
          const target = parseInt(span.dataset.target) || 0;
          let count    = 0;
          const step   = Math.max(1, Math.ceil(target / 60));
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
  }, [s.stats_projects, s.stats_clients, s.stats_years, s.stats_support]);

  return (
    <section className={styles.section} ref={ref}>
      <div className={styles.grid}>
        {stats.map(stat => (
          <div key={stat.label} className={styles.item}>
            <div className="stat-num">
              <span data-target={stat.num}>0</span>{stat.suffix}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}