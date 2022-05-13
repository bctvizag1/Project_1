const express = require('express');
const router = express.Router();

const contrl = require('./page-controller')

router.get('/',contrl.default);

router.get('/test', contrl.test);

module.exports = router

