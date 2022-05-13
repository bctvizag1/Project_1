var express = require('express');
var router = express.Router();
var contrl = require('./api-controller')


router.get('/', (req, res) =>{
    res.render('index', { title: 'from api-route' });
});

router.get('/test', contrl.test);

router.get('/post', contrl.default);

router
    .get('/find', contrl.findPhone)
    .post('/find', contrl.find)


module.exports = router;