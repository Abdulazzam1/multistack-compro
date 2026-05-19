import { useEffect, useRef } from 'react';
import styles from './StatsSection.module.css';

const STATS = [
  { num: 500, suffix: '+', label: 'Proyek Selesai' },
  { num: 200, suffix: '+', label: 'Klien Puas' },
  { num: 16,  suffix: '+', label: 'Tahun Pengalaman' },
  { num: 24,  suffix: '/7', label: 'Dukungan Teknis' },
];

export default function StatsSection() {
  const ref = useRef(null);
  const animated = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !animated.current) {
        animated.current = true;
        el.querySelectorAll('[data-target]').forEach(span => {
          const target = parseInt(span.dataset.target);
          let count = 0;
          const step = Math.ceil(target / 60);
          const timer = setInterval(() => {
            count = Math.min(count + step, target);
            span.textContent = count;
            if (count >= target) clearInterval(timer);
          }, 30);
        });
      }
    }, { threshold: 0.3 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return (
    <section className={styles.section} ref={ref}>
      <div className={styles.grid}>
        {STATS.map(s => (
          <div key={s.label} className={styles.item}>
            <div className="stat-num"><span data-target={s.num}>0</span>{s.suffix}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
