console.info("Socket.io chat test client");
io = require('socket.io-client');
var _ = require('lodash');
var dbhelper = require('./dbtools/dbhelper.js');
// var redis = require("redis"),
//     client = redis.createClient();

//并发总数
var totalNum = 20;
for (var socket_n = 0; socket_n < totalNum; socket_n++) {
    // console.log(socket_n);
    createClientSendMessage(socket_n);
}
//出队
outqueue();

function createClientSendMessage(socket_n) {
    var j = socket_n;

    var token = "fixedtoken";
    var email = process.pid.toString() + "_" + j.toString();
    var queryStry = "token=" + token + "&&email=" + email + "&&uniqueID=" + email;
    socket = io.connect('http://tmyvitals.ihealthlabs.com.cn:3000', {
        transports: ['websocket'],
        query: queryStry,
        'force new connection': true
    });
    //console.log(socket);
    socket.my_nick = process.pid.toString() + "_" + j.toString();

    sendMessage(j);
    socket.on('receiveMessage', function(msg) {
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
        // console.info(msg);
        inqueue(msg, false);

    }
    //设置断开这个socket的超时时间
    setTimeout(function() {
        socket.disconnect();
        socket.destroy();
        console.log('disconnect', email);
    }, 60000)
    socket.on('disconnect', function() {
        // console.info("Disconnected");
    });
}

function sendMessage(j) {
    // console.log(j)
    var inner_socket = socket;
    inner_socket.on('connect', function() {
        console.info("Connected[" + j + "] => " + inner_socket.my_nick);
        inner_socket.emit('authenticate', {
            token: "fixedtoken",
            email: inner_socket.my_nick
        });
    });

    // var startTime = new Date().getTime();
    // var interval = Math.floor(Math.random() * 10001) + 5000;
    // var timers = setInterval(function() {
    //     var lefttime = new Date().getTime() - startTime;
    //     console.log('lefttime', lefttime);
    //     if (lefttime > 10000) {
    //         clearInterval(timers);
    //         return;
    //     }
    //
    // }, interval);
    inner_socket.on('authenticated', function() {
        var startTime = new Date().getTime();
        var interval = Math.floor(Math.random() * 10001) + 5000;
        var timers = setInterval(function() {
            var lefttime = new Date().getTime() - startTime;
            console.log('lefttime', lefttime);
            if (lefttime > 60000) {
                clearInterval(timers);
                console.log('clearInterval');
                return;
            }
            var index = Math.round(Math.random() * (totalNum - 1));
            var toUser = process.pid.toString() + "_" + index.toString();
            var msg = {
                from: inner_socket.my_nick,
                to: toUser,
                message: "Regular timer message every " + interval + " ms dt:" +
                    new Date().getTime() + " redom:" + Math.random() + ""
            }
            inner_socket.emit('sendMessage', msg);

            var sendtime = new Date();
            //入队
            inqueue(msg, true);

        }, interval);
    });
}

var queue = new Array();
//入队函数
function inqueue(msg, issend) {
    if (issend) {
        var quemsg = _.extend(msg, {
            status: 'send'
        });
    } else {
        var quemsg = _.extend(msg, {
            status: 'receive'
        });
    }

    var count = queue.unshift(quemsg);
    console.log('inqueue', count);
}
//出队函数
function outqueue() {
    setInterval(function() {
        var msg = queue.pop();
        //console.log('outqueue', msg);
        if (msg) {
            // console.log(msg);
            if (msg.status == 'send') {
                //详细消息存入数据库
                //insert改为upsert保证记录完整
                dbhelper.updateMongoWithOption('messageDetail', msg, {
                        $set: {
                            'status': 'send',
                            'sendtime': new Date(),
                            // 'message': msg.message
                        }
                    }, {
                        upsert: true
                    }, function() {
                        console.info('sendmessage saved')
                    })
                    //统计消息存入数据库
                dbhelper.updateMongoWithOption('messageStatistics', {
                    'from': msg.from,
                    'to': msg.to
                }, {
                    $inc: {
                        'send': 1
                    }
                }, {
                    upsert: true
                }, function() {
                    // console.info('sendStatistics saved')
                })
            } else {
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
                    }, function() {
                        console.info('receivemessage saved')
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
                    }, function() {
                        // console.info('receivedStatistics saved')
                    })
                    // console.info(msg.from + " said at " + msg.sendDate + " : " + msg.message);
            }

        }

    }, 100)
}
