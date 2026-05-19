import useFetch from '../../hooks/useFetch';
import styles from './Testimonials.module.css';

export default function Testimonials() {
  const { data } = useFetch('/testimonials');
  const items = (data?.data || []).slice(0,3);
  if (!items.length) return null;
  return (
    <section className={styles.section}>
      <div className="container">
        <div className="section-label">Testimoni</div>
        <h2 className="section-title">Yang Klien Kami <em>Katakan</em></h2>
        <div className={styles.grid}>
          {items.map(t => (
            <div key={t.id} className={styles.card}>
              <div className={styles.stars}>{'★'.repeat(t.rating||5)}</div>
              <p className={styles.text}>"{t.content}"</p>
              <div className={styles.author}>
                <div className={styles.avatar}>{(t.client_name||'?')[0].toUpperCase()}</div>
                <div>
                  <strong>{t.client_name}</strong>
                  <span>{t.client_title}{t.client_company ? ` — ${t.client_company}` : ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
