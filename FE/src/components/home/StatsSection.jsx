import { useEffect, useRef } from 'react';
import useFetch from '../../hooks/useFetch';
import styles   from './StatsSection.module.css';

// ── Parse angka dan suffix dari string CMS ───────────────────────────────────
// "500+" → { num: 500, suffix: '+' }
// "24/7" → { num: 24,  suffix: '/7' }
// "16"   → { num: 16,  suffix: '' }
const parse = (str) => {
  if (!str) return { num: 0, suffix: '' };
  const suffix = str.includes('/7') ? '/7' : str.includes('+') ? '+' : '';
  const num    = parseInt(str.replace(/\D/g, '')) || 0;
  return { num, suffix };
};

export default function StatsSection() {
  const ref      = useRef(null);
  const animated = useRef(false);

  // Ambil dari CMS settings
  const { data, loading } = useFetch('/settings');
  const s = data?.data || {};

  // Beranda: 4 stats — Proyek, Klien, Tahun, Dukungan
  // Semua murni dari CMS, tidak ada angka hardcode
  const stats = [
    { ...parse(s.stats_projects), label: 'Proyek Selesai' },
    { ...parse(s.stats_clients),  label: 'Klien Puas' },
    { ...parse(s.stats_years),    label: 'Tahun Pengalaman' },
    { ...parse(s.stats_support),  label: 'Dukungan Teknis' },
  ];

  // Reset animasi setiap kali data dari CMS berubah
  useEffect(() => {
    animated.current = false;
  }, [s.stats_projects, s.stats_clients, s.stats_years, s.stats_support]);

  // Animasi counter ketika section masuk viewport
  useEffect(() => {
    const el = ref.current;
    if (!el || loading) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        el.querySelectorAll('[data-target]').forEach(span => {
          const target = parseInt(span.dataset.target) || 0;
          if (target === 0) { span.textContent = '0'; return; }
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

  // Jangan render jika semua angka 0 (data belum masuk)
  if (!loading && stats.every(s => s.num === 0)) return null;

  return (
    <section className={styles.section} ref={ref}>
      <div className={styles.grid}>
        {stats.map(stat => (
          <div key={stat.label} className={styles.item}>
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