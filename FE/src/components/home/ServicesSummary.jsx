import useFetch from '../../hooks/useFetch';
import { Link } from 'react-router-dom';
import styles from './ServicesSummary.module.css';

const FALLBACK = [
  { icon:'❄', name:'HVAC & Refrigerasi',     description:'Instalasi, komisioning, dan pemeliharaan sistem pendingin skala industrial hingga komersial.', slug:'hvac-sistem-refrigerasi' },
  { icon:'⚡', name:'Sistem Elektrikal',        description:'Distribusi daya, panel kontrol, UPS, genset, dan manajemen energi gedung.', slug:'sistem-elektrikal' },
  { icon:'💧', name:'Plumbing & Sanitasi',      description:'Sistem air bersih, air limbah, pompa, serta fire hydrant dan sprinkler.', slug:'plumbing-sanitasi' },
  { icon:'🔥', name:'Fire Protection',          description:'Deteksi dini, suppression system, dan alat pemadam bersertifikat NFPA.', slug:'fire-protection-system' },
  { icon:'🤖', name:'Building Automation',       description:'BMS/BAS, smart control, IoT integration untuk efisiensi operasional gedung.', slug:'building-automation-system' },
  { icon:'🔧', name:'Maintenance & After-Sales', description:'Preventive & corrective maintenance, spare parts original, garansi purna jual.', slug:'maintenance-after-sales' },
];

export default function ServicesSummary() {
  const { data } = useFetch('/services');
  const services = (data?.data?.length > 0 ? data.data : FALLBACK).slice(0,6);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div className="section-label" style={{justifyContent:'center'}}>Layanan Kami</div>
          <h2 className="section-title" style={{textAlign:'center'}}>Apa yang Kami <em>Tawarkan</em></h2>
          <p className="section-sub" style={{margin:'0 auto'}}>Layanan komprehensif dari desain, pengadaan, instalasi, hingga purna jual.</p>
        </div>
        <div className={styles.grid}>
          {services.map(s => (
            <Link key={s.id||s.slug} to={`/layanan`} className={styles.card}>
              <div className={styles.icon}>{s.icon || '⚙'}</div>
              <h3>{s.name}</h3>
              <p>{s.description}</p>
            </Link>
          ))}
        </div>
        <div style={{textAlign:'center',marginTop:'2.5rem'}}>
          <Link to="/layanan" className="btn btn-outline">Lihat Semua Layanan →</Link>
        </div>
      </div>
    </section>
  );
}
