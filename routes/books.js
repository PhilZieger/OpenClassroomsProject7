const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config');

const stuffCtrl = require('../controllers/books');


router.get('/', stuffCtrl.getAllBooks);

router.get('/:id', multer, stuffCtrl.getOneBook);

router.get('/bestrating', multer, stuffCtrl.getTopBooks);

router.post('/', auth, multer, stuffCtrl.createBooks);

router.put('/:id', auth, multer, stuffCtrl.modifyBook);

router.delete('/:id', auth, stuffCtrl.deleteBook);

router.post('/:id/rating', auth, stuffCtrl.rateBook);

module.exports = router;