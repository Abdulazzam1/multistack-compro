import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Eye } from 'lucide-react';
import { getContacts, markContact } from '@/services/contactService';
import { formatDateShort } from '@/utils/helpers';

export default function ContactPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['cms-contacts', page],
    queryFn: () => getContacts({ page, limit }).then(r => r.data.data),
  });
  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const markMut = useMutation({
    mutationFn: (id) => markContact(id),
    onSuccess: () => qc.invalidateQueries(['cms-contacts']),
  });

  const handleOpen = (item) => {
    setSelected(item);
    if (!item.is_read) markMut.mutate(item.id);
  };

  return (
    <div className="animate-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <h1 className="page-title">PESAN MASUK</h1>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.75rem', color:'var(--white70)' }}>{total} total pesan</span>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)' }} onClick={() => setSelected(null)} />
          <div style={{ position:'relative', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:'2rem', maxWidth:520, width:'100%', maxHeight:'90vh', overflowY:'auto', zIndex:1, animation:'fadeIn 0.25s ease' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', marginBottom:'1rem' }}>Detail Pesan</h3>
            {[['Nama',selected.name],['Email',selected.email],['Telepon',selected.phone],['Subjek',selected.subject]].map(([l,v]) => v ? (
              <div key={l} style={{ display:'flex', gap:'0.75rem', padding:'0.5rem 0', borderBottom:'1px solid var(--border)', fontSize:'0.85rem' }}>
                <span style={{ color:'var(--white70)', width:'5rem', flexShrink:0 }}>{l}</span>
                <span style={{ color:'var(--white)', fontWeight:500, flex:1, wordBreak:'break-word' }}>{v}</span>
              </div>
            ) : null)}
            <div style={{ marginTop:'1rem' }}>
              <p style={{ fontSize:'0.7rem', color:'var(--white70)', marginBottom:'0.5rem', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'2px' }}>Pesan</p>
              <div style={{ background:'var(--bg3)', borderRadius:6, padding:'0.875rem', fontSize:'0.85rem', color:'var(--white70)', whiteSpace:'pre-wrap', wordBreak:'break-word', lineHeight:1.7 }}>{selected.message}</div>
            </div>
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'1.25rem', flexWrap:'wrap' }}>
              <a href={`mailto:${selected.email}`} className="btn btn-primary btn-sm"><Mail size={13}/> Balas Email</a>
              <button onClick={() => setSelected(null)} className="btn btn-outline btn-sm">Tutup</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ overflowX:'auto' }}>
          {isLoading ? (
            <div style={{ padding:'2rem', textAlign:'center', color:'var(--white70)' }}>Memuat...</div>
          ) : items.length === 0 ? (
            <div style={{ padding:'3rem', textAlign:'center', color:'var(--white70)' }}>Belum ada pesan masuk.</div>
          ) : (
            <table style={{ width:'100%' }}>
              <thead style={{ background:'var(--bg3)', borderBottom:'1px solid var(--border)' }}>
                <tr>
                  <th className="th">Pengirim</th>
                  <th className="th">Subjek</th>
                  <th className="th">Tanggal</th>
                  <th className="th">Status</th>
                  <th className="th" style={{ textAlign:'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} style={{ cursor:'pointer' }} onClick={() => handleOpen(item)}>
                    <td className="td">
                      <p style={{ fontWeight: item.is_read ? 400 : 700, fontSize:'0.88rem', color:'var(--white)' }}>{item.name}</p>
                      <p style={{ fontSize:'0.72rem', color:'var(--white40)' }}>{item.email}</p>
                    </td>
                    <td className="td" style={{ fontSize:'0.83rem' }}>{item.subject || '(tanpa subjek)'}</td>
                    <td className="td" style={{ fontSize:'0.72rem', color:'var(--white40)', fontFamily:'var(--font-mono)' }}>{formatDateShort(item.created_at)}</td>
                    <td className="td">
                      <span className={`badge ${item.is_read ? 'badge-gray' : 'badge-yellow'}`}>{item.is_read ? 'Dibaca' : '🔴 Baru'}</span>
                    </td>
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
