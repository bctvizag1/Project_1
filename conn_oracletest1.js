const oracledb = require('oracledb')
const config = {
  user: 'cdrvm',
  password: 'cdrvm123',
  connectString: '10.196.215.54:1521/rptsrvr'
}

async function getEmployee () {
  let conn

  try {
    conn = await oracledb.getConnection(config)

    // `select * from cdr.xyz`

    /*
    select 1 ORD,a.sde SDE,count(1) from vm_exchange_control a, system.vm_cdr_faults1 b  where a.exchange=b.exchange_code and b.ssa='VISAKHAPATNAM' and b.comp_sub_type not like 'BB%' and b.comp_status='Open'   group by a.sde

    select * from cdr.ftth_faults where ssa='VISAKHAPATNAM'  and rownum<=10

    select * from cdr.cdr_faults where ssa='VISAKHAPATNAM' and comp_status='Open' 
    */

    const result = await conn.execute(
      `select count(*) from cdr.cdr_faults where ssa='VISAKHAPATNAM' and comp_status='Open'`
    )

    console.log(result)
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

getEmployee()