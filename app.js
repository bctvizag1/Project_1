const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const apiRouter = require('./api-route');
const pageRouter = require('./page-route');


const PORT = 3001

var app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(allowCrossDomain);

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//set Static Path
app.use(express.static(path.join(__dirname,'public')))

//Create Welcome Page

app.use('/', pageRouter);

app.use('/api', apiRouter);



app.listen(PORT, function(){
    console.log('Server Started at Port : ' + PORT)
});