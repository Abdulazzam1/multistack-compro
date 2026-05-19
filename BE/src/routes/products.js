const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/productController');
const auth    = require('../middleware/auth');
const upload  = require('../middleware/upload');

router.get('/',                                          ctrl.getAll);
router.get('/:slug',                                     ctrl.getBySlug);
router.post('/',                                  auth,  ctrl.create);
router.put('/:id',                                auth,  ctrl.update);
router.delete('/:id',                             auth,  ctrl.remove);
router.post('/:id/images', auth, upload.single('image'), ctrl.uploadImage);

module.exports = router;
