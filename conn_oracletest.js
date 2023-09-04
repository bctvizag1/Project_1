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
      `select * from cdr.xyz; `
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