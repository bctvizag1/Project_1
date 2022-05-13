

const sqlquery = {
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
    
    query2 : `
    with data1 AS (
        Select  f.Phone_No, f.EXCHANGE_CODE, MAX(f.COMP_CLD_DATE) dt, COUNT(*) OUTSTANDING_AMT  from VM_CDR_FAULTS1 f         
        where f.COMP_CLD_DATE  BETWEEN TO_DATE('2021/12/01', 'yyyy/mm/dd') and TO_DATE('2022/01/14', 'yyyy/mm/dd')
        group by f.Phone_No,f.EXCHANGE_CODE 
        Having  COUNT(*)>1        
        ) SELECT ex.sde EXNAME, ex.SDECODE, Wkg.EXCHANGE_CODE,d.Phone_No, Wkg.mobile_no, Wkg.SERVICE_TYPE,  dt, d.OUTSTANDING_AMT , 
           Wkg.customer_name,  'fault' type FROM data1 d 
                join VM_EXCHANGE_CONTROL ex on ex.EXCHANGE = d.EXCHANGE_CODE      
                Join VM_WORKING_LINES Wkg on Wkg.Phone_No = d.Phone_NO            
            ORDER BY d.OUTSTANDING_AMT desc, dt desc    
    `,

    query3:`
    select a.sde EXNAME,a.sdecode , b.exchange_code,b.phone_no,b.mobile_no,b.OUTSTANDING_AMT,b.customer_name,  b.SERVICE_TYPE,  b.service_oper_status type
        from vm_working_lines b join vm_exchange_control a on a.exchange=b.exchange_code
        where 
        b.service_oper_status in ('OG barred - NP','Suspend - NP')
        and b.SERVICE_TYPE in ('Landline','Bharat Fiber Voice','Bharat Fiber BB')
        
    `,

    SERVICE_TYPE_COUNT : 'select service_type, count(*) CNT from vm_working_lines GROUP BY service_type order by 2 desc'
}

//and ROWNUM<=10

module.exports = sqlquery;