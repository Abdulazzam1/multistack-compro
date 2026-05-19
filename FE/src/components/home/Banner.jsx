import useFetch from '../../hooks/useFetch';
import styles from './Banner.module.css';

const MARQUEE_ITEMS = ['MEKANIKAL','ELEKTRIKAL','HVAC SYSTEM','FIRE PROTECTION','PLUMBING','BUILDING AUTOMATION'];

export default function Banner() {
  const { data } = useFetch('/banner');
  const banners  = data?.data || [];

  return (
    <>
      {/* Marquee ticker */}
      <div className={styles.marqueeWrap}>
        <div className={styles.track}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className={styles.item}>
              {item}
              {i % MARQUEE_ITEMS.length !== MARQUEE_ITEMS.length - 1 && <span className={styles.sep}>✦</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Banner images (if any) */}
      {banners.length > 0 && (
        <div className={styles.bannerRow}>
          {banners.map(b => (
            b.link_url
              ? <a key={b.id} href={b.link_url} className={styles.bannerImg}><img src={`/uploads/${b.image_url}`} alt={b.title || ''} /></a>
              : <div key={b.id} className={styles.bannerImg}><img src={`/uploads/${b.image_url}`} alt={b.title || ''} /></div>
          ))}
        </div>
      )}
    </>
  );
}
