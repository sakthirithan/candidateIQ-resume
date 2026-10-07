const express = require('express');
const router = express.Router();
const { testAIOperation, runFullAITestSuite } = require('../controllers/aiTestController');

router.post('/test', testAIOperation);
router.get('/test-suite', runFullAITestSuite);

module.exports = router;
