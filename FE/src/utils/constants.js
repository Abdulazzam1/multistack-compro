export const COMPANY = {
  name:      'PT. Multistack Indonesia',
  shortName: 'Multistack',
  tagline:   'Solusi Terpadu Mekanikal, Elektrikal & VAC',
  address:   import.meta.env.VITE_ADDRESS || 'Jl. Industri Raya No. 12, Jakarta Barat 11740',
  phone: {
    sales:   import.meta.env.VITE_PHONE_SALES   || '(021) 1234-5678',
    service: import.meta.env.VITE_PHONE_SERVICE || '(021) 8765-4321',
  },
  email:    import.meta.env.VITE_EMAIL     || 'info@multistack.co.id',
  whatsapp: import.meta.env.VITE_WHATSAPP  || '6281234567890',
  website:  'www.multistack.co.id',
  social: {
    instagram: import.meta.env.VITE_INSTAGRAM || 'https://instagram.com/multistackindonesia',
    linkedin:  import.meta.env.VITE_LINKEDIN  || 'https://linkedin.com/company/multistack-indonesia',
    facebook:  import.meta.env.VITE_FACEBOOK  || 'https://facebook.com/multistackindonesia',
  },
};

export const NAV_LINKS = [
  { label: 'Beranda',       path: '/' },
  { label: 'Tentang Kami',  path: '/tentang-kami' },
  { label: 'Produk',        path: '/produk' },
  { label: 'Layanan',       path: '/layanan' },
  { label: 'Portfolio',     path: '/portfolio' },
  { label: 'Informasi',     path: '/informasi' },
  { label: 'Kontak',        path: '/kontak' },
];
