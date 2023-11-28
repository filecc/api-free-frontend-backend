const fs = require("fs");
const path = require("path");


module.exports = function (err, req, res, next) {
    
    res.json({
        error: err.message,
        code: err.statusCode,
        messages: err.array ? err.array.map((error) => {
            return {
                field: error.path,
                message: error.msg
            }
        }) : 'No other info.'
    })
    return
  
    
};