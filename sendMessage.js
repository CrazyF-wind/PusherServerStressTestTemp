/**
 * Created by Administrator on 2016/9/30.
 */
console.info("Socket.io chat test client");
io = require('socket.io-client');
var dbhelper = require('./dbtools/dbhelper.js');

//并发总数
var totalNum = 20;
for (var socket_n = 0; socket_n < totalNum; socket_n++) {

    (function () {

        var j = socket_n;

        var token = "fixedtoken";
        var email = process.pid.toString() + "_" + j.toString();
        var queryStry = "token=" + token + "&&email=" + email + "&&uniqueID=" + email;
        socket = io.connect('http://tmyvitals.ihealthlabs.com.cn:3000', {
            transports: ['websocket'], query: queryStry, 'force new connection': true
        });
        socket.my_nick = process.pid.toString() + "_" + j.toString();

        (function () {
            var inner_socket = socket;
            inner_socket.on('connect', function () {
                console.info("Connected[" + j + "] => " + inner_socket.my_nick);
                inner_socket.emit('authenticate', {
                    token: "fixedtoken",
                    email: inner_socket.my_nick
                });
            });

            inner_socket.on('authenticated', function () {
                var interval = Math.floor(Math.random() * 10001) + 5000;
                var timers = setInterval(function () {
                    var index = Math.round(Math.random() * (totalNum-1));
                    var toUser = process.pid.toString() + "_" + index.toString();
                    inner_socket.emit('sendMessage', {
                        from: inner_socket.my_nick,
                        to: toUser,
                        message: "Regular timer message every " + interval + " ms"
                    });

                    var sendtime = new Date();
                    //详细消息存入数据库
                    var args = {
                        'from': inner_socket.my_nick,
                        'to': toUser,
                        'message': "Regular timer message every " + interval + " ms"
                    }
                    //dbhelper.insertMongo('messageDetail', args, function() {
                    //    console.info("sendtime:" + sendtime.getUTCFullYear() + "-" + (sendtime.getUTCMonth() + 1) + "-" + sendtime.getDate() +
                    //        " " + sendtime.getUTCHours() + ":" + sendtime.getUTCMinutes() + ":" + sendtime.getUTCSeconds() + "...saved.");
                    //});
                    //insert改为upsert保证记录完整
                    dbhelper.updateMongoWithOption('messageDetail', args, {
                        $set: {
                            'status': 'send',
                            'sendtime': sendtime,
                            'flag': "1000"
                        }
                    }, {
                        upsert: true
                    }, function () {
                        console.info('message received')
                    })

                    //统计消息存入数据库
                    dbhelper.updateMongoWithOption('messageStatistics', {
                        'from': inner_socket.my_nick,
                        'to': toUser
                    }, {
                        $inc: {
                            'send': 1
                        }
                    }, {
                        upsert: true
                    }, function () {
                        console.info('sendStatistics saved')
                    })
                    // console.info("sendtime:" + sendtime.getUTCFullYear() + "-" + (sendtime.getUTCMonth() + 1) + "-" + sendtime.getDate()
                    //     + " " + sendtime.getUTCHours() + ":" + sendtime.getUTCMinutes() + ":" + sendtime.getUTCSeconds());


                }, interval);

            });


        })();


        socket.on('disconnect', function () {
            console.info("Disconnected");
        });
    })();
}
