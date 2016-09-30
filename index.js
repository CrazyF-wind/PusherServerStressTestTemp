console.info("Socket.io chat test client");
io = require('socket.io-client');
var dbhelper = require('./dbtools/dbhelper.js');

for (var socket_n = 0; socket_n < 500; socket_n++) {

    (function () {

        var j = socket_n;

        var token="fixedtoken";
        var email=process.pid.toString() + "_" + j.toString();
        var queryStry = "token="+token+"&&email="+email+"&&uniqueID="+email;
        socket = io.connect('http://tmyvitals.ihealthlabs.com.cn:3000', {
            transports: ['websocket'], query:queryStry,'force new connection': true
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
                var timers=setInterval(function () {
                    var index = Math.round(Math.random() * 499);
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
                            'flag':"1000"
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

                //var begintime=new Date().getTime();
                ////console.info("times:"+(new Date().getTime()-begintime));
                //if((new Date().getTime()-begintime)>10000)
                //{
                //    console.info("times-in:"+(new Date().getTime()-begintime));
                //    clearInterval(timers);
                //}
            });


        })();

        socket.on('receiveMessage', function (msg) {
            if (Object.prototype.toString.call(msg) === '[object Array]') {
                //notifyMe(msg.user,msg.comment);
                for (var i = 0; i < msg.length; i++) {
                    readMessage(msg[i]);
                }
            } else {
                readMessage(msg);
            }
        });

        function readMessage(msg) {
            console.info(msg);
            //收到更新消息后更新消息收到标志位
            dbhelper.updateMongoWithOption('messageDetail', {
                'from': msg.from,
                'to': msg.to,
                //'sendtime': msg.sendDate,
                'message': msg.message
            }, {
                $set: {
                    'status': 'received',
                    'receivetime': new Date()
                }
            }, {
                upsert: true
            }, function () {
                console.info('message received')
            })
            //统计消息存入数据库
            dbhelper.updateMongoWithOption('messageStatistics', {
                'from': msg.from,
                'to': msg.to
            }, {
                $inc: {
                    'received': 1
                }
            }, {
                upsert: true
            }, function () {
                console.info('receivedStatistics saved')
            })
            //console.info(msg.from + " said at " + msg.sendDate + " : " + msg.message);

            //var args={
            //
            //};

            //插入测试结果
            //dbhelper.insertMongo('testrecord', args, function (result) {
            //    if (result === "ok") {
            //        console.log("websocket新增记录成功！");
            //    }
            //    else {
            //        console.log("websocket新增记录失败，原因：" + JSON.stringify(result));
            //    }
            //});
        }

        socket.on('disconnect', function () {
            console.info("Disconnected");
        });
    })();
}
