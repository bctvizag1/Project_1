drop materialized view vm_orders 
grant select on vm_orders to dotsoft
drop materialized view vm_cdr_faults1 
drop materialized view vm_working_lines 
create materialized view vm_working_lines refresh force start with sysdate next sysdate+1 with primary key
 as 
select * from cdr.working_lines@itpc where ssa='VISAKHAPATNAM'
grant select on vm_working_lines to dotsoft 
grant select on vm_ftth_faults to dotsoft
create materialized view vm_order_items refresh force start with sysdate next sysdate+12/24 with rowid as 
select * from cdr.order_items@itpc where order_no in (select order_no from cdr.orders@itpc  where ssa='VISAKHAPATNAM');
grant select on vm_order_items to dotsoft



 with data1 AS (
        Select  f.Phone_No, f.EXCHANGE_CODE, MAX(f.COMP_CLD_DATE) dt, COUNT(*) OUTSTANDING_AMT  from VM_CDR_FAULTS1 f         
        where f.COMP_CLD_DATE  BETWEEN TO_DATE('2022/05/01', 'yyyy/mm/dd') and TO_DATE('2022/05/31', 'yyyy/mm/dd')
        group by f.Phone_No,f.EXCHANGE_CODE 
        Having  COUNT(*)>1        
        ) SELECT ex.sde EXNAME, ex.SDECODE, Wkg.EXCHANGE_CODE,d.Phone_No, Wkg.mobile_no, Wkg.SERVICE_TYPE,  dt, d.OUTSTANDING_AMT , 
           Wkg.customer_name,  'fault' type FROM data1 d 
                join VM_EXCHANGE_CONTROL ex on ex.EXCHANGE = d.EXCHANGE_CODE      
                Join VM_WORKING_LINES Wkg on Wkg.Phone_No = d.Phone_NO            
            ORDER BY d.OUTSTANDING_AMT desc, dt desc   

 select a.sde EXNAME,a.sdecode , b.exchange_code,b.phone_no,b.mobile_no,b.OUTSTANDING_AMT,b.customer_name,  b.SERVICE_TYPE,  b.service_oper_status type
        from vm_working_lines b join vm_exchange_control a on a.exchange=b.exchange_code
        where 
        b.service_oper_status in ('OG barred - NP','Suspend - NP')
        and b.SERVICE_TYPE in ('Landline','Bharat Fiber Voice','Bharat Fiber BB')

/*--------------------------------*/

 with data1 AS (
        Select  f.Phone_No, f.EXCHANGE_CODE, MAX(f.COMP_CLD_DATE) dt, COUNT(*) OUTSTANDING_AMT  from VM_CDR_FAULTS1 f         
        where f.COMP_CLD_DATE  BETWEEN TO_DATE('2022/05/01', 'yyyy/mm/dd') and TO_DATE('2022/05/31', 'yyyy/mm/dd')
        group by f.Phone_No,f.EXCHANGE_CODE 
        Having  COUNT(*)>1        
        ) SELECT ex.sde EXNAME, ex.SDECODE, Wkg.EXCHANGE_CODE,d.Phone_No, Wkg.mobile_no,  d.OUTSTANDING_AMT , Wkg.customer_name,  Wkg.SERVICE_TYPE,  
             'fault' type FROM data1 d 
                join VM_EXCHANGE_CONTROL ex on ex.EXCHANGE = d.EXCHANGE_CODE      
                Join VM_WORKING_LINES Wkg on Wkg.Phone_No = d.Phone_NO            
Union

select a.sde EXNAME,a.sdecode , b.exchange_code,b.phone_no,b.mobile_no,b.OUTSTANDING_AMT,b.customer_name,  b.SERVICE_TYPE,  b.service_oper_status type
        from vm_working_lines b join vm_exchange_control a on a.exchange=b.exchange_code
        where 
        b.service_oper_status in ('OG barred - NP','Suspend - NP')
        and b.SERVICE_TYPE in ('Landline','Bharat Fiber Voice','Bharat Fiber BB')

        
         