import useFetch        from '../hooks/useFetch';
import { getImageUrl } from '../utils/imageUrl';
import styles          from './AboutPage.module.css';

export default function AboutPage() {
  const { data: settingsData } = useFetch('/settings');
  const { data: awardsData }   = useFetch('/awards');
  const s      = settingsData?.data || {};
  const awards = awardsData?.data   || [];

  // ── Stats halaman Tentang Kami — murni dari CMS, tidak ada hardcode ────────
  // Komposisi berbeda dari Beranda: ganti "Dukungan" → "Tenaga Ahli"
  const statsAbout = [
    { num: s.stats_projects, label: 'Proyek Selesai' },
    { num: s.stats_clients,  label: 'Klien Aktif' },
    { num: s.stats_staff,    label: 'Tenaga Ahli' },
    { num: s.stats_years,    label: 'Tahun Pengalaman' },
  ];

  // Tampilkan stats hanya jika minimal satu ada nilainya dari CMS
  const hasStats = statsAbout.some(st => st.num);

  return (
    <div className="page-enter">

      {/* ── Page Hero ── */}
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb">
            <a href="/">Beranda</a><span>/</span><span>Tentang Kami</span>
          </nav>
          <div className="section-label">Siapa Kami</div>
          <h1 className="page-title">
            TENTANG <em style={{ color:'var(--red)', fontStyle:'normal' }}>KAMI</em>
          </h1>
          <p className="section-sub">Pelopor solusi MEP terpadu di Indonesia sejak 2008</p>
        </div>
      </div>

      {/* ── Story ── */}
      <section className={styles.story}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div>
              <div className="section-label">Perjalanan Kami</div>
              <h2 className="section-title">Dibangun di Atas <em>Kepercayaan</em></h2>
              <p className={styles.text}>
                {s.about_description ||
                  'PT. Multistack Indonesia berdiri pada tahun 2008 dengan visi menjadi mitra terpercaya dalam solusi Mekanikal, Elektrikal, dan VAC di Indonesia. Bermula dari tim kecil, kini kami telah berkembang menjadi perusahaan dengan lebih dari 350 karyawan profesional bersertifikat.'}
              </p>
              <p className={styles.text} style={{ marginTop: '1rem' }}>
                Kami bermitra dengan merek-merek terkemuka dunia seperti Carrier, Trane, Grundfos, ABB,
                Schneider Electric, dan Siemens — memastikan setiap solusi menggunakan teknologi dan komponen terbaik.
              </p>
              <div className={styles.vmGrid}>
                <div className={styles.vmBox}>
                  <h3>Visi</h3>
                  <p>
                    {s.vision ||
                      'Menjadi perusahaan MEP terdepan di Asia Tenggara yang mengutamakan inovasi, keberlanjutan, dan kepuasan pelanggan.'}
                  </p>
                </div>
                <div className={styles.vmBox}>
                  <h3>Misi</h3>
                  <ul>
                    {(s.mission || 'Memberikan solusi MEP berkualitas tinggi\nMembangun SDM kompeten & bersertifikat\nBerinovasi untuk efisiensi energi\nMembangun kemitraan jangka panjang')
                      .split('\n')
                      .filter(Boolean)
                      .map((m, i) => <li key={i}>{m.trim()}</li>)}
                  </ul>
                </div>
              </div>
            </div>
            <div className={styles.storyImg}>
              {s.about_image
                ? <img src={getImageUrl(s.about_image)} alt="Tentang Multistack" />
                : <div className={styles.imgPlaceholder}>🏢</div>}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats — dari CMS, hanya tampil jika ada data ── */}
      {hasStats && (
        <section className={styles.statsSection}>
          <div className="container">
            <div className={styles.statsGrid}>
              {statsAbout.map(stat => (
                stat.num ? (
                  <div key={stat.label} className={styles.statItem}>
                    <div className="stat-num">{stat.num}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Values ── */}
      <section className={styles.valuesSection}>
        <div className="container">
          <div className="section-label">Nilai Perusahaan</div>
          <h2 className="section-title">Apa yang <em>Mendefinisikan</em> Kami</h2>
          <div className={styles.valuesGrid}>
            {[
              { icon: '🎯', title: 'Presisi',       desc: 'Setiap pekerjaan dikerjakan dengan standar teknis tertinggi dan quality control ketat.' },
              { icon: '💡', title: 'Inovasi',       desc: 'Selalu mengadopsi teknologi terbaru untuk solusi yang lebih efisien dan berkelanjutan.' },
              { icon: '🤝', title: 'Integritas',    desc: 'Transparansi dan kejujuran dalam setiap aspek bisnis dan hubungan dengan klien.' },
              { icon: '🌱', title: 'Keberlanjutan', desc: 'Komitmen terhadap solusi ramah lingkungan dan efisiensi energi jangka panjang.' },
            ].map(v => (
              <div key={v.title} className={styles.valueCard}>
                <div className={styles.valueIcon}>{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Awards — dari CMS, fallback statis ── */}
      <section className={styles.awardsSection}>
        <div className="container">
          <div className="section-label">Penghargaan &amp; Sertifikasi</div>
          <h2 className="section-title">Diakui oleh <em>Industri</em></h2>
          <div className={styles.awardsGrid}>
            {awards.length > 0
              ? awards.map(a => (
                  <div key={a.id} className={styles.awardCard}>
                    {a.image_url
                      ? <img src={getImageUrl(a.image_url)} alt={a.title} className={styles.awardImg} />
                      : <div className={styles.awardBadge}>{a.type === 'sertifikasi' ? '🏅' : '🏆'}</div>}
                    <h4>{a.title}</h4>
                    <p>{a.issued_by}</p>
                    <div className={styles.awardYear}>{a.year}</div>
                  </div>
                ))
              : [
                  { icon: '🏅', title: 'ISO 9001:2015',          by: 'LRQA',        year: '2019' },
                  { icon: '🏆', title: 'Best MEP Contractor',    by: 'GAPENSI',     year: '2023' },
                  { icon: '⭐', title: 'Top 10 Green Building',  by: 'GBCI',        year: '2024' },
                  { icon: '🛡', title: 'K3 Zero Accident Award', by: 'Kemnaker RI', year: '2023' },
                ].map(a => (
                  <div key={a.title} className={styles.awardCard}>
                    <div className={styles.awardBadge}>{a.icon}</div>
                    <h4>{a.title}</h4>
                    <p>{a.by}</p>
                    <div className={styles.awardYear}>{a.year}</div>
                  </div>
                ))
            }
          </div>
        </div>
      </section>

    </div>
  );
}