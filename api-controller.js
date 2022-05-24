const oracle = require('./models/db');
const sqlquery = require('./models/query');

const axios = require('axios');

let url = 'http://117.239.146.106:3001/'
//let url = 'http://10.34.128.24:3001/'
//#region 

exports.ogbar_susnp = function(req,res) {
    const sql = sqlquery.ogbar_susnp;
    
    console.log(`connection URL ${url}`);

    oracle.queryObject(sql, {}, {})
        .then(function (vmRows) {
            let link1 = url+"api-vmWkg/vmWkg";
           return processedResult(vmRows, link1 , true )
        }).then(result =>{
            console.log("Post Completed ");
            res.json(result)
        })
        .catch(function(err) {
            res.json(err)
        });
}

exports.repeatFault = function(req,res) {
    const sql = sqlquery.repeatfaults;
    
    console.log(`repeat faults connection URL ${url}`);

    oracle.queryObject(sql, {}, {})
        .then(function (vmRows) {
            let link1 =  url+"api-vmWkg/repeatFault"
           return processedResult(vmRows, link1 , false)
        }).then(result =>{
            console.log("Post Completed ");
            res.json(result)
        })
        .catch(function(err) {
            res.json(err)
        });
}


async function processedResult(vmRows, link, dataDelete){ 

    console.log("fired links", link, dataDelete);
    
            let msg = {
                total: vmRows.rows.length,
                splits: Math.ceil(vmRows.rows.length / 200),
                result: []
            }

            let a = 0
            console.log(msg);

           
            if(dataDelete) {
                console.log(dataDelete);
                console.log(link);
                console.log("Delete VMWorkingLines")
                await deleteData(link).then(response =>{
                        console.log("deleted Records : ", response.result.deletedCount);
                        msg.result.push(`Deleted ${response.result.deletedCount}`)
                    })
            }

            for (let i = 1; i <= msg.splits; i++) {
                
                let data = []
                data = vmRows.rows.slice(a, i * 200)
                
                await postData(data, link).then(response =>{
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


async function postData(data, link) {
    let phoneData = await new Promise((resolve, reject)=>{
        axios.post( link, data)
        .then((response) =>{    
            resolve(response.data)
        }).catch(err=> reject(err))

    })
    return phoneData;
}



async function deleteData(link) {
    let phoneData = await new Promise((resolve, reject)=>{
        axios.delete( link)
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