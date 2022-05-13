---select to_char(sysdate,'DD-MON-YYYY HH:MI:SS AM') from dual


--select sysdate, trunc(sysdate) AS B, (trunc(sysdate)-trunc(TO_DATE('05-DEC-2020'))) as c   from dual

--select * from vm_cdr_faults1 WHERE ROWNUM <= 5;

--select * from dba_profiles;

--ALTER PROFILE DEFAULT LIMIT PASSWORD_LIFE_TIME UNLIMITED;

--select * from VM_WORKING_LINES where ROWNUM<=3 and  SERVICE_TYPE='Landline';


--select SERVICE_STATUS, SERVICE_OPER_STATUS, count(*) from VM_WORKING_LINES group by SERVICE_STATUS, SERVICE_OPER_STATUS;

/*
select SERVICE_TYPE, SERVICE_SUB_TYPE, count(*) from VM_WORKING_LINES
   WHERE SERVICE_type like '%Bharat Fiber%' 
    group by SERVICE_TYPE, SERVICE_SUB_TYPE order by SERVICE_TYPE;
 */   
    
 select count(*) from cdr.working_lines@itpc 
 --where ssa='VISAKHAPATNAM' and ROWNUM <= 5   

 select count(*) from cdr.all_tables@itpc;     
 -- DESC  VM_WORKING_LINES  
/*
with tb1 as (
select ex.CLUST_NO, ex.CLUST_NAME, vw.EXCHANGE_CODE, vw.SERVICE_TYPE, vw.SERVICE_SUB_TYPE, vw.BB_PLAN_ACTIVE_DATE,
case
 when vw.SERVICE_TYPE='Landline' and  vw.BB_PLAN_ACTIVE_DATE is not null then 'LL+BB' else  vw.SERVICE_SUB_TYPE
end as Sub_Type
from VM_WORKING_LINES vw join VM_EXCHANGE_CONTROL ex on vw.EXCHANGE_CODE = ex.EXCHANGE
where vw.SERVICE_TYPE='Landline' and SERVICE_OPER_STATUS<>'Suspend - NP'
)
select CLUST_NO, CLUST_NAME, EXCHANGE_CODE, SERVICE_TYPE, Sub_TYPE, count(*) as NOS from tb1 
group by CLUST_NO, CLUST_NAME, EXCHANGE_CODE, SERVICE_TYPE, Sub_TYPE
order by CLUST_NO, Sub_TYPE ;

*/



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
order by CLUST_NO, Sub_TYPE ;
