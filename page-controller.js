const oracle = require('./models/db');
const sqlquery = require('./models/query');

exports.default = (req, res) =>{
    console.log('fired index default');
    res.render('index', { title: 'BSNL Visakhapatnam' });
}

exports.test = (req,res) =>{
    const sql = sqlquery.query3;
    console.log('test fired');
    oracle.queryObject(sql,{},{}).then(result => {
        
        res.render( 'test', {data:result})
    })
}