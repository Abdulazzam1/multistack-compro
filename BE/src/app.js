const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const path         = require('path');
const rateLimit    = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin:      process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

// ── Logging & Body Parsing ───────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api/', apiLimiter);

// ── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/settings',     require('./routes/settings'));
app.use('/api/banner',       require('./routes/banner'));
app.use('/api/categories',   require('./routes/categories'));
app.use('/api/products',     require('./routes/products'));
app.use('/api/services',     require('./routes/services'));
app.use('/api/portfolio',    require('./routes/portfolio'));
app.use('/api/news',         require('./routes/news'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/contact',      require('./routes/contact'));
app.use('/api/rfq',          require('./routes/rfq'));
app.use('/api/awards',       require('./routes/awards'));
app.use('/api/admin',        require('./routes/admin/index'));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Multistack API', timestamp: new Date().toISOString() });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
