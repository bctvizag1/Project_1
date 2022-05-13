const oracledb = require('oracledb');
const dbConfig = require("../config/db.config.js");


const oracleDbRelease = function(conn) {
    conn.release(function (err) {
      if (err)
        console.log(err.message);
    });
  };
  
  function queryArray(sql, bindParams, options) {
      options.isAutoCommit = false; // we only do SELECTs
   
      return new Promise(function(resolve, reject) {
          oracledb.getConnection(dbConfig)
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
  
  function queryObject(sql, bindParams, options) {
      options['outFormat'] = oracledb.OBJECT; // default is oracledb.ARRAY
      return queryArray(sql, bindParams, options);
  }
  
  module.exports = queryArray; 
  module.exports.queryArray = queryArray; 
  module.exports.queryObject = queryObject;