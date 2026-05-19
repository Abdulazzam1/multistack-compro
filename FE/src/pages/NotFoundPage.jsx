import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>Halaman Tidak Ditemukan</h1>
      <p className={styles.desc}>Halaman yang Anda cari tidak ada atau sudah dipindahkan.</p>
      <Link to="/" className="btn btn-red">← Kembali ke Beranda</Link>
    </div>
  );
}
