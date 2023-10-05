const express = require('express');
const router = express.Router();

const moment = require("moment");

const oracle = require('./models/db');
const sqlquery = require('./models/query').sqlquery;
const itpcQuery = require('./models/query').itpcQuery;


const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const oneDay = 1000 * 60 * 60 *24;

const vm_orders = 'sys.vm_orders'


// a variable to save a session
var session;

router.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

router.use(cookieParser());

const contrl = require('./controllers/page-controller');
const { log } = require('console');

//HomePage
router.get('/',async(req,res)=>{
    let sql = `select service_type,  Count(*) count 
            from sys.vm_working_lines GROUP BY service_type order by 2 desc `;
    let title = `Home Page `;

    let result = await oracle.queryObject(sql, {}, {});

    res.render('homepage', {
        data:result,
        title:title,
        tablesummary :['COUNT'],
        summarypage : 'No Page'
    })



});
const summary_Close_Provn = async(req,res)=>{

    const {startOfMonth, endOfMonth, fromDt, toDt} = calenderMiddleware(req)
    
    let title = '';
    let links =[];
    let tablesummary = [];
    let summarypage = ''

    function gensql(desgn) {
        
        return `
    
        with c_ll as (
            select a.${desgn}, NVL(count(1),0) LL_C from vm_exchange_control a, ${vm_orders} b where a.exchange=b.exchange_code 
            and order_status='Complete' and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and order_type='Disconnect' and order_sub_type like 'Disconnect%' and service_type='Landline' 
            and service_sub_type in('Fixed Landline','FMT','Virtual Landline') 
            group by a.${desgn}
            ),
            c_bb as (
            select a.${desgn}, NVL(count(1),0) BB_C from vm_exchange_control a, ${vm_orders} b where a.exchange=b.exchange_code 
            and order_status='Complete' and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and order_type='Modify' and order_sub_type='Broadband Disconnection' 
            and service_type='Landline'
            group by a.${desgn}
            ),
            c_ftth as (
            select a.${desgn}, NVL(count(1),0) FTTH_C from vm_exchange_control a, ${vm_orders} b where a.exchange=b.exchange_code 
            and order_status='Complete' and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and order_type='Disconnect'  and service_type='Bharat Fiber BB'
            group by a.${desgn}
            ),
            p_ll as (
            select a.${desgn}, NVL(count(1),0) LL_P from vm_exchange_control a, ${vm_orders} b where a.exchange=b.exchange_code 
            and order_status='Complete' and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and order_type='New'
            and order_sub_type='Provision' and service_type='Landline' and service_sub_type='Fixed Landline' 
            and service_sub_type in('Fixed Landline','FMT','Virtual Landline') 
            group by a.${desgn}
            ),
            p_bb as (
            select a.${desgn}, NVL(count(1),0) BB_P from vm_exchange_control a, ${vm_orders} b where a.exchange=b.exchange_code 
            and order_status='Complete' and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and order_type='Modify' and order_sub_type='Broadband Provision'  
            group by a.${desgn}
            ),
            p_ftth as (
            select a.${desgn}, NVL(count(1),0) FTTH_P from vm_exchange_control a, ${vm_orders} b where a.exchange=b.exchange_code 
            and order_status='Complete' and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and order_type='New' and service_sub_type='Bharat Fiber BB'
            group by a.${desgn}
            ),
            cn_ftth as (
            select a.${desgn}, NVL(count(1),0) FTTH_Cnv from vm_exchange_control a, ${vm_orders} b where a.exchange=b.exchange_code 
            and order_status='Complete' and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and order_type='Disconnect' and order_sub_type='Bharat Fiber Conversion' and service_type='Landline'
            group by a.${desgn}
            ),
            SDE as (
            select distinct ${desgn} from vm_exchange_control
            )
            select a.${desgn},  LL_P, BB_P, FTTH_P, NVL(LL_P,0) + NVL(BB_P,0) + NVL(FTTH_P,0) T_P,  
                    LL_C, BB_C, FTTH_C ,FTTH_Cnv,   (NVL(LL_C,0) + NVL(BB_C,0) +  NVL(FTTH_C,0) + NVL(FTTH_Cnv,0)) T_C,
                            NVL(LL_P,0) + NVL(BB_P,0) + NVL(FTTH_P,0) -  NVL(LL_C,0) - NVL(BB_C,0) -  NVL(FTTH_C,0) - NVL(FTTH_Cnv,0) net from sde a  
                left join c_ll on a.${desgn} = c_ll.${desgn} 
                left join p_ll on a.${desgn} = p_ll.${desgn} 
                left join c_bb on a.${desgn} = c_bb.${desgn} 
                left join p_bb on a.${desgn} = p_bb.${desgn}
                left join p_ftth on a.${desgn} = p_ftth.${desgn}
                left join cn_ftth on a.${desgn} = cn_ftth.${desgn} 
                left join c_ftth on a.${desgn} = c_ftth.${desgn} 
                order by ${desgn}               
            `;
    }

    let sql_SDE = gensql('sde');
    let sql_DE = gensql('de');
    
    // let sql_SDE = 'Select * from Dual';
    // let sql_DE = 'Select * from Dual';


    // console.log(sql_DE);

    // console.log(sql_SDE);
    title = `Provisions and Closures from  ${fromDt}  AND ${toDt} `;

    links = [          
        {feild:"COUNT", params:`SDE` , page:'Pending_Faults_SDE/FTTH'}
    ];

    tablesummary = ['LL_P','BB_P','FTTH_P', 'LL_C','BB_C','FTTH_C', 'T_P', 'T_C', 'FTTH_CNV', 'NET'];
    summarypage = 'test/FTTH'

    let result1 = await oracle.queryObject(sql_DE,{},{});        
    let result2 = await oracle.queryObject(sql_SDE,{},{});   
    
    
    
    res.render( 'SummaryReports/index0', {
        data1:result1,
        data2:result2,
        title:title,
        links:links,            
        tablesummary:tablesummary,
        summarypage: summarypage,
        calender: {startOfMonth:startOfMonth, 
            endOfMonth:endOfMonth}
    })



    
}
router.get('/summary_Close_Provn', summary_Close_Provn);
router.post('/summary_Close_Provn', summary_Close_Provn);

router.get('/Jobstatus', contrl.jobStatus);
router.get('/faults', contrl.faultDailyLL);
router.get('/faultsFTTH', contrl.faultDailyFTTH);
router.get('/faultsBB', contrl.faultDailyBB);
router.get('/wkg_lines',contrl.wkg_lines);

/*
router.get('/NPC_PENDING_ORDERS/:TYPE',contrl.NPC_PENDING_ORDERS);
router.get('/NPC_PENDING_ORDERS_SDE/:TYPE/:SDE',contrl.NPC_PENDING_ORDERS_SDE);

router.get('/LL_Provisions_service_sub_type_wise',contrl.LL_Provisions_service_sub_type_wise);
router.post('/LL_Provisions_service_sub_type_wise',contrl.LL_Provisions_service_sub_type_wise);

*/

//#region NPC_PENDING_ORDERS
router.get('/NPC_PENDING_ORDERS/:TYPE',(req,res) =>{
    let sql = '';
    let title = '';
    let links =[];
    let tablesummary = [];
    let summarypage = ''
    


    switch (req.params.TYPE) {
      case "LL":
        sql = `
            SELECT A.SDE sde,COUNT(1) count FROM vm_exchange_control a, ${vm_orders} b 
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
            SELECT A.SDE sde,COUNT(1) count FROM vm_exchange_control a, ${vm_orders} b 
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
            COUNT(1) COUNT FROM vm_exchange_control a, ${vm_orders} b where a.exchange=b.exchange_code 
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
        res.render( 'index2', {
            data:result,
            title:title,
            links:links,
            // footer:["Total",`<b><a href="NPC_PENDING_ORDERS_SDE/${req.params.TYPE}/total"> ${t1} </a></b>`],
            tablesummary:tablesummary,
            summarypage: summarypage
            
            
        })
                
    })    
});

router.get('/NPC_PENDING_ORDERS_SDE/:TYPE/:SDE', (req,res) =>{

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
        SELECT A.SDE sde, b.Phone_NO  FROM vm_exchange_control a, ${vm_orders} b 
        where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.order_type='New' AND  
        b.order_sub_type like 'Provision%' ${sqlSDE} and
        order_status not in ('Complete','Open','Cancelled','Submission In Progress','Not Feasible')  ${service_sub_type}    
        `; 
        break;
      case "BB":
        
        service_sub_type = `and service_sub_type='Fixed Landline' and  phone_no not like '0891-297%'  `;
        
        sql = `
        SELECT A.SDE sde, b.Phone_NO  FROM vm_exchange_control a, ${vm_orders} b 
        where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.order_type='New' AND  
        b.order_sub_type like 'Provision%' ${sqlSDE} and
        order_status not in ('Complete','Open','Cancelled','Submission In Progress','Not Feasible')  ${service_sub_type}    
        `;
        
        break;

      case "FTTH" :
        sql = `
        SELECT b.exchange_code, b.Phone_NO, BB_user_id,Service_sub_type,clarity_service_order,order_no,order_created_date,order_status,pending_task,MAINTENANCE_FRANCHISEE,(trunc(sysdate)-trunc(order_created_date)) pend
          FROM vm_exchange_control a, ${vm_orders} b where a.exchange=b.exchange_code 
            and  order_status not in ('Complete','Open','Cancelled','Submission In Progress') ${sqlSDE}
            and  b.ssa='VISAKHAPATNAM' and b.order_type='New' AND service_sub_type like 'Bharat Fiber%'   
        `;

        break;


      default:
        break;
    }

    // console.log(sql);   
    
    oracle.queryObject(sql,{},{}).then(result => {              
        
        res.render( 'index2', {
            data:result,
            title:`${req.params.TYPE} PENDING ORDERS - SDE  ${req.params.SDE}`            
            
        })
                
    })    
}

);
//#endregion NPC_PENDING_ORDERS

//#region Pending_Faults
router.get('/Pending_Faults/:TYPE',async(req,res) =>{
    let sql_SDE = '';
    let sql_DE = '';
    let title = '';
    let links =[];
    let tablesummary = [];
    let summarypage = ''
    


    switch (req.params.TYPE) {
      case "LL":
        sql_SDE = `
            SELECT A.SDE sde,COUNT(1) count FROM vm_exchange_control a, ${vm_orders} b 
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
        summarypage = 'Pending_Faults_SDE/LL'
        break;
      case "BB":
        sql_SDE = `
            SELECT A.SDE sde,COUNT(1) count FROM vm_exchange_control a, ${vm_orders} b 
            where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and order_type='Modify' 
            and order_sub_type like 'Broadband Provision%' 
            and  order_status not in ('Complete','Open','Cancelled','Submission In Progress')  and phone_no not like '0891-297%'
            group by a.sde             
            `; 
        
        title = 'BB NPC Pending Orders'
        
        links = [
                {feild:"COUNT", params:`SDE` , page:'Pending_Faults_SDE/BB'}
            ];
        tablesummary = ['COUNT'];
        summarypage ='Pending_Faults_SDE/BB'
        break;
      case "FTTH":
        sql_SDE = `
        select a.sde SDE,sum(case when service_type='Bharat Fiber Voice' then 1 else 0 end) Voice,sum(case when service_type='Bharat Fiber BB' then 1 else 0 end) BB,count(1) COUNT from vm_exchange_control a, 
        sys.vm_ftth_faults2 b  where a.exchange=b.exchange_code and 
        b.ssa='VISAKHAPATNAM' and  b.comp_status='Open'  group by a.sde
        `;
        sql_DE = `
        select a.DE DE,sum(case when service_type='Bharat Fiber Voice' then 1 else 0 end) Voice,sum(case when service_type='Bharat Fiber BB' then 1 else 0 end) BB,count(1) COUNT from vm_exchange_control a, 
        sys.vm_ftth_faults2 b  where a.exchange=b.exchange_code and 
        b.ssa='VISAKHAPATNAM' and  b.comp_status='Open'  group by a.DE
        `;
        title = 'FTTH Pending Faults';
        links = [          
            {feild:"COUNT", params:`SDE` , page:'Pending_Faults_SDE/FTTH'}
        ];

        tablesummary = ['VOICE','BB','COUNT'];
        summarypage = 'Pending_Faults_SDE/FTTH'
      default:
        break;
    }
      
    
    let result1 = await oracle.queryObject(sql_DE,{},{});
    let result2 = await oracle.queryObject(sql_SDE,{},{});
    res.render( 'test_2', {
        data1:result1,
        data2:result2,
        title:title,
        links:links,            
        tablesummary:tablesummary,
        summarypage: summarypage
    })

   
});


router.get('/Pending_Faults_SDE/:TYPE/:SDE', (req,res) =>{

    let sql_SDE = ""

    let sqlSDE = '';
    let service_sub_type = '';
    

    if(req.params.SDE !='TOTAL') {
        sqlSDE = `and  A.SDE = '${req.params.SDE}'`;
    } 

    switch (req.params.TYPE) {
      case "LL":
        service_sub_type = `and service_sub_type='Fixed Landline' and  phone_no not like '0891-297%'  `;

        sql_SDE = `
        SELECT A.SDE sde, b.Phone_NO  FROM vm_exchange_control a, ${vm_orders} b 
        where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.order_type='New' AND  
        b.order_sub_type like 'Provision%' ${sqlSDE} and
        order_status not in ('Complete','Open','Cancelled','Submission In Progress','Not Feasible')  ${service_sub_type}    
        `; 
        break;
      case "BB":
        
        service_sub_type = `and service_sub_type='Fixed Landline' and  phone_no not like '0891-297%'  `;
        
        sql_SDE = `
        SELECT A.SDE sde, b.Phone_NO  FROM vm_exchange_control a, ${vm_orders} b 
        where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.order_type='New' AND  
        b.order_sub_type like 'Provision%' ${sqlSDE} and
        order_status not in ('Complete','Open','Cancelled','Submission In Progress','Not Feasible')  ${service_sub_type}    
        `;
        
        break;

      case "FTTH" :
        
      sql_SDE = `
        select b.exchange_code, b.docket_no, b.phone_no, b.service_type, trunc(comp_bkd_date) Booked_Dt, comp_type, comp_sub_type,comp_sub_status, pending_task  
        from sys.vm_ftth_faults2 b join vm_exchange_control a  on  a.exchange=b.exchange_code 
        where comp_status='Open' ${sqlSDE}
        order by Booked_Dt, service_type,exchange_code
        `;

        break;


      default:
        break;
    }

    // console.log(sql_SDE);   
    
    oracle.queryObject(sql_SDE,{},{}).then(result => {   
        res.render( 'index2', {
            data:result,
            title:`${req.params.TYPE} Pending Faults - SDE ${req.params.SDE}     `            
            
        })
                
    })    
}

);
//#endregion Pending_Faults

//#region CLOUSER
const CLOUSER = async(req,res) =>{

    const {startOfMonth, endOfMonth, fromDt, toDt} = calenderMiddleware(req)

    let sql_SDE = '';
    let sql_DE = '';
    let title = '';
    let links =[];
    let tablesummary = [];
    let summarypage = ''
    


    switch (req.params.TYPE) {
      case "LL":
        sql_SDE = `
            SELECT A.SDE sde,COUNT(1) count FROM vm_exchange_control a, ${vm_orders} b 
            where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' 
            and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and b.order_type='Disconnect' 
            AND   b.order_sub_type like 'Provision%'            
            and service_sub_type not like '%Fiber%'
            group by sde order by sde  
            `; 
        sql_DE = `
            SELECT A.DE sde,COUNT(1) count FROM vm_exchange_control a, ${vm_orders} b 
            where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' 
            and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and b.order_type='Disconnect' 
            AND   b.order_sub_type like 'Provision%'            
            and service_sub_type not like '%Fiber%'
            group by de 
            `;
        title = 'LL CLOUSERS';
        links = [
            {feild:"COUNT", params:`SDE` , page:'CLOUSER_SDE/LL'}
        ];
        tablesummary = ['COUNT'];
        summarypage = 'CLOUSER_SDE/LL'
        break;
      case "BB":
        sql_SDE = `
            SELECT A.SDE sde,COUNT(1) count FROM vm_exchange_control a, ${vm_orders} b 
            where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' 
            and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and order_type='Disconnect' 
            and order_sub_type like 'Broadband Provision%' 
            and  order_status not in ('Complete','Open','Cancelled','Submission In Progress')  and phone_no not like '0891-297%'
            group by a.sde             
            `; 
        
        title = 'BB CLOUSERS'
        
        links = [
                {feild:"COUNT", params:`SDE` , page:'CLOUSER_SDE/BB'}
            ];
        tablesummary = ['COUNT'];
        summarypage ='CLOUSER_SDE/BB'
        break;
      case "FTTH":
        sql_SDE = `
        SELECT A.SDE sde,
            sum(case when service_sub_type='Bharat Fiber Voice' then 1 else 0 end) VOICE,
            sum(case when service_sub_type='Bharat Fiber BB' then 1 else 0 end) BB,
            COUNT(1) COUNT FROM vm_exchange_control a, ${vm_orders} b where a.exchange=b.exchange_code 
            and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and order_type='Disconnect' and service_sub_type like 'Bharat Fiber%'  
            group by a.sde 
        `;
        sql_DE = `
        SELECT A.DE DE,
            sum(case when service_sub_type='Bharat Fiber Voice' then 1 else 0 end) VOICE,
            sum(case when service_sub_type='Bharat Fiber BB' then 1 else 0 end) BB,
            COUNT(1) COUNT FROM vm_exchange_control a, ${vm_orders} b where a.exchange=b.exchange_code 
            and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and order_type='Disconnect' and service_sub_type like 'Bharat Fiber%'  
            group by a.DE 
        `;
        title = `FTTH Clouser between ${fromDt}  AND ${toDt} `;
        links = [                     
            {feild:"COUNT", params:`SDE` , page:'CLOUSER_SDE/FTTH'}
        ];

        tablesummary = ['VOICE','BB','COUNT'];
        summarypage = 'CLOUSER_SDE/FTTH'
      default:
        break;



    } //end of switch

    // console.log(sql_DE);
    
    let result1 = await oracle.queryObject(sql_DE,{},{});
    let result2 = await oracle.queryObject(sql_SDE,{},{});

    res.render( 'test_2', {
                data1:result1,
                data2:result2,
                title:title,
                links:links,            
                tablesummary:tablesummary,
                summarypage: summarypage,            
                calender: {startOfMonth:startOfMonth, 
                            endOfMonth:endOfMonth}
            })
  
}

router.get('/CLOUSER/:TYPE', CLOUSER );
router.post('/CLOUSER/:TYPE', CLOUSER );

router.get('/CLOUSER_SDE/:TYPE/:SDE', (req,res) =>{

    const {startOfMonth, endOfMonth, fromDt, toDt} = calenderMiddleware(req)

    let sql_SDE = ""

    let sqlSDE = '';
    let service_sub_type = '';
    

    if(req.params.SDE !='TOTAL') {
        sqlSDE = `and  A.SDE = '${req.params.SDE}'`;
    } 

    switch (req.params.TYPE) {
      case "LL":
        service_sub_type = `and service_sub_type='Fixed Landline' and  phone_no not like '0891-297%'  `;

        sql_SDE = `
        SELECT A.SDE sde, b.Phone_NO  FROM vm_exchange_control a, ${vm_orders} b 
        where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.order_type='New' AND  
        b.order_sub_type like 'Provision%' ${sqlSDE} and
        order_status not in ('Complete','Open','Cancelled','Submission In Progress','Not Feasible')  ${service_sub_type}    
        `; 
        break;
      case "BB":
        
        service_sub_type = `and service_sub_type='Fixed Landline' and  phone_no not like '0891-297%'  `;
        
        sql_SDE = `
        SELECT A.SDE sde, b.Phone_NO  FROM vm_exchange_control a, ${vm_orders} b 
        where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.order_type='New' AND  
        b.order_sub_type like 'Provision%' ${sqlSDE} and
        order_status not in ('Complete','Open','Cancelled','Submission In Progress','Not Feasible')  ${service_sub_type}    
        `;
        
        break;

      case "FTTH" :
        sql_SDE = `
        select service_sub_type, b.exchange_code,b.PHONE_NO,b.ORDER_TYPE,b.ORDER_SUB_TYPE,b.order_created_date,b.order_comp_date,b.ORDER_STATUS,b.mobile_no,b.disconn_reason,
        (b.CUSTOMER_NAME||','||b.addr_1||','||b.addr_2||','||b.HOUSE_NO||','||b.village_name||','||b.additional_details) address,
        b.os_amt,c.olt_vendor,c.olt_name,c.work_franchisee from  ${vm_orders} b 
        left join vm_exchange_control a on  a.exchange=b.exchange_code 
        left join vm_ftth_attributes1 c  on  b.phone_no=c.phone and b.SERVICE_TYPE=c.SERVICE_TYPE
         where order_status='Complete' 
         and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}'  
         and order_type='Disconnect' and service_sub_type like 'Bharat Fiber%' 
         ${sqlSDE}  order by service_sub_type
        `;
        break;


      default:
        break;
    }

    // console.log(sql_SDE);   
    
    oracle.queryObject(sql_SDE,{},{}).then(result => {   
        res.render( 'index2', {
            data:result,
            title:`${req.params.TYPE} CLOUSERs - SDE ${req.params.SDE}  between '${fromDt}'  AND '${toDt}'   `            
            
        })
                
    })    
}

);
//#endregion CLOUSER

//#region Closure Pending orders
const CLOUSER_PENDING = async(req,res) =>{

    const {startOfMonth, endOfMonth, fromDt, toDt} = calenderMiddleware(req)

    let sql_SDE = '';
    let sql_DE = '';
    let title = '';
    let links =[];
    let tablesummary = [];
    let summarypage = ''



    switch (req.params.TYPE) {
      case "LL":
        sql_SDE = `
        SELECT A.SDE sde,COUNT(1)  COUNT FROM vm_exchange_control a,sys.vm_orders b 
        where a.exchange=b.exchange_code
        and b.ssa='VISAKHAPATNAM' 
        and b.order_type='Disconnect' 
        AND  b.order_sub_type like 'Disconnect%' 
        and  order_status not in ('Complete','Open','Cancelled','Submission In Progress','Not Feasible')  
        and service_sub_type='Fixed Landline' group by sde
            `; 
        sql_DE = `
        SELECT A.DE sde,COUNT(1)  COUNT FROM vm_exchange_control a,sys.vm_orders b 
        where a.exchange=b.exchange_code
        and b.ssa='VISAKHAPATNAM' 
        and b.order_type='Disconnect' 
        AND  b.order_sub_type like 'Disconnect%' 
        and  order_status not in ('Complete','Open','Cancelled','Submission In Progress','Not Feasible')  
        and service_sub_type='Fixed Landline' group by de
            `; 


        title = 'LL Closures Pending';
        links = [
            {feild:"COUNT", params:`SDE` , page:'CLOUSER_PENDING_SDE/LL'}
        ];
        tablesummary = ['COUNT'];
        summarypage = 'CLOUSER_SDE/LL'
        break;
      case "BB":
        sql_SDE = `
            SELECT A.SDE sde,COUNT(1) count FROM vm_exchange_control a, ${vm_orders} b 
            where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' 
            and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and order_type='Disconnect' 
            and order_sub_type like 'Broadband Provision%' 
            and  order_status not in ('Complete','Open','Cancelled','Submission In Progress')  and phone_no not like '0891-297%'
            group by a.sde             
            `; 
        
        title = 'BB CLOUSERS'
        
        links = [
                {feild:"COUNT", params:`SDE` , page:'CLOUSER_PENDING_SDE/BB'}
            ];
        tablesummary = ['COUNT'];
        summarypage ='CLOUSER_SDE/BB'
        break;
      case "FTTH":
        sql_SDE = `
        
        select sde sde,sum(case when order_sub_type='Disconnect' then 1 else 0 end) clsvo,sum(case when order_sub_type='Disconnect Due to NP' then 1 else 0 end) clsnp, count(*) COUNT from ${vm_orders} a,vm_exchange_control b 
        where  service_sub_type like 'Bharat Fiber%'  
        and a.exchange_code=b.exchange and order_type='Disconnect' and  order_status='In Progress' 
        group by sde order by SDE


        `;
        sql_DE = `
        select DE DE,sum(case when order_sub_type='Disconnect' then 1 else 0 end) clsvo,sum(case when order_sub_type='Disconnect Due to NP' then 1 else 0 end) clsnp, count(*) COUNT from ${vm_orders} a,vm_exchange_control b 
        where  service_sub_type like 'Bharat Fiber%'  
        and a.exchange_code=b.exchange and order_type='Disconnect' and  order_status='In Progress' 
        group by DE order by de
        `;
        title = `FTTH Pendind Clouser  `;
        links = [                     
            {feild:"COUNT", params:`SDE` , page:'CLOUSER_PENDING_SDE/FTTH'}
        ];

        tablesummary = ['CLSVO','CLSNP', 'COUNT'];
        summarypage = 'CLOUSER_PENDING_SDE/FTTH'
      default:
        break;



    } //end of switch

    // console.log(sql_DE);
    
    let result1 = await oracle.queryObject(sql_DE,{},{});
    let result2 = await oracle.queryObject(sql_SDE,{},{});

    res.render( 'test_2', {
                data1:result1,
                data2:result2,
                title:title,
                links:links,            
                tablesummary:tablesummary,
                summarypage: summarypage,            
               
            })


}

router.get('/CLOUSER_PENDING/:TYPE', CLOUSER_PENDING );

router.post('/CLOUSER_PENDING/:TYPE', CLOUSER_PENDING );

router.get('/CLOUSER_PENDING_SDE/:TYPE/:SDE', (req,res) =>{

   

    let sql_SDE = ""

    let sqlSDE = '';
    let service_sub_type = '';
    

    if(req.params.SDE !='TOTAL') {
        sqlSDE = `and  a.SDE = '${req.params.SDE}'`;
    } 

    switch (req.params.TYPE) {
      case "LL":
        service_sub_type = `and service_sub_type='Fixed Landline' and  phone_no not like '0891-297%'  `;

        sql_SDE = `
        SELECT A.SDE sde, b.Phone_NO, order_sub_type  FROM vm_exchange_control a, ${vm_orders} b 
        where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.order_type='Disconnect' AND  
         order_sub_type in ('Disconnect Due to NP','Disconnect')  ${sqlSDE} 
        and order_status='In Progress'   ${service_sub_type}    
        `; 
        break;
      case "BB":
        
        service_sub_type = `and service_sub_type='Fixed Landline'  and  phone_no not like '0891-297%'  `;
        
        sql_SDE = `
        SELECT A.SDE sde, b.Phone_NO, order_sub_type  FROM vm_exchange_control a, ${vm_orders} b 
        where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.order_type='Disconnect' AND  
         order_sub_type in ('Disconnect Due to NP','Disconnect')  ${sqlSDE}
        and order_status='In Progress'   ${service_sub_type}    
        `;
        
        break;

        case "FTTH":
        sql_SDE = `
        select EXCHANGE_CODE ,PHONE_NO,PENDING_TASK,order_sub_type, CLARITY_SERVICE_ORDER, ORDER_NO, ORDER_CREATED_DATE, ORDER_STATUS,BB_USER_ID,SERVICE_SUB_TYPE,
        (trunc(sysdate)-trunc(order_created_date)) pend_days,BILL_ACCNT_NO ,customer_name,mobile_no from ${vm_orders} b, vm_exchange_control a 
        where service_sub_type like 'Bharat Fiber%'  and a.exchange_code=b.exchange 
        and order_sub_type in ('Disconnect Due to NP','Disconnect') 
        and  order_status='In Progress' ${sqlSDE} 
        order by  pend_days desc
        `;
        break;


      default:
        break;
    }

    // console.log(sql_SDE);   
    
    
    oracle.queryObject(sql_SDE,{},{}).then(result => {   
        res.render( 'index2', {
            data:result,
            title:`${req.params.TYPE} C Pending- SDE ${req.params.SDE}     `            
            
        })
                
    })    
}

);
//#endregion CLOUSER

//#region Completed Orders
const CompletedOrders = async(req,res) => {
    
    const {startOfMonth, endOfMonth, fromDt, toDt} = calenderMiddleware(req)

    let sql_SDE = '';
    let sql_DE = '';
    let title = '';
    let links =[];
    let tablesummary = [];
    let summarypage = ''
    

    switch (req.params.TYPE) {
      case "LL":
        sql_SDE = `
            SELECT A.SDE sde,COUNT(1) count FROM vm_exchange_control a, ${vm_orders} b 
            where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' 
            and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and b.order_type='Disconnect' 
            AND   b.order_sub_type like 'Provision%'            
            and service_sub_type not like '%Fiber%'
            group by sde order by sde  
            `; 
        title = 'LL CLOUSERS';
        links = [
            {feild:"COUNT", params:`SDE` , page:'CLOUSER_SDE/LL'}
        ];
        tablesummary = ['COUNT'];
        summarypage = 'CLOUSER_SDE/LL'
        break;
      case "BB":
        sql_SDE = `
            SELECT A.SDE sde,COUNT(1) count FROM vm_exchange_control a, ${vm_orders} b 
            where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' 
            and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
            and order_type='Disconnect' 
            and order_sub_type like 'Broadband Provision%' 
            and  order_status not in ('Complete','Open','Cancelled','Submission In Progress')  and phone_no not like '0891-297%'
            group by a.sde             
            `; 
        
        title = 'BB CLOUSERS'
        
        links = [
                {feild:"COUNT", params:`SDE` , page:'CLOUSER_SDE/BB'}
            ];
        tablesummary = ['COUNT'];
        summarypage ='CLOUSER_SDE/BB'
        break;
      case "FTTH":
        sql_SDE = `

        select a.sde sde,
        (sum(case when service_sub_type='Bharat Fiber Voice' then 1 else 0 end)) Voice,
        (sum(case when service_sub_type='Bharat Fiber BB' then 1 else 0 end)) bb,count(1) COUNT
        from vm_exchange_control a, ${vm_orders} b  where a.exchange=b.exchange_code 
        and  order_status='Complete' 
        and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
        and order_type='New' and service_sub_type like 'Bharat Fiber%' group by a.sde 

        `;

        sql_DE = `
        select a.de de,
        (sum(case when service_sub_type='Bharat Fiber Voice' then 1 else 0 end)) Voice,
        (sum(case when service_sub_type='Bharat Fiber BB' then 1 else 0 end)) bb,count(1) COUNT
        from vm_exchange_control a, ${vm_orders} b  where a.exchange=b.exchange_code 
        and  order_status='Complete' 
        and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}' 
        and order_type='New' and service_sub_type like 'Bharat Fiber%' group by a.de 
        `;


        title = `FTTH Completed Orders between ${fromDt}  AND ${toDt} `;
        links = [                     
            {feild:"COUNT", params:`SDE` , page:'CompletedOrders_SDE/FTTH'}
        ];

        tablesummary = ['VOICE','BB','COUNT'];
        summarypage = 'CLOUSER_SDE/FTTH'
      default:
        break;
    }
      
    // console.log(sql_SDE);
    //#region method 1
        //   oracle.queryObject(sql,{},{}).then(result => {        
        //     res.render( 'test', {
        //         data:result,
        //         title:title,
        //         links:links,            
        //         tablesummary:tablesummary,
        //         summarypage: summarypage,            
        //         calender: {startOfMonth:startOfMonth, 
        //                     endOfMonth:endOfMonth}
        //     })
        // })    
    //#endregion

    let result1 = await oracle.queryObject(sql_DE,{},{});
    let result2 = await oracle.queryObject(sql_SDE,{},{});

    res.render( 'test_2', {
                data1:result1,
                data2:result2,
                title:title,
                links:links,            
                tablesummary:tablesummary,
                summarypage: summarypage,            
                calender: {startOfMonth:startOfMonth, 
                            endOfMonth:endOfMonth}
            })


}

router.get('/CompletedOrders/:TYPE', CompletedOrders );
router.post('/CompletedOrders/:TYPE', CompletedOrders );


router.get('/CompletedOrders_SDE/:TYPE/:SDE', (req,res) =>{

    const {startOfMonth, endOfMonth, fromDt, toDt} = calenderMiddleware(req)

    let sql_SDE = ""

    let sqlSDE = '';
    let service_sub_type = '';
    

    if(req.params.SDE !='TOTAL') {
        sqlSDE = `and  A.SDE = '${req.params.SDE}'`;
    } 

    switch (req.params.TYPE) {
      case "LL":
        service_sub_type = `and service_sub_type='Fixed Landline' and  phone_no not like '0891-297%'  `;

        sql_SDE = `
        SELECT A.SDE sde, b.Phone_NO  FROM vm_exchange_control a, ${vm_orders} b 
        where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.order_type='New' AND  
        b.order_sub_type like 'Provision%' ${sqlSDE} and
        order_status not in ('Complete','Open','Cancelled','Submission In Progress','Not Feasible')  ${service_sub_type}    
        `; 
        break;
      case "BB":
        
        service_sub_type = `and service_sub_type='Fixed Landline' and  phone_no not like '0891-297%'  `;
        
        sql_SDE = `
        SELECT A.SDE sde, b.Phone_NO  FROM vm_exchange_control a, ${vm_orders} b 
        where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.order_type='New' AND  
        b.order_sub_type like 'Provision%' ${sqlSDE} and
        order_status not in ('Complete','Open','Cancelled','Submission In Progress','Not Feasible')  ${service_sub_type}    
        `;
        
        break;

      case "FTTH" :
        sql_SDE = `

        select b.service_sub_type,b.exchange_code, b.ORDER_NO ,b.PHONE_NO,trunc(b.ORDER_CREATED_DATE) Created_DT,
        trunc(b.indoor_comp_date) ID_Comp_DT, trunc(b.order_comp_date) COMPLETED_DT,b.ORDER_TYPE,b.ORDER_SUB_TYPE,b.ORDER_STATUS,b.mobile_no,c.olt_ip,c.olt_owner,b.clarity_service_order,b.CUSTOMER_NAME from vm_exchange_control a, ${vm_orders} b, system.vm_ftth_attributes1 c
        where a.exchange=b.exchange_code and b.phone_no=c.phone(+) 
        and b.service_type=c.service_type(+) 
        and b.order_status='Complete' 
        and trunc(order_comp_date) between '${fromDt}'  AND '${toDt}'
        and b.order_type='New' and b.service_sub_type like 'Bharat Fiber%' 
        ${sqlSDE} order by b.service_sub_type 
        `;
        break;


      default:
        break;
    }

    // console.log(sql_SDE);   
    
    oracle.queryObject(sql_SDE,{},{}).then(result => {   
        res.render( 'index2', {
            data:result,
            title:`${req.params.TYPE} Completed Orders - SDE ${req.params.SDE}  between '${fromDt}'  AND '${toDt}'   `            
            
        })
                
    })    
}

);


//#endregion Completed Orders

//#region  LL_Provisions_service_sub_type_wise
const LL_Provisions_service_sub_type_wise = (req,res) =>{
    
    const {startOfMonth, endOfMonth, fromDt, toDt} = calenderMiddleware(req)

    let tablesummary = [];
    let summarypage = ''


    const sql = `
    select Order_sub_type,service_type,decode(service_sub_type,'Virtual Landline','Aseem','FMT','LFMT',service_sub_type) ser_type,count(1) COUNT from ${vm_orders}   where  order_status='Complete' and   trunc(order_comp_date) between '${fromDt}' AND '${toDt}' and 
    order_type='New'  and order_sub_type='Provision'  and service_sub_type not like 'FTTH%'  group by Order_sub_type,service_type,service_sub_type
    `; 

    tablesummary = ['COUNT'];
    summarypage = 'LL_Provisions_service_sub_type_wise'

    

    // console.log(sql);
    if(fromDt){
        title = `LL Provisions service_sub_type_wise ${fromDt} to ${toDt}`
    }
    
    oracle.queryObject(sql,{},{}).then(result => {      
        // res.json(result)
        // console.log("Displayed: LL_Provisions_service_sub_type_wise", startOfMonth, endOfMonth);
        res.render( 'index2', {
            data:result,
            title:title,
            links:[
                {feild:"COUNT", params:`SER_TYPE` , page:'LL_Provisions'}
            ],
            tablesummary:tablesummary,
            summarypage: summarypage,

            calender: {startOfMonth:startOfMonth, 
                    endOfMonth:endOfMonth}
        })
    })  
   



}


router.get('/LL_Provisions_service_sub_type_wise', LL_Provisions_service_sub_type_wise);
router.post('/LL_Provisions_service_sub_type_wise', LL_Provisions_service_sub_type_wise);

router.get('/LL_Provisions/:SER_TYPE',(req,res)=>{


    let fromDt = req.session.fromDt;
    let toDt   = req.session.toDt;

    let tablesummary = [];
    let summarypage = ''


    const sql = `select a.sde SDE,count(1) COUNT from vm_exchange_control a, ${vm_orders} b  where a.exchange=b.exchange_code and  order_status='Complete' and 
    trunc(ORDER_comp_date) between '${fromDt}' AND '${toDt}' and
    order_type='New'  and order_sub_type='Provision' and phone_no not like '0891-297%' 
    and service_sub_type=decode('${req.params.SER_TYPE}', 'Aseem',
    'Virtual Landline','LFMT','FMT','${req.params.SER_TYPE}') group by a.SDE `;

     // console.log(sql);
     if(fromDt){
        title = `LL Provisions service_sub_type_wise ${fromDt} to ${toDt}`
    }

    tablesummary = ['COUNT'];
    summarypage = 'LL_Provisions_service_sub_type_wise'



    // res.json(req.session)
    // res.send(sql)

    oracle.queryObject(sql,{},{}).then(result => {      
        
        // res.json(result)
        // console.log("Displayed: LL_Provisions_service_sub_type_wise", startOfMonth, endOfMonth);

        res.render( 'index2', {
            data:result,
            title:title,
            links:[
                {feild:"COUNT", params:`SER_TYPE` , page:'LL_Provisions'}
            ],
            tablesummary:tablesummary,
            summarypage: summarypage
        })
    })  
});
//#endregion LL_Provisions_service_sub_type_wise



//#region  Provisions OLTL WISE
const FTTH_Provision_OLT = async (req, res) => {

    const { startOfMonth, endOfMonth, fromDt, toDt } = calenderMiddleware(req)

    let tablesummary = [];
    let summarypage = ''
    let title = ''
    let order_type = req.params.order_type


    const sql_1 = `

    select b.olt_ip  OLT, (sum(case when service_sub_type='Bharat Fiber Voice' then 1 else 0 end)) 
        Voice,(sum(case  when service_sub_type='Bharat Fiber BB' then 1 else 0 end)) bb,count(1) COUNT
        from  ${vm_orders} a, sys.vm_ftth_attributes1 b 
        where a.phone_no=b.phone and  order_status='Complete' 
        and trunc(order_comp_date) between '${fromDt}' AND '${toDt}'
        and a.service_type=b.service_type  
        and order_type='${order_type}' 
        and service_sub_type like 'Bharat Fiber%' group by b.olt_ip   order by b.olt_ip  
    `;

    const sql_2 = `

    select b.work_franchisee  OLT, 
        (sum(case when service_sub_type='Bharat Fiber Voice' then 1 else 0 end)) 
        Voice,(sum(case  when service_sub_type='Bharat Fiber BB' then 1 else 0 end)) bb,count(1) COUNT
        from  ${vm_orders} a, sys.vm_ftth_attributes1 b 
        where a.phone_no=b.phone and  order_status='Complete' 
        and trunc(order_comp_date) between '${fromDt}' AND '${toDt}'
        and a.service_type=b.service_type  
        and order_type='${order_type}' 
        and service_sub_type like 'Bharat Fiber%' group by b.work_franchisee   order by b.work_franchisee 
    `;

    tablesummary = ['VOICE', 'BB', 'COUNT'];
    summarypage = 'FTTH_Provision_OLT/OTL'


    if (fromDt) {
        if (order_type === 'New')
            title = `FTTH Provisions Completed`
        else if (order_type === 'Disconnect')
            title = `FTTH Closures Completed`

        title = `${title} OLT IP wise ${fromDt} to ${toDt}`

    }

    let result1 = await oracle.queryObject(sql_1, {}, {});
    let result2 = await oracle.queryObject(sql_2, {}, {});


    res.render('test_2', {
        data1: result1,
        data2: result2,
        title: title,
        links: [
            { feild: "COUNT", params: `OLT`, page: `FTTH_Provision_OLT/${order_type}` }
        ],
        tablesummary: tablesummary,
        summarypage: summarypage,

        calender: {
            startOfMonth: startOfMonth,
            endOfMonth: endOfMonth
        }
    })



}


router.get('/FTTH_Provision_OLT/:order_type', FTTH_Provision_OLT);
router.post('/FTTH_Provision_OLT/:order_type', FTTH_Provision_OLT);

router.get('/FTTH_Provision_OLT/:order_type/:OLT',(req,res)=>{

    const {startOfMonth, endOfMonth, fromDt, toDt} = calenderMiddleware(req)


    let title = ''
    let order_type = req.params.order_type


    const sql = `
    
    select b.service_sub_type,b.exchange_code, b.ORDER_NO ,b.PHONE_NO,trunc(b.ORDER_CREATED_DATE) Created_Dt ,
    trunc(b.indoor_comp_date) Indoor_Comp, 
    trunc(b.order_comp_date) Completed,
    b.ORDER_TYPE,b.ORDER_SUB_TYPE,b.ORDER_STATUS,b.mobile_no,c.olt_ip,
    c.olt_owner,b.clarity_service_order,b.CUSTOMER_NAME,c.WORK_FRANCHISEE,c.MAINTENANCE_FRANCHISEE 
    from vm_exchange_control a, ${vm_orders} b,sys.vm_ftth_attributes1 c  
    where a.exchange=b.exchange_code 
    and b.phone_no=c.phone(+) 
    and b.service_type=c.service_type(+) 
    and b.order_status='Complete' 
    and trunc(b.order_comp_date) between '${fromDt}' AND '${toDt}'
    and b.order_type='${order_type}' and b.service_sub_type like 'Bharat Fiber%'  
    and  c.olt_ip='${req.params.OLT}' order by b.service_sub_type  
    
 `;

    if(fromDt){
        if(order_type==='New')
            title = `FTTH Provisions`
        else if (order_type==='Disconnect')
            title = `FTTH Closures`


        title = `${title} of OLT IP : <i style='color:lightgreen'> ${req.params.OLT} </i>  From ${fromDt} To ${toDt}`
    }


    oracle.queryObject(sql,{},{}).then(result => {      
        res.render( 'index2', {
            data:result,
            title:title
        })
    })  
});
//#endregion Provisions OLTL WISE


//#region  Closures OLTL WISE
const FTTH_Closures_OLT = (req,res) =>{
    
    const {startOfMonth, endOfMonth, fromDt, toDt} = calenderMiddleware(req)

    let tablesummary = [];
    let summarypage = ''


    const sql = `

    select b.olt_ip  OLT,(sum(case when service_sub_type='Bharat Fiber Voice' then 1 else 0 end))
     Voice,(sum(case when service_sub_type='Bharat Fiber BB' then 1 else 0 end)) bb,count(1) COUNT
        from  ${vm_orders} a,system.VM_FTTH_W_FCM_SERVICE b 
        where a.phone_no=b.phone_no and  order_status='Complete' 
        and trunc(order_comp_date) between '${fromDt}' AND '${toDt}'
        and a.service_type=b.service_type and order_type='Disconnect' 
        and service_sub_type like 'Bharat Fiber%' group by b.olt_ip
    `; 

    tablesummary = ['VOICE','BB','COUNT'];
    summarypage = 'FTTH_Closures_OLT/OTL'

    

    // console.log(sql);
    if(fromDt){
        title = `FTTH Closures service_sub_type_wise ${fromDt} to ${toDt}`
    }
    
    oracle.queryObject(sql,{},{}).then(result => {      
        res.render( 'index2', {
            data:result,
            title:title,
            links:[
                {feild:"COUNT", params:`OLT` , page:'FTTH_Closures_OLT'}
            ],
            tablesummary:tablesummary,
            summarypage: summarypage,

            calender: {startOfMonth:startOfMonth, 
                    endOfMonth:endOfMonth}
        })
    })  
   



}


router.get('/FTTH_Closures_OLT', FTTH_Closures_OLT);
router.post('/FTTH_Closures_OLT', FTTH_Closures_OLT);

router.get('/FTTH_Closures_OLT/:OLT',(req,res)=>{

    const {startOfMonth, endOfMonth, fromDt, toDt} = calenderMiddleware(req)

    let tablesummary = [];
    let summarypage = ''

    const sql = `

    select b.service_sub_type,b.exchange_code, b.ORDER_NO ,b.PHONE_NO,trunc(b.ORDER_CREATED_DATE) Created_Dt ,
    trunc(b.indoor_comp_date) Indoor_Comp, 
    trunc(b.order_comp_date) Completed,
    b.ORDER_TYPE,b.ORDER_SUB_TYPE,b.ORDER_STATUS,b.mobile_no,c.olt_ip,
    c.olt_owner,b.clarity_service_order,b.CUSTOMER_NAME,c.WORK_FRANCHISEE,c.MAINTENANCE_FRANCHISEE 
    from vm_exchange_control a, ${vm_orders} b,sys.vm_ftth_attributes1 c  
    where a.exchange=b.exchange_code 
    and b.phone_no=c.phone(+) 
    and b.service_type=c.service_type(+) 
    and b.order_status='Complete' 
    and trunc(b.order_comp_date) between '${fromDt}' AND '${toDt}'
    and b.order_type='New' and b.service_sub_type like 'Bharat Fiber%'  
    and  c.olt_ip='${req.params.OLT}' order by b.service_sub_type  
    
 `;

    //  console.log(sql);
     if(fromDt){
        title = `FTTH Closures of OLT IP : <i style='color:lightgreen'> ${req.params.OLT} </i>  From ${fromDt} To ${toDt}`
    }


    oracle.queryObject(sql,{},{}).then(result => {     
        res.render( 'index2', {
            data:result,
            title:title
        })
    })  
});
//#endregion Closures OLTL WISE



function calenderMiddleware(req){

    session = req.session
    
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

    req.session.fromDt = fromDt
    req.session.toDt = toDt
    

return {startOfMonth, endOfMonth, fromDt, toDt}

}

router.get('/test',async(req, res)=> {
    let sql = 'select DE, count(*) cnt from vm_exchange_control group by DE';

    let result1 = await oracle.queryObject(sql,{},{},'orcl');
    // let sql = 'select * from dual';
    // let result1 = await oracle.queryObject(sql,{},{},'itpc');

    res.json(result1)
})

router.all('*', (req, res) => {
    // res.status(404).send('<h1>404! Page not found</h1>');
     res.status(404).render('page404');
  });


module.exports = router


