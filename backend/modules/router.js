// modules/router.js
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../nginx/public/index.html'));
});

router.get('/pdfs', (req, res) => {
    res.sendFile(path.join(__dirname, '../nginx/public/pdfs.html'));
});


module.exports = router;