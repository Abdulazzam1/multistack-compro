import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Eye, CheckCircle } from 'lucide-react';
import { getRFQs, markRFQ } from '@/services/rfqService';
import { formatDateShort } from '@/utils/helpers';

const STATUS_OPTIONS = ['baru', 'dibaca', 'diproses', 'selesai'];

export default function RFQPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['cms-rfq', page],
    queryFn: () => getRFQs({ page, limit }).then(r => r.data.data),
  });
  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const markMut = useMutation({
    mutationFn: ({ id, status }) => markRFQ(id, { status }),
    onSuccess: () => qc.invalidateQueries(['cms-rfq']),
  });

  const handleOpen = (item) => {
    setSelected(item);
    if (!item.is_read) markMut.mutate({ id: item.id, status: 'dibaca' });
  };

  const statusColor = (s) => {
    if (s === 'selesai') return 'badge-green';
    if (s === 'diproses') return 'badge-yellow';
    if (s === 'baru') return 'badge-red';
    return 'badge-gray';
  };

  return (
    <div className="animate-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <h1 className="page-title">REQUEST FOR QUOTATION</h1>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.75rem', color:'var(--white70)' }}>{total} total RFQ</span>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)' }} onClick={() => setSelected(null)} />
          <div style={{ position:'relative', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:'2rem', maxWidth:560, width:'100%', maxHeight:'90vh', overflowY:'auto', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem' }}>Detail RFQ</h3>
              <span className={`badge ${statusColor(selected.status)}`}>{selected.status}</span>
            </div>
            {[
              ['Perusahaan', selected.company_name],
              ['Contact Person', selected.contact_name],
              ['Email', selected.email],
              ['Telepon', selected.phone],
              ['Produk/Layanan', selected.product_interest],
              ['Estimasi Qty', selected.quantity],
            ].map(([l,v]) => v ? (
              <div key={l} style={{ display:'flex', gap:'0.75rem', padding:'0.5rem 0', borderBottom:'1px solid var(--border)', fontSize:'0.85rem' }}>
                <span style={{ color:'var(--white70)', width:'7.5rem', flexShrink:0 }}>{l}</span>
                <span style={{ color:'var(--white)', fontWeight:500, flex:1, wordBreak:'break-word' }}>{v}</span>
              </div>
            ) : null)}
            {selected.message && (
              <div style={{ marginTop:'1rem' }}>
                <p style={{ fontSize:'0.7rem', color:'var(--white70)', marginBottom:'0.5rem', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'2px' }}>Keterangan</p>
                <div style={{ background:'var(--bg3)', borderRadius:6, padding:'0.875rem', fontSize:'0.85rem', color:'var(--white70)', whiteSpace:'pre-wrap', lineHeight:1.7 }}>{selected.message}</div>
              </div>
            )}
            {/* Update status */}
            <div style={{ marginTop:'1.25rem' }}>
              <p style={{ fontSize:'0.7rem', color:'var(--white70)', marginBottom:'0.5rem', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'2px' }}>Update Status</p>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => { markMut.mutate({ id: selected.id, status: s }); setSelected(prev => ({ ...prev, status: s })); }}
                    className={`btn btn-sm ${selected.status === s ? 'btn-primary' : 'btn-outline'}`}
                  >{s}</button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'1.25rem', flexWrap:'wrap' }}>
              <a href={`mailto:${selected.email}?subject=Re: RFQ ${selected.product_interest}`} className="btn btn-primary btn-sm"><Mail size={13}/> Balas Email</a>
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/\D/g,'').replace(/^0/,'62')}?text=${encodeURIComponent(`Halo ${selected.contact_name}, kami dari Multistack Indonesia menerima RFQ Anda untuk ${selected.product_interest}.`)}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">💬 WhatsApp</a>
              )}
              <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm">Tutup</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ overflowX:'auto' }}>
          {isLoading ? (
            <div style={{ padding:'2rem', textAlign:'center', color:'var(--white70)' }}>Memuat...</div>
          ) : items.length === 0 ? (
            <div style={{ padding:'3rem', textAlign:'center', color:'var(--white70)' }}>Belum ada RFQ masuk.</div>
          ) : (
            <table style={{ width:'100%' }}>
              <thead style={{ background:'var(--bg3)', borderBottom:'1px solid var(--border)' }}>
                <tr>
                  <th className="th">Perusahaan</th>
                  <th className="th">Produk/Layanan</th>
                  <th className="th">Kontak</th>
                  <th className="th">Tanggal</th>
                  <th className="th">Status</th>
                  <th className="th" style={{ textAlign:'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} style={{ cursor:'pointer' }} onClick={() => handleOpen(item)}>
                    <td className="td">
                      <p style={{ fontWeight: item.is_read ? 400 : 700, fontSize:'0.88rem', color:'var(--white)' }}>{item.company_name}</p>
                      {item.contact_name && <p style={{ fontSize:'0.72rem', color:'var(--white40)' }}>{item.contact_name}</p>}
                    </td>
                    <td className="td" style={{ fontSize:'0.83rem', maxWidth:200, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{item.product_interest}</td>
                    <td className="td" style={{ fontSize:'0.75rem', color:'var(--white70)' }}>{item.email}</td>
                    <td className="td" style={{ fontSize:'0.72rem', color:'var(--white40)', fontFamily:'var(--font-mono)' }}>{formatDateShort(item.created_at)}</td>
                    <td className="td"><span className={`badge ${statusColor(item.status)}`}>{item.status}</span></td>
                    <td className="td">
                      <div style={{ display:'flex', justifyContent:'flex-end' }}>
                        <button onClick={e => { e.stopPropagation(); handleOpen(item); }} className="btn btn-outline btn-sm"><Eye size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:'0.75rem', marginTop:'1.25rem', alignItems:'center' }}>
          <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
          <span style={{ fontSize:'0.82rem', color:'var(--white70)' }}>{page} / {totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>→</button>
        </div>
      )}
    </div>
  );
}
