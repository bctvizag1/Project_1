const oracledb = require('oracledb');
const dbConfig = require("../config/db.config.js");


const oracleDbRelease = function(conn) {
    conn.release(function (err) {
      if (err)
        console.log(err.message);
    });
  };
  
  function queryArray_orcl(sql, bindParams, options, conn) {
      options.isAutoCommit = false; // we only do SELECTs
   
    // console.log(conn, dbConfig[conn]);
      return new Promise(function(resolve, reject) {
          oracledb.getConnection(dbConfig[conn])
          .then(function(connection){
              //console.log("sql log: " + sql + " params " + bindParams);
              connection.execute(sql, bindParams, options)
              .then(function(results) {
                  resolve(results);
                  process.nextTick(function() {
                      oracleDbRelease(connection);
                  });
              })
              .catch(function(err) {
                  reject(err);
   
                  process.nextTick(function() {
                      oracleDbRelease(connection);
                          });
                      });
              })
              .catch(function(err) {
                  reject(err);
              });
      });
  }

  
  
  function queryObject(sql, bindParams, options, conn="orcl") {
      options['outFormat'] = oracledb.OBJECT; // default is oracledb.ARRAY
      
      return queryArray_orcl(sql, bindParams, options, conn);
  }


  
//module.exports = queryArray; 
module.exports.queryArray = queryArray_orcl; 
module.exports.queryObject = queryObject;