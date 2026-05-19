const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/newsController');
const auth    = require('../middleware/auth');

router.get('/',         ctrl.getAll);
router.get('/:slug',    ctrl.getBySlug);
router.post('/',   auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
