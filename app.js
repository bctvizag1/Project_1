const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const apiRouter = require('./api-route');
const pageRouter = require('./page-route');
const moment = require("moment");

const fs = require('fs');

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
//set Static Path
app.use(express.static(path.join(__dirname,'public')))


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


let test =function(x) {
    return typeof x
}

//Create Welcome Page
app.use((req, res, next) => {
    res.locals.moment = moment;
    res.locals.test = test;
    var ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
    let wrt = `IP : ${ip}, URL: ${req.url} \n`;
    console.log(wrt);
    fs.writeFile('logfile.txt', wrt, { flag: 'a+' }, (err) => {
        if (err) {
            throw err;
        }

    });
    next();
});

app.use('/', pageRouter);

app.use('/api', apiRouter);

app.listen(PORT, function(){
    console.log('Server Started at Port : ' + PORT)
});