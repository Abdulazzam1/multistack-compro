import { useState } from 'react';
import { submitContact, submitRFQ } from '../services/contactService';
import { COMPANY } from '../utils/constants';
import styles from './ContactPage.module.css';

export default function ContactPage() {
  const [tab, setTab] = useState('contact');
  const [cForm, setCForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' });
  const [rForm, setRForm] = useState({ company_name:'', contact_name:'', email:'', phone:'', product_interest:'', quantity:'', message:'' });
  const [cSuccess, setCSuccess] = useState(false);
  const [rSuccess, setRSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleContact = async e => {
    e.preventDefault();
    if (!cForm.name || !cForm.email || !cForm.message) return alert('Nama, email, dan pesan wajib diisi.');
    setSubmitting(true);
    try {
      await submitContact(cForm);
      setCSuccess(true);
      setCForm({ name:'', email:'', phone:'', subject:'', message:'' });
      setTimeout(() => setCSuccess(false), 6000);
    } catch { alert('Gagal mengirim pesan. Coba lagi.'); }
    finally { setSubmitting(false); }
  };

  const handleRFQ = async e => {
    e.preventDefault();
    if (!rForm.company_name || !rForm.email || !rForm.product_interest) return alert('Perusahaan, email, dan produk wajib diisi.');
    setSubmitting(true);
    try {
      await submitRFQ(rForm);
      setRSuccess(true);
      setRForm({ company_name:'', contact_name:'', email:'', phone:'', product_interest:'', quantity:'', message:'' });
      setTimeout(() => setRSuccess(false), 6000);
    } catch { alert('Gagal mengirim RFQ. Coba lagi.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="page-enter">
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb"><a href="/">Beranda</a><span>/</span><span>Kontak</span></nav>
          <div className="section-label">Hubungi Kami</div>
          <h1 className="page-title">KONTAK <em style={{ color:'var(--red)',fontStyle:'normal' }}>&amp; RFQ</em></h1>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.grid}>
            {/* Info Column */}
            <div className={styles.infoCol}>
              <h3 className={styles.infoTitle}>Informasi Kontak</h3>
              {[
                { icon:'📍', label:'Alamat',         val: COMPANY.address },
                { icon:'📞', label:'Telepon Sales',   val: COMPANY.phone.sales, href:`tel:${COMPANY.phone.sales.replace(/\D/g,'')}` },
                { icon:'🔧', label:'Telepon Service', val: COMPANY.phone.service, href:`tel:${COMPANY.phone.service.replace(/\D/g,'')}` },
                { icon:'✉',  label:'Email',           val: COMPANY.email, href:`mailto:${COMPANY.email}` },
                { icon:'🕐', label:'Jam Kerja',       val: 'Senin–Jumat: 08.00–17.00 WIB' },
              ].map(item => (
                <div key={item.label} className={styles.contactItem}>
                  <div className={styles.ciIcon}>{item.icon}</div>
                  <div>
                    <h4>{item.label}</h4>
                    {item.href
                      ? <a href={item.href}>{item.val}</a>
                      : <p>{item.val}</p>}
                  </div>
                </div>
              ))}

              <a
                href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent('Halo Multistack Indonesia, saya ingin berkonsultasi.')}`}
                target="_blank" rel="noreferrer"
                className={`btn btn-red ${styles.waBtn}`}
              >
                💬 Chat WhatsApp Sekarang
              </a>

              <div className={styles.contactPersons}>
                <h4>Contact Person</h4>
                {[
                  { name:'Ahmad Suryadi',   role:'Sales Manager',    phone:'0812-3456-7890' },
                  { name:'Rina Pratiwi',    role:'Customer Service', phone:'0821-9876-5432' },
                ].map(cp => (
                  <div key={cp.name} className={styles.cp}>
                    <div className={styles.cpAvatar}>{cp.name.slice(0,2).toUpperCase()}</div>
                    <div>
                      <div className={styles.cpName}>{cp.name}</div>
                      <div className={styles.cpRole}>{cp.role} — {cp.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Column */}
            <div className={styles.formBox}>
              {/* Tabs */}
              <div className={styles.tabs}>
                <button className={`${styles.tab} ${tab==='contact' ? styles.activeTab : ''}`} onClick={() => setTab('contact')}>Kirim Pesan</button>
                <button className={`${styles.tab} ${tab==='rfq' ? styles.activeTab : ''}`} onClick={() => setTab('rfq')}>Request RFQ</button>
              </div>

              {/* Contact Form */}
              {tab === 'contact' && (
                <form onSubmit={handleContact}>
                  <h3 className={styles.formTitle}>Kirim Pesan</h3>
                  <p className={styles.formSub}>Kami siap menjawab dalam 1×24 jam kerja.</p>
                  <div className="form-row">
                    <div className="form-group"><label>Nama Lengkap *</label><input value={cForm.name} onChange={e=>setCForm(f=>({...f,name:e.target.value}))} placeholder="John Doe" required /></div>
                    <div className="form-group"><label>No. Telepon</label><input value={cForm.phone} onChange={e=>setCForm(f=>({...f,phone:e.target.value}))} placeholder="0812-xxxx-xxxx" /></div>
                  </div>
                  <div className="form-group"><label>Email *</label><input type="email" value={cForm.email} onChange={e=>setCForm(f=>({...f,email:e.target.value}))} placeholder="email@perusahaan.com" required /></div>
                  <div className="form-group">
                    <label>Subjek</label>
                    <select value={cForm.subject} onChange={e=>setCForm(f=>({...f,subject:e.target.value}))}>
                      <option value="">-- Pilih Subjek --</option>
                      {['Pertanyaan Produk','Pertanyaan Layanan','Komplain / Keluhan','Kerjasama & Partnership','Lainnya'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Pesan *</label><textarea rows={5} value={cForm.message} onChange={e=>setCForm(f=>({...f,message:e.target.value}))} placeholder="Tulis pesan Anda..." required /></div>
                  {cSuccess && <div className={styles.success}>✅ Pesan berhasil dikirim! Kami akan segera menghubungi Anda.</div>}
                  <button type="submit" className={`btn btn-red ${styles.submitBtn}`} disabled={submitting}>{submitting ? 'Mengirim...' : 'Kirim Pesan →'}</button>
                </form>
              )}

              {/* RFQ Form */}
              {tab === 'rfq' && (
                <form onSubmit={handleRFQ}>
                  <h3 className={styles.formTitle}>Request for Quotation</h3>
                  <p className={styles.formSub}>Isi formulir berikut untuk mendapatkan penawaran harga.</p>
                  <div className="form-row">
                    <div className="form-group"><label>Nama Perusahaan *</label><input value={rForm.company_name} onChange={e=>setRForm(f=>({...f,company_name:e.target.value}))} placeholder="PT. Nama Perusahaan" required /></div>
                    <div className="form-group"><label>Nama PIC *</label><input value={rForm.contact_name} onChange={e=>setRForm(f=>({...f,contact_name:e.target.value}))} placeholder="Nama Contact Person" /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Email *</label><input type="email" value={rForm.email} onChange={e=>setRForm(f=>({...f,email:e.target.value}))} placeholder="pic@perusahaan.com" required /></div>
                    <div className="form-group"><label>No. Telepon *</label><input value={rForm.phone} onChange={e=>setRForm(f=>({...f,phone:e.target.value}))} placeholder="0812-xxxx-xxxx" /></div>
                  </div>
                  <div className="form-group"><label>Produk / Layanan yang Diminati *</label><input value={rForm.product_interest} onChange={e=>setRForm(f=>({...f,product_interest:e.target.value}))} placeholder="Misal: Chiller 200TR, Panel MV, dll." required /></div>
                  <div className="form-group"><label>Estimasi Kuantitas</label><input value={rForm.quantity} onChange={e=>setRForm(f=>({...f,quantity:e.target.value}))} placeholder="Misal: 2 unit, 1 paket, dll." /></div>
                  <div className="form-group"><label>Keterangan Tambahan</label><textarea rows={4} value={rForm.message} onChange={e=>setRForm(f=>({...f,message:e.target.value}))} placeholder="Spesifikasi khusus, timeline proyek, dll." /></div>
                  {rSuccess && <div className={styles.success}>✅ RFQ berhasil dikirim! Tim sales kami akan menghubungi dalam 1×24 jam.</div>}
                  <button type="submit" className={`btn btn-red ${styles.submitBtn}`} disabled={submitting}>{submitting ? 'Mengirim...' : 'Kirim RFQ →'}</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
