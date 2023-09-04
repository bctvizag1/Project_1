

const sqlquery = {
    testQuery: `
    select * from ftth_fault  where rownum<=10
    `,
    Jobstatus: `
    select job, SUBSTR(what,33,length(what)-36) View_status, last_date, Last_sec, NEXT_DATE, NEXt_SEc from vm_all_jobs order by last_Date desc
    `,
    query1 : `        
    with tb1 as (
    select ex.CLUST_NO, ex.CLUST_NAME, vw.EXCHANGE_CODE, vw.SERVICE_TYPE, vw.SERVICE_SUB_TYPE, vw.BB_PLAN_ACTIVE_DATE,
    case
     when vw.SERVICE_TYPE='Landline' and  vw.BB_PLAN_ACTIVE_DATE is not null then 'LL+BB' else  vw.SERVICE_SUB_TYPE
    end as Sub_Type
    from VM_WORKING_LINES vw join VM_EXCHANGE_CONTROL ex on vw.EXCHANGE_CODE = ex.EXCHANGE
    where vw.SERVICE_TYPE='Landline' and SERVICE_OPER_STATUS<>'Suspend - NP'
    )
    select CLUST_NO, CLUST_NAME,  Sub_TYPE, count(*) as NOS from tb1 
    group by CLUST_NO, CLUST_NAME,  Sub_TYPE
    order by CLUST_NO, Sub_TYPE     
            `,
    
    repeatfaults : `
    with data1 AS (
        Select  f.Phone_No, f.EXCHANGE_CODE, MAX(f.COMP_CLD_DATE) dt, COUNT(*) OUTSTANDING_AMT  from VM_CDR_FAULTS1 f         
        where f.COMP_CLD_DATE  BETWEEN TO_DATE('2022/12/01', 'yyyy/mm/dd') and TO_DATE('2023/12/30', 'yyyy/mm/dd')
        group by f.Phone_No,f.EXCHANGE_CODE 
        Having  COUNT(*)>1        
        ) SELECT ex.sde EXNAME, ex.SDECODE, Wkg.EXCHANGE_CODE,d.Phone_No, Wkg.mobile_no, Wkg.SERVICE_TYPE,  dt, d.OUTSTANDING_AMT , 
           Wkg.customer_name,  'fault' type FROM data1 d 
                join VM_EXCHANGE_CONTROL ex on ex.EXCHANGE = d.EXCHANGE_CODE      
                Join VM_WORKING_LINES Wkg on Wkg.Phone_No = d.Phone_NO            
            ORDER BY d.OUTSTANDING_AMT desc, dt desc    
    `,

    clearedFaults : `
    with data1 as (        
        select c.exchange_code, a.sdecode, c.phone_no,   c.comp_cld_date OUTSTANDING_AMT, c.docket_no, c.comp_bkd_date, c.comp_cld_date, c.comp_sub_type, c.clearance_code
        from
        vm_cdr_faults1 c 
        join vm_exchange_control a on a.exchange=c.exchange_code
        where comp_cld_date between '01-SEP-2022' and '30-SEP-2022' and comp_status='Closed') 
        select d.*, w.SERVICE_TYPE, w.customer_name, w.mobile_no, 'Cfault' TYPE from data1 d join vm_working_lines w on d.phone_no = w.phone_no    
    `,

    ogbar_susnp:`
    select a.sde EXNAME,a.sdecode , b.exchange_code,b.phone_no,b.mobile_no,b.OUTSTANDING_AMT,b.customer_name,  b.SERVICE_TYPE,  b.service_oper_status type
        from vm_working_lines b join vm_exchange_control a on a.exchange=b.exchange_code
        where 
        b.service_oper_status in ('OG barred - NP','Suspend - NP')
        and b.SERVICE_TYPE in ('Landline','Bharat Fiber Voice')        
    `,

    SERVICE_TYPE_COUNT : `select service_type, count(*) CNT from vm_working_lines GROUP BY service_type order by 2 desc`,

    testsql : `select f.Phone_No, f.EXCHANGE_CODE, f.COMP_CLD_DATE dt, 1 no from VM_CDR_FAULTS1 f  where rownum<=1`,
    wkg_lines :'select phone_no,service_oper_status from vm_working_lines'
}

const itpcQuery = {
    dailyFaultsLL : `
    select PHONE_NO, EXCHANGE_CODE, DOCKET_NO, PENDING_TASK, CREATED	
    from cdr.cdr_faults where ssa='VISAKHAPATNAM' and comp_status='Open'
    order by CREATED
    `,
    dailyFaultsFTTH : `
    select PHONE_NO, EXCHANGE_CODE, DOCKET_NO, PENDING_TASK, CREATED	
    from cdr.ftth_faults where ssa='VISAKHAPATNAM' and comp_status='Open'
    order by CREATED
    `,
    dailyFaultsBB : `
    select PHONE_NO, EXCHANGE_CODE, DOCKET_NO, PENDING_TASK, CREATED	
    from cdr.cdr_faults where ssa='VISAKHAPATNAM' and  comp_sub_type  like 'BB%' and comp_status='Open'
    order by CREATED
    `,
    
    

}
//and ROWNUM<=10

module.exports.sqlquery = sqlquery;
module.exports.itpcQuery = itpcQuery;
