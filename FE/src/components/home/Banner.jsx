// ── Banner.jsx ────────────────────────────────────────────────────────────────
// Komponen ini sekarang hanya menampilkan Marquee ticker di bawah BannerSlider.
// Banner utama (fullscreen carousel) sudah dipindah ke BannerSlider.jsx
import styles from './Banner.module.css';

const MARQUEE_ITEMS = [
  'MEKANIKAL', 'ELEKTRIKAL', 'HVAC SYSTEM',
  'FIRE PROTECTION', 'PLUMBING', 'BUILDING AUTOMATION',
];

export default function Marquee() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className={styles.marqueeWrap} aria-hidden="true">
      <div className={styles.track}>
        {doubled.map((item, i) => (
          <span key={i} className={styles.item}>
            {item}
            <span className={styles.sep}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}