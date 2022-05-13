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
