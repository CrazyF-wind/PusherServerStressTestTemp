console.info("Socket.io chat test client");
io = require('socket.io-client');
//var dbhelper = require('andon-mongodb-helper');

for (var socket_n = 0; socket_n < 20; socket_n++) {

    (function () {

        var j = socket_n;
        socket = io.connect('http://tmyvitals.ihealthlabs.com.cn:3000', {'force new connection': true});
        socket.my_nick = process.pid.toString() + "_" + j.toString();

        (function () {
            var inner_socket = socket;
            inner_socket.on('connect', function () {
                console.info("Connected[" + j + "] => " + inner_socket.my_nick);
                inner_socket.emit('authenticate', {token: "fixedtoken", email: inner_socket.my_nick});
            });

            inner_socket.on('authenticated', function () {
                var interval = Math.floor(Math.random() * 10001) + 5000;
                setInterval(function () {
                    var index = Math.round(Math.random() * 21);
                    var toUser = process.pid.toString() + "_" + index.toString();
                    inner_socket.emit('sendMessage', {
                        from: inner_socket.my_nick,
                        to: toUser,
                        message: "Regular timer message every " + interval + " ms"
                    });

                    var sendtime = new Date();
                    console.info("sendtime:" + sendtime.getUTCFullYear() + "-" + (sendtime.getUTCMonth() + 1) + "-" + sendtime.getDate()
                        + " " + sendtime.getUTCHours() + ":" + sendtime.getUTCMinutes() + ":" + sendtime.getUTCSeconds());
                }, interval);
            });
        })();

        socket.on('receiveMessage', function (msg) {
            if (Object.prototype.toString.call(msg) === '[object Array]') {
                //notifyMe(msg.user,msg.comment);
                for (var i = 0; i < msg.length; i++) {
                    readMessage(msg[i]);
                }
            }
            else {
                readMessage(msg);
            }
        });

        function readMessage(msg) {
            console.info(msg.from + " said at " + msg.sendDate + " : " + msg.message);

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