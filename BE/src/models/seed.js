require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt      = require('bcryptjs');
const { query, pool } = require('../config/db');

async function seed() {
  console.log('🌱  Mengisi data awal...\n');

  // ── Admin User ─────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('multistack2024', 12);
  await query(`
    INSERT INTO admin_users (name, email, password_hash)
    VALUES ($1, $2, $3)
    ON CONFLICT (email) DO NOTHING
  `, ['Super Admin', 'admin@multistack.co.id', hash]);
  console.log('  ✔ Admin user');

  // ── Company Settings ───────────────────────────────────────────────────────
  const settingsExists = await query('SELECT id FROM company_settings LIMIT 1');
  if (!settingsExists.rows.length) {
    await query(`
      INSERT INTO company_settings (
        about_title, about_description, vision, mission,
        stats_projects, stats_clients, stats_years, stats_support,
        contact_sales, contact_service, contact_email, contact_address,
        operational_hours, social_instagram, social_linkedin, social_facebook
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
    `, [
      'PT. Multistack Indonesia',
      'Perusahaan terkemuka dalam penyediaan solusi MEP terpadu dengan rekam jejak lebih dari 16 tahun.',
      'Menjadi perusahaan MEP terdepan di Asia Tenggara yang mengutamakan inovasi, keberlanjutan, dan kepuasan pelanggan.',
      'Memberikan solusi MEP berkualitas tinggi\nMembangun SDM kompeten & bersertifikat\nBerinovasi untuk efisiensi energi\nMembangun kemitraan jangka panjang',
      '500+', '200+', '16+', '24/7',
      '(021) 1234-5678', '(021) 8765-4321', 'info@multistack.co.id',
      'Jl. Industri Raya No. 12, Jakarta Barat 11740',
      'Senin – Jumat: 08.00 – 17.00 WIB',
      'https://instagram.com/multistackindonesia',
      'https://linkedin.com/company/multistack-indonesia',
      'https://facebook.com/multistackindonesia',
    ]);
    console.log('  ✔ Company settings');
  }

  // ── Kategori ───────────────────────────────────────────────────────────────
  const categories = [
    ['HVAC & Pendingin', 'hvac-pendingin',     '❄', 'product',    1],
    ['Elektrikal',       'elektrikal',          '⚡', 'product',    2],
    ['Plumbing',         'plumbing',            '💧', 'product',    3],
    ['Fire Protection',  'fire-protection',     '🔥', 'product',    4],
    ['Automation',       'automation',          '🤖', 'product',    5],
    ['Gedung Komersial', 'gedung-komersial',    '🏢', 'portfolio',  1],
    ['Hotel & Hospitality','hotel-hospitality', '🏨', 'portfolio',  2],
    ['Industri',         'industri',            '🏭', 'portfolio',  3],
    ['Fasilitas Kesehatan','fasilitas-kesehatan','🏥', 'portfolio', 4],
    ['Infrastruktur',    'infrastruktur',       '🛣', 'portfolio',  5],
  ];
  for (const [name, slug, icon, type, sort] of categories) {
    await query(
      `INSERT INTO categories (name, slug, icon, type, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO NOTHING`,
      [name, slug, icon, type, sort]
    );
  }
  console.log('  ✔ Kategori');

  // ── Layanan ────────────────────────────────────────────────────────────────
  const services = [
    ['HVAC & Sistem Refrigerasi',   'hvac-sistem-refrigerasi',
     'Perancangan, pengadaan, pemasangan, komisioning, dan perawatan sistem AC central, split, VRF, chiller, cooling tower, dan unit refrigerasi industri.',
     'Perancangan & Engineering HVAC\nInstalasi & Komisioning\nPreventive Maintenance Berkala\nTroubleshooting & Emergency Response', '❄', 1],

    ['Sistem Elektrikal',           'sistem-elektrikal',
     'Distribusi daya tegangan rendah hingga menengah, panel MV/LV, trafo, UPS, genset, grounding, dan sistem proteksi petir.',
     'Desain Sistem Distribusi Daya\nPanel MV/LV\nUPS & Genset\nEnergy Monitoring System', '⚡', 2],

    ['Plumbing & Sanitasi',         'plumbing-sanitasi',
     'Sistem air bersih, air panas, air limbah, pompa booster, water treatment, dan instalasi fixture sanitasi lengkap.',
     'Sistem Air Bersih (Cold & Hot Water)\nPompa Booster & Submersible\nWater Treatment Plant\nSanitasi & Drainase Gedung', '💧', 3],

    ['Fire Protection System',      'fire-protection-system',
     'Deteksi dini, fire alarm, wet/dry sprinkler, suppression FM-200, fire hydrant, dan APAR bersertifikat NFPA.',
     'Fire Alarm Addressable\nWet & Dry Sprinkler\nSuppression FM-200\nFire Hydrant & Hose Reel', '🔥', 4],

    ['Building Automation System',  'building-automation-system',
     'BMS/BAS, smart metering, integrasi IoT, SCADA, dan monitoring energi terpusat untuk efisiensi operasional gedung.',
     'BMS/BAS Design & Engineering\nSCADA & HMI Development\nIoT Integration\nEnergy Metering & Sub-metering', '🤖', 5],

    ['Maintenance & After-Sales',   'maintenance-after-sales',
     'Preventive & corrective maintenance, spare parts original, garansi resmi, dan dukungan teknis 24/7 seluruh Indonesia.',
     'Preventive Maintenance Schedule\nCorrective Maintenance & Repair\nSpare Parts Original & Garansi Resmi\nEmergency Response 24/7', '🔧', 6],
  ];
  for (const [name, slug, desc, scope, icon, sort] of services) {
    await query(
      `INSERT INTO services (name, slug, description, scope, icon, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slug) DO NOTHING`,
      [name, slug, desc, scope, icon, sort]
    );
  }
  console.log('  ✔ Layanan');

  // ── Penghargaan ────────────────────────────────────────────────────────────
  const awards = [
    ['sertifikasi', 'ISO 9001:2015',              'LRQA',        2019, 'Sistem Manajemen Mutu Internasional',         true,  1],
    ['penghargaan', 'Best MEP Contractor Award',  'GAPENSI',     2023, 'Indonesia Construction Award — Kategori MEP', true,  2],
    ['penghargaan', 'Top 10 Green Building',      'GBCI',        2024, 'Green Building Council Indonesia',            true,  3],
    ['penghargaan', 'K3 Zero Accident Award',     'Kemnaker RI', 2023, 'Penghargaan Keselamatan & Kesehatan Kerja',   true,  4],
  ];
  for (const [type, title, issued_by, year, desc, show_home, sort] of awards) {
    await query(
      `INSERT INTO awards_certifications (type, title, issued_by, year, description, show_on_home, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT DO NOTHING`,
      [type, title, issued_by, year, desc, show_home, sort]
    );
  }
  console.log('  ✔ Penghargaan & sertifikasi');

  console.log('\n✅  Seeding selesai!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧  Admin email : admin@multistack.co.id');
  console.log('🔑  Password    : multistack2024');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await pool.end();
}

seed().catch(err => {
  console.error('❌  Seeding gagal:', err.message);
  process.exit(1);
});
