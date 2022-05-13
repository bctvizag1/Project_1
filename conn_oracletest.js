const oracledb = require('oracledb')
const config = {
  user: 'SYSTEM',
  password: 'dotsoft123',
  connectString: 'localhost:1521/xe'
}

async function getEmployee () {
  let conn

  try {
    conn = await oracledb.getConnection(config)

    const result = await conn.execute(
      `select b.service_sub_type,b.exchange_code, b.ORDER_NO ,b.PHONE_NO,trunc(b.ORDER_CREATED_DATE) ,trunc(b.indoor_comp_date),
trunc(b.order_comp_date),b.ORDER_TYPE,b.ORDER_SUB_TYPE,b.ORDER_STATUS,b.mobile_no,c.olt_ip,c.olt_owner,b.clarity_service_order,b.CUSTOMER_NAME 
from vm_exchange_control a, vm_orders b,vm_ftth_attributes1 c  where a.exchange=b.exchange_code and b.phone_no=c.phone(+) and b.service_type=c.service_type(+) and
b.order_status='Complete' and trunc(b.order_comp_date) between TO_DATE('2020/08/01', 'yyyy/mm/dd')  AND TO_DATE('2020/08/10', 'yyyy/mm/dd')
and b.order_type='New' and b.service_sub_type like 'Bharat Fiber%' order by b.service_sub_type `
    )

    console.log(result.rows[0])
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

getEmployee()