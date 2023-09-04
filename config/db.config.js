const itpc = {
    user: 'cdrvm',
    password: 'cdrvm123',
    connectString: '10.196.215.54:1521/rptsrvr'
}

const orcl = {
  user: 'SYSTEM',
  password: 'dotsoft123',
  connectString: 'localhost:1521/xe'
}


module.exports.itpc = itpc
module.exports.orcl = orcl


/*
module.exports = {
    user: 'SYSTEM',
    password: 'dotsoft123',
    connectString: 'localhost:1521/xe'
  };

module.exports = {
    user: 'cdrvm',
    password: 'cdrvm123',
    connectString: '10.196.215.54:1521/rptsrvr'
  };
*/