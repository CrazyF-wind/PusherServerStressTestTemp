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

        var token="fixedtoken";
        var email=process.pid.toString() + "_" + j.toString();
        var queryStry = "token="+token+"&&email="+email+"&&uniqueID="+email;
        socket = io.connect('http://tmyvitals.ihealthlabs.com.cn:3000', {
            transports: ['websocket'], query:queryStry,'force new connection': true
        });
        //socket.my_nick = process.pid.toString() + "_" + j.toString();



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
