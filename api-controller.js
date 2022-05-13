const oracle = require('./models/db');
const sqlquery = require('./models/query');

const axios = require('axios');

let url = 'http://117.239.146.106:3001/'
//let url = 'http://10.34.128.24:3001/'
//#region 

exports.default = function(req,res) {
    const sql = sqlquery.query3;
    
    console.log(`connection URL ${url}`);

    oracle.queryObject(sql, {}, {})
        .then(function (vmRows) {
           return processedResult(vmRows)
        }).then(result =>{
            console.log("Post Completed ");
            res.json(result)
        })
        .catch(function(err) {
            res.json(err)
        });
}


async function processedResult(vmRows){ 
    
            let msg = {
                total: vmRows.rows.length,
                splits: Math.ceil(vmRows.rows.length / 200),
                result: []
            }

            let a = 0
            console.log(msg);

            console.log("Delete VMWorkingLines")

            await deleteData().then(response =>{
                    console.log("deleted Records : ", response.result.deletedCount);
                    msg.result.push(`Deleted ${response.result.deletedCount}`)
                })

            for (let i = 1; i <= msg.splits; i++) {
                
                let data = []
                data = vmRows.rows.slice(a, i * 200)
                
                await postData(data).then(response =>{
                    console.log("Posted Records : ", response.result.length);
                    msg.result.push(response.result.length)
                })

                a = i * 200
            }

            return msg;

   
}

/*****
 axios.post( url+"api-vmWkg/vmWkg", data)
            .then((response) =>{   
                console.log('fired');                 
                res.json(response)
            })     
 *****/


async function postData(data) {
    let phoneData = await new Promise((resolve, reject)=>{
        axios.post( url+"api-vmWkg/vmWkg", data)
        .then((response) =>{    
            resolve(response.data)
        }).catch(err=> reject(err))

    })
    return phoneData;
}


async function deleteData() {
    let phoneData = await new Promise((resolve, reject)=>{
        axios.delete( url+"api-vmWkg/vmWkg")
        .then((response) =>{    
            resolve(response.data)
        }).catch(err=> reject(err))

    })
    return phoneData;
}

exports.findPhone = function(req,res){
    axios.get( url+'api-faultdata/Phone/0891-2717979')
        .then((response) =>{    
            console.log(typeof response.data);
            res.json(response.data)
        })
    
}

exports.find = function(req,res){
    let data = {
        Phone:'08924-246198',
        Answered:true
    }
    axios.post( url+"api-faultdata/find/", data)
        .then((response) =>{    
            console.log(typeof response.data);
            res.json(response.data)
        })
    
}

//#endregion

//#region 
exports.test = (req,res) =>{
    const sql = sqlquery.SERVICE_TYPE_COUNT;
    console.log('test fired');
    oracle.queryObject(sql,{},{}).then(result => {
        
        res.json(result)
    })
}
//#endregion