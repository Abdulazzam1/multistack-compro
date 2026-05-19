import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/authService';
import { getErrorMsg } from '@/utils/helpers';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await login(form);
      const { token, admin } = res.data.data;
      localStorage.setItem('multistack_token', token);
      localStorage.setItem('multistack_admin', JSON.stringify(admin));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>MI</div>
          <div className={styles.logoText}>
            <span>MULTISTACK</span>
            <span>CMS PANEL</span>
          </div>
        </div>
        <h2 className={styles.title}>Selamat Datang</h2>
        <p className={styles.sub}>Masuk ke panel admin Multistack Indonesia</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="admin@multistack.co.id" required autoFocus />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" required />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>
            {loading ? 'Masuk...' : 'Masuk ke CMS'}
          </button>
        </form>
      </div>
    </div>
  );
}
