const moment = require("moment");

const oracle = require('../models/db');
const sqlquery = require('../models/query').sqlquery;
const itpcQuery = require('../models/query').itpcQuery;


const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const oneDay = 1000 * 60 * 5;


// a variable to save a session
var session;

exports.default = (req, res) =>{
    console.log('fired index default', req.ip);
    res.render('index', { title: 'BSNL Visakhapatnam' });
}

exports.jobStatus = (req,res) =>{
    const sql = sqlquery.Jobstatus; 
    oracle.queryObject(sql,{},{}).then(result => {
        
        res.render( 'JobStatus', {data:result})
    })
}

exports.faultDailyLL = (req,res) => {
    const sql = itpcQuery.dailyFaultsLL; 

    console.log("Displayed: faultDailyLL", req.ip);

    oracle.queryObject(sql,{},{},'itpc').then(result => {  
        res.render( 'test', {
            data:result,
            title:"LL BB Faults"
                        })
    })
}

exports.faultDailyFTTH = (req,res) =>{
    const sql = itpcQuery.dailyFaultsFTTH; 

    console.log("Displayed: faultDailyFTTH", req.ip);

    oracle.queryObject(sql,{},{},'itpc').then(result => {        
        res.render( 'test', {
            data:result,
            title:"FTTH Faults"
                        })
    })
}

exports.faultDailyBB = (req,res) =>{
    const sql = itpcQuery.dailyFaultsBB; 

    console.log("Displayed: faultDailyBB", req.ip);

    oracle.queryObject(sql,{},{},'itpc').then(result => {        
        res.render( 'test', {
            data:result,
            title:"BB Faults"
                        })
    })
}

exports.wkg_lines = (req,res) =>{

    const sql = sqlquery.wkg_lines;
   
    oracle.queryObject(sql,{},{}).then(result => {        
        res.json({data:result.rows})
    })
}

/*
exports.NPC_PENDING_ORDERS = (req,res) =>{
    let sql = '';
    let title = '';
    let links =[];
    let tablesummary = [];
    let summarypage = ''
    


    switch (req.params.TYPE) {
      case "LL":
        sql = `
            SELECT A.SDE sde,COUNT(1) count FROM vm_exchange_control a, sys.vm_orders b 
            where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.order_type='New' 
            AND   b.order_sub_type like 'Provision%' 
            and  order_status not in ('Complete','Open','Cancelled','Submission In Progress','Not Feasible')  
            and service_sub_type='Fixed Landline' and  phone_no not like '0891-297%' 
            group by sde order by sde  
            `; 
        title = 'LL NPC Pending Orders';
        links = [
            {feild:"COUNT", params:`SDE` , page:'NPC_PENDING_ORDERS_SDE/LL'}
        ];
        tablesummary = ['COUNT'];
        summarypage = 'NPC_PENDING_ORDERS_SDE/LL'
        break;
      case "BB":
        sql = `
            SELECT A.SDE sde,COUNT(1) count FROM vm_exchange_control a, sys.vm_orders b 
            where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and order_type='Modify' 
            and order_sub_type like 'Broadband Provision%' 
            and  order_status not in ('Complete','Open','Cancelled','Submission In Progress')  and phone_no not like '0891-297%'
            group by a.sde             
            `; 
        
        title = 'BB NPC Pending Orders'
        
        links = [
                {feild:"COUNT", params:`SDE` , page:'NPC_PENDING_ORDERS_SDE/BB'}
            ];
        tablesummary = ['COUNT'];
        summarypage ='NPC_PENDING_ORDERS_SDE/BB'
        break;
      case "FTTH":
        sql = `
        SELECT A.SDE sde,
            sum(case when service_sub_type='Bharat Fiber Voice' then 1 else 0 end) VOICE,
            sum(case when service_sub_type='Bharat Fiber BB' then 1 else 0 end) BB,
            COUNT(1) COUNT FROM vm_exchange_control a, sys.vm_orders b where a.exchange=b.exchange_code 
            and  order_status not in ('Complete','Open','Cancelled','Submission In Progress')
            and  b.ssa='VISAKHAPATNAM' and b.order_type='New' AND service_sub_type like 'Bharat Fiber%'     group by sde
        `;
        title = 'FTTH NPC Pending Orders';
        links = [
            {feild:"VOICE", params:`SDE` , page:'NPC_PENDING_ORDERS_SDE/FTTH'},
            {feild:"BB", params:`SDE` , page:'NPC_PENDING_ORDERS_SDE/FTTH'},           
            {feild:"COUNT", params:`SDE` , page:'NPC_PENDING_ORDERS_SDE/FTTH'}
        ];

        tablesummary = ['VOICE','BB','COUNT'];
        summarypage = 'NPC_PENDING_ORDERS_SDE/FTTH'
      default:
        break;
    }
      
   

    oracle.queryObject(sql,{},{}).then(result => {        

        // res.json({data:result})
        let t1 =  result.rows.reduce((total, obj)=>(obj.COUNT + total),0);

        // console.log(t1);
        res.render( 'test', {
            data:result,
            title:title,
            links:links,
            // footer:["Total",`<b><a href="NPC_PENDING_ORDERS_SDE/${req.params.TYPE}/total"> ${t1} </a></b>`],
            tablesummary:tablesummary,
            summarypage: summarypage
            
            
        })
                
    })    
}

exports.NPC_PENDING_ORDERS_SDE = (req,res) =>{

    let sql = ""

    let sqlSDE = '';
    let service_sub_type = '';

    if(req.params.SDE !='TOTAL') {
        sqlSDE = `and  A.SDE = '${req.params.SDE}'`;
    } 

    switch (req.params.TYPE) {
      case "LL":
        service_sub_type = `and service_sub_type='Fixed Landline' and  phone_no not like '0891-297%'  `;

        sql = `
        SELECT A.SDE sde, b.Phone_NO  FROM vm_exchange_control a, sys.vm_orders b 
        where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.order_type='New' AND  
        b.order_sub_type like 'Provision%' ${sqlSDE} and
        order_status not in ('Complete','Open','Cancelled','Submission In Progress','Not Feasible')  ${service_sub_type}    
        `; 
        break;
      case "BB":
        
        service_sub_type = `and service_sub_type='Fixed Landline' and  phone_no not like '0891-297%'  `;
        
        sql = `
        SELECT A.SDE sde, b.Phone_NO  FROM vm_exchange_control a, sys.vm_orders b 
        where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.order_type='New' AND  
        b.order_sub_type like 'Provision%' ${sqlSDE} and
        order_status not in ('Complete','Open','Cancelled','Submission In Progress','Not Feasible')  ${service_sub_type}    
        `;
        
        break;

      case "FTTH" :
        sql = `
        SELECT b.exchange_code, b.Phone_NO, BB_user_id,Service_sub_type,clarity_service_order,order_no,order_created_date,order_status,pending_task,MAINTENANCE_FRANCHISEE,(trunc(sysdate)-trunc(order_created_date)) pend
          FROM vm_exchange_control a, sys.vm_orders b where a.exchange=b.exchange_code 
            and  order_status not in ('Complete','Open','Cancelled','Submission In Progress') ${sqlSDE}
            and  b.ssa='VISAKHAPATNAM' and b.order_type='New' AND service_sub_type like 'Bharat Fiber%'   
        `;

        break;


      default:
        break;
    }

    // console.log(sql);   
    
    oracle.queryObject(sql,{},{}).then(result => {              
        
        res.render( 'test', {
            data:result,
            title:"NPC LL PENDING ORDERS - SDE Wise"            
            
        })
                
    })    
}

exports.LL_Closures_Subtype = (req,res) =>{
    
    const sql = `
    select Order_sub_type,service_type,decode(service_sub_type,'Virtual Landline','Aseem','FMT','LFMT',service_sub_type) ser_type,count(1) 
    from vm_orders   where  order_status='Complete' and   trunc(order_comp_date) between :P7_from AND :P7_to  and
    order_type='Disconnect' and service_sub_type not like '%Fiber%'  group by Order_sub_type,service_type,service_sub_type order by service_type 
    `; 

    console.log("Displayed: LL_Closures_Subtype");
    oracle.queryObject(sql,{},{}).then(result => {      
        res.render( 'LL_Closures_Subtype', {
            data:result,
            title:"LL Closures service sub type wise",
            links:[
                {feild:"COUNT", params:`SDE` , page:'NPC_PENDING_ORDERS'}
            ]
        })
                
    })    
}

exports.LL_Provisions_service_sub_type_wise = (req,res) =>{
    
    const {startOfMonth, endOfMonth, fromDt, toDt} = calenderMiddleware(req)
 

    const sql = `
    select Order_sub_type,service_type,decode(service_sub_type,'Virtual Landline','Aseem','FMT','LFMT',service_sub_type) ser_type,count(1) COUNT from SYS.vm_orders   where  order_status='Complete' and   trunc(order_comp_date) between '${fromDt}' AND '${toDt}' and 
    order_type='New'  and order_sub_type='Provision'  and service_sub_type not like 'FTTH%'  group by Order_sub_type,service_type,service_sub_type
    `; 

    // console.log(sql);
    if(fromDt){
        title = `LL_Provisions_service_sub_type_wise ${fromDt} to ${toDt}`
    }
    
    oracle.queryObject(sql,{},{}).then(result => {      
        // res.json(result)
        // console.log("Displayed: LL_Provisions_service_sub_type_wise", startOfMonth, endOfMonth);
        res.render( 'test', {
            data:result,
            title:title,
            links:[
                {feild:"COUNT", params:`SER_TYPE` , page:'NPC_PENDING_ORDERS_SDE'}
            ],
            calender: {startOfMonth:startOfMonth, 
                    endOfMonth:endOfMonth}
        })
    })  
   



}


function calenderMiddleware(req){
    
        let fromDt = moment().startOf('month').format('YYYY-MM-DD');
        let toDt   = moment().endOf('month').format('YYYY-MM-DD');
        
        let startOfMonth = fromDt
        let endOfMonth = toDt
        
        if(req.body.fromDt){
            fromDt = new Date(req.body.fromDt)
            toDt = new Date(req.body.toDt)

            startOfMonth = moment(fromDt).format('YYYY-MM-DD'); 
            endOfMonth = moment(toDt).format('YYYY-MM-DD'); 
        }
    
        fromDt = moment(fromDt).format('DD-MMM-YYYY')
        toDt = moment(toDt).format('DD-MMM-YYYY')
        

    return {startOfMonth, endOfMonth, fromDt, toDt}



}
*/

