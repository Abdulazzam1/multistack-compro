require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { query, pool } = require('../config/db');

async function migrate() {
  console.log('🔄  Menjalankan migrasi database Multistack...\n');

  // ── Enum Type ──────────────────────────────────────────────────────────────
  // Buat type enum hanya jika belum ada
  await query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'news_category') THEN
        CREATE TYPE public.news_category AS ENUM ('berita', 'aktivitas', 'csr');
      END IF;
    END $$;
  `);

  // ── Tabel admin_users ──────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(200) NOT NULL,
      email         VARCHAR(200) NOT NULL UNIQUE,
      password_hash VARCHAR(500) NOT NULL,
      is_active     BOOLEAN DEFAULT true,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Tabel company_settings ─────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id                SERIAL PRIMARY KEY,
      about_title       VARCHAR(255),
      about_description TEXT,
      vision            TEXT,
      mission           TEXT,
      stats_projects    VARCHAR(50),
      stats_clients     VARCHAR(50),
      stats_years       VARCHAR(50),
      stats_support     VARCHAR(50),
      contact_sales     VARCHAR(100),
      contact_service   VARCHAR(100),
      contact_email     VARCHAR(150),
      contact_address   TEXT,
      operational_hours VARCHAR(150),
      social_instagram  VARCHAR(255),
      social_linkedin   VARCHAR(255),
      social_facebook   VARCHAR(255),
      about_image       VARCHAR(255),
      company_values    JSONB,
      compro_file       VARCHAR(500),
      contact_persons   JSONB DEFAULT '[]',
      footer_contacts   JSONB DEFAULT '[]',
      updated_at        TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Tabel banners ─────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS banners (
      id         SERIAL PRIMARY KEY,
      title      VARCHAR(255),
      image_url  TEXT NOT NULL,
      link_url   VARCHAR(500),
      is_active  BOOLEAN DEFAULT true,
      sort_order SMALLINT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Tabel categories ─────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(150) NOT NULL,
      slug        VARCHAR(150) NOT NULL UNIQUE,
      description TEXT,
      icon        VARCHAR(100),
      is_active   BOOLEAN DEFAULT true,
      sort_order  SMALLINT DEFAULT 0,
      type        VARCHAR(50) DEFAULT 'product',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Tabel products ────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      slug        VARCHAR(255) NOT NULL UNIQUE,
      category    VARCHAR(100),
      brand       VARCHAR(100),
      description TEXT,
      specs       JSONB DEFAULT '{}',
      images      TEXT[] DEFAULT '{}',
      is_featured BOOLEAN DEFAULT false,
      is_active   BOOLEAN DEFAULT true,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Tabel services ────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS services (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      slug        VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      scope       TEXT,
      icon        VARCHAR(100),
      image       VARCHAR(255),
      is_active   BOOLEAN DEFAULT true,
      sort_order  SMALLINT DEFAULT 0,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Tabel portfolio ───────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id           SERIAL PRIMARY KEY,
      title        VARCHAR(255) NOT NULL,
      slug         VARCHAR(255) NOT NULL UNIQUE,
      client       VARCHAR(255),
      location     VARCHAR(255),
      category     VARCHAR(100),
      description  TEXT,
      scope        TEXT,
      images       TEXT[] DEFAULT '{}',
      year         SMALLINT,
      is_featured  BOOLEAN DEFAULT false,
      is_active    BOOLEAN DEFAULT true,
      show_on_home BOOLEAN DEFAULT false,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Tabel news ────────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS news (
      id           SERIAL PRIMARY KEY,
      title        VARCHAR(255) NOT NULL,
      slug         VARCHAR(255) NOT NULL UNIQUE,
      category     public.news_category DEFAULT 'berita',
      excerpt      TEXT,
      content      TEXT,
      cover_image  VARCHAR(255),
      author       VARCHAR(150) DEFAULT 'Admin Multistack',
      is_published BOOLEAN DEFAULT false,
      show_on_home BOOLEAN DEFAULT false,
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      updated_at   TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Tabel testimonials ────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id             SERIAL PRIMARY KEY,
      client_name    VARCHAR(255) NOT NULL,
      client_title   VARCHAR(150),
      client_company VARCHAR(255),
      content        TEXT NOT NULL,
      rating         SMALLINT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
      avatar         VARCHAR(255),
      is_active      BOOLEAN DEFAULT true,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Tabel contact_submissions ─────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      email      VARCHAR(255) NOT NULL,
      phone      VARCHAR(50),
      subject    VARCHAR(255),
      message    TEXT NOT NULL,
      is_read    BOOLEAN DEFAULT false,
      status     VARCHAR(50) DEFAULT 'baru',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Tabel rfq_submissions ─────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS rfq_submissions (
      id               SERIAL PRIMARY KEY,
      company_name     VARCHAR(255) NOT NULL,
      contact_name     VARCHAR(255),
      email            VARCHAR(255) NOT NULL,
      phone            VARCHAR(50),
      product_interest TEXT NOT NULL,
      quantity         VARCHAR(100),
      message          TEXT,
      is_read          BOOLEAN DEFAULT false,
      status           VARCHAR(50) DEFAULT 'baru',
      created_at       TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Tabel awards_certifications ───────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS awards_certifications (
      id           SERIAL PRIMARY KEY,
      type         VARCHAR(50) DEFAULT 'penghargaan'
                   CHECK (type IN ('sertifikasi', 'standarisasi', 'penghargaan')),
      title        VARCHAR(255) NOT NULL,
      image_url    VARCHAR(500),
      issued_by    VARCHAR(255),
      year         SMALLINT,
      description  TEXT,
      show_on_home BOOLEAN DEFAULT false,
      sort_order   SMALLINT DEFAULT 0,
      is_active    BOOLEAN DEFAULT true,
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      updated_at   TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('✅  Semua tabel berhasil dibuat!\n');
  await pool.end();
}

migrate().catch(err => {
  console.error('❌  Migrasi gagal:', err.message);
  process.exit(1);
});
