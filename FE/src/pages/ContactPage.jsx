import { useState, useMemo } from 'react';
import { submitContact, submitRFQ } from '../services/contactService';
import useFetch from '../hooks/useFetch';
import styles   from './ContactPage.module.css';

export default function ContactPage() {
  // Ambil semua info kontak dari CMS settings
  const { data: settingsData } = useFetch('/settings');
  const s = settingsData?.data || {};

  // Nomor WA dari contact_sales
  const waNum = useMemo(() => {
    const raw = (s.contact_sales || '').replace(/\D/g, '');
    if (!raw) return '6281234567890';
    return raw.startsWith('0') ? '62' + raw.slice(1) : raw;
  }, [s.contact_sales]);

  // contact_persons: array [{name, phone, role}] dari CMS
  const contactPersons = Array.isArray(s.contact_persons) ? s.contact_persons : [];

  // ── Form state ────────────────────────────────────────────────────────────
  const [tab,        setTab]        = useState('contact');
  const [cForm,      setCForm]      = useState({ name:'', email:'', phone:'', subject:'', message:'' });
  const [rForm,      setRForm]      = useState({ company_name:'', contact_name:'', email:'', phone:'', product_interest:'', quantity:'', message:'' });
  const [cSuccess,   setCSuccess]   = useState(false);
  const [rSuccess,   setRSuccess]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleContact = async (e) => {
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

  const handleRFQ = async (e) => {
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
          <h1 className="page-title">KONTAK <em style={{ color:'var(--red)', fontStyle:'normal' }}>&amp; RFQ</em></h1>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.grid}>

            {/* ── Kolom Info Kontak — dari CMS ── */}
            <div className={styles.infoCol}>
              <h3 className={styles.infoTitle}>Informasi Kontak</h3>

              {/* Item kontak — tampil hanya jika ada datanya dari CMS */}
              {[
                { icon:'📍', label:'Alamat',           val: s.contact_address,   href: null },
                { icon:'📞', label:'Telepon Sales',    val: s.contact_sales,     href: s.contact_sales    ? `tel:${s.contact_sales.replace(/\D/g,'')}` : null },
                { icon:'🔧', label:'Telepon Service',  val: s.contact_service,   href: s.contact_service  ? `tel:${s.contact_service.replace(/\D/g,'')}` : null },
                { icon:'✉',  label:'Email',            val: s.contact_email,     href: s.contact_email    ? `mailto:${s.contact_email}` : null },
                { icon:'🕐', label:'Jam Kerja',        val: s.operational_hours, href: null },
              ].filter(item => item.val).map(item => (
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

              {/* Tombol WA — pakai nomor Telepon Sales dari CMS */}
              <a
                href={`https://wa.me/${waNum}?text=${encodeURIComponent('Halo Multistack Indonesia, saya ingin berkonsultasi.')}`}
                target="_blank"
                rel="noreferrer"
                className={`btn btn-red ${styles.waBtn}`}
              >
                💬 Chat WhatsApp Sekarang
              </a>

              {/* Contact Person — dari contact_persons di CMS settings */}
              {contactPersons.length > 0 && (
                <div className={styles.contactPersons}>
                  <h4>Contact Person</h4>
                  {contactPersons.map((cp, i) => (
                    <div key={i} className={styles.cp}>
                      <div className={styles.cpAvatar}>
                        {(cp.name || '?').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.cpName}>{cp.name}</div>
                        <div className={styles.cpRole}>
                          {cp.role}
                          {cp.phone && ` — `}
                          {cp.phone && (
                            <a href={`tel:${cp.phone.replace(/\D/g,'')}`} style={{ color:'var(--red)' }}>
                              {cp.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Kolom Form ── */}
            <div className={styles.formBox}>
              {/* Tabs */}
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${tab === 'contact' ? styles.activeTab : ''}`}
                  onClick={() => setTab('contact')}
                >Kirim Pesan</button>
                <button
                  className={`${styles.tab} ${tab === 'rfq' ? styles.activeTab : ''}`}
                  onClick={() => setTab('rfq')}
                >Request RFQ</button>
              </div>

              {/* ── Form Pesan ── */}
              {tab === 'contact' && (
                <form onSubmit={handleContact}>
                  <h3 className={styles.formTitle}>Kirim Pesan</h3>
                  <p className={styles.formSub}>Kami siap menjawab dalam 1×24 jam kerja.</p>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nama Lengkap *</label>
                      <input value={cForm.name} onChange={e => setCForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" required />
                    </div>
                    <div className="form-group">
                      <label>No. Telepon</label>
                      <input value={cForm.phone} onChange={e => setCForm(f => ({ ...f, phone: e.target.value }))} placeholder="0812-xxxx-xxxx" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" value={cForm.email} onChange={e => setCForm(f => ({ ...f, email: e.target.value }))} placeholder="email@perusahaan.com" required />
                  </div>
                  <div className="form-group">
                    <label>Subjek</label>
                    <select value={cForm.subject} onChange={e => setCForm(f => ({ ...f, subject: e.target.value }))}>
                      <option value="">-- Pilih Subjek --</option>
                      {['Pertanyaan Produk','Pertanyaan Layanan','Komplain / Keluhan','Kerjasama & Partnership','Lainnya'].map(opt => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Pesan *</label>
                    <textarea rows={5} value={cForm.message} onChange={e => setCForm(f => ({ ...f, message: e.target.value }))} placeholder="Tulis pesan Anda..." required />
                  </div>
                  {cSuccess && <div className={styles.success}>✅ Pesan berhasil dikirim! Kami akan segera menghubungi Anda.</div>}
                  <button type="submit" className={`btn btn-red ${styles.submitBtn}`} disabled={submitting}>
                    {submitting ? 'Mengirim...' : 'Kirim Pesan →'}
                  </button>
                </form>
              )}

              {/* ── Form RFQ ── */}
              {tab === 'rfq' && (
                <form onSubmit={handleRFQ}>
                  <h3 className={styles.formTitle}>Request for Quotation</h3>
                  <p className={styles.formSub}>Isi formulir berikut untuk mendapatkan penawaran harga.</p>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nama Perusahaan *</label>
                      <input value={rForm.company_name} onChange={e => setRForm(f => ({ ...f, company_name: e.target.value }))} placeholder="PT. Nama Perusahaan" required />
                    </div>
                    <div className="form-group">
                      <label>Nama PIC</label>
                      <input value={rForm.contact_name} onChange={e => setRForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Nama Contact Person" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" value={rForm.email} onChange={e => setRForm(f => ({ ...f, email: e.target.value }))} placeholder="pic@perusahaan.com" required />
                    </div>
                    <div className="form-group">
                      <label>No. Telepon *</label>
                      <input value={rForm.phone} onChange={e => setRForm(f => ({ ...f, phone: e.target.value }))} placeholder="0812-xxxx-xxxx" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Produk / Layanan yang Diminati *</label>
                    <input value={rForm.product_interest} onChange={e => setRForm(f => ({ ...f, product_interest: e.target.value }))} placeholder="Misal: Chiller 200TR, Panel MV, dll." required />
                  </div>
                  <div className="form-group">
                    <label>Estimasi Kuantitas</label>
                    <input value={rForm.quantity} onChange={e => setRForm(f => ({ ...f, quantity: e.target.value }))} placeholder="Misal: 2 unit, 1 paket, dll." />
                  </div>
                  <div className="form-group">
                    <label>Keterangan Tambahan</label>
                    <textarea rows={4} value={rForm.message} onChange={e => setRForm(f => ({ ...f, message: e.target.value }))} placeholder="Spesifikasi khusus, timeline proyek, dll." />
                  </div>
                  {rSuccess && <div className={styles.success}>✅ RFQ berhasil dikirim! Tim sales kami akan menghubungi dalam 1×24 jam.</div>}
                  <button type="submit" className={`btn btn-red ${styles.submitBtn}`} disabled={submitting}>
                    {submitting ? 'Mengirim...' : 'Kirim RFQ →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}