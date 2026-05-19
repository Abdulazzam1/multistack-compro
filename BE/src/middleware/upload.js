const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const ALLOWED_FOLDERS = [
  'products', 'services', 'portfolio', 'news',
  'banners', 'awards', 'settings', 'general',
];

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    // Tentukan folder dari URL atau body request
    let folder = 'general';
    const urlSegments = req.originalUrl.split('/');
    const match = urlSegments.find(seg => ALLOWED_FOLDERS.includes(seg));
    if (match) folder = match;
    if (req.body?.folder && ALLOWED_FOLDERS.includes(req.body.folder)) {
      folder = req.body.folder;
    }

    req._uploadFolder = folder;

    const dest = path.join(__dirname, '../../uploads', folder);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },

  filename: (_req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase();
    const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueId}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf/;
  const extOk   = allowed.test(path.extname(file.originalname).toLowerCase());
  cb(null, extOk);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;
