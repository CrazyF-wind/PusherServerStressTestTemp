/**
 * Created by Administrator on 2016/10/8.
 */
var redis = require("redis"),
    client = redis.createClient();
var dbhelper = require('./dbtools/dbhelper.js');


function isEmptyObject(obj) {
    for (var key in obj) {
        return false;
    }
    return true;
}

var sessionid = "";
for (var i = 0; i < 90; i++) {
    for (var j = 0; j < 10; j++) {
        sessionid = "send|" + i + "|" + j
        console.log(sessionid);
        client.hgetall(sessionid, function (err, object) {
            //console.log(object+"|"+object["from"]);
            if (isEmptyObject(object)) {
                console.info('not exsit')
            } else {
                var opt = {
                    "from": object["from"],
                    "to": object["to"],
                    "message": object["message"],
                    "status": object["status"],
                    "sendtime": object["sendtime"],
                    "flag": object["flag"]
                }
                console.log(JSON.stringify(opt) + "|" + object);

                dbhelper.insertMongo('messageDetail', opt
                    , function () {
                        console.info('message received')
                    })
            }

        })
    }
}
