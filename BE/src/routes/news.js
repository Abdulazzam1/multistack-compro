const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/newsController');
const auth    = require('../middleware/auth');

// Publik
router.get('/',           ctrl.getAll);
router.get('/:slug',      ctrl.getBySlug);  // FE: fetch by slug

// Admin (butuh token)
router.get('/id/:id', auth, ctrl.getById); // CMS: fetch by id untuk edit
router.post('/',      auth, ctrl.create);
router.put('/:id',    auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;