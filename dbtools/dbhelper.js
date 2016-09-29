/**
 * Created by Administrator on 2016/9/28.
 */
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = "mongodb://127.0.0.1:27017/PushStressTest";

exports.init = DB_CONN_STR;

/**
 * 通用，新增操作
 * @param tablename 操作表名
 * @param args  插入内容
 * @callback 返回结果
 */
exports.insertMongo = function(tablename, args, callback) {
    var insertdata = function(db, callback) {
        //连接到表
        var collection = db.collection(tablename);
        //插入数据
        collection.insert(args, function(err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback("ok");
        });
    }
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        insertdata(db, function(result) {
            console.log("insert MongoDB:" + JSON.stringify(result));
            callback(result);
            db.close();
        });
    });
}

/**
 * 通用，删除操作
 * @param tablename 操作表名
 * @param args  查询条件
 * @callback 返回结果
 */
exports.delMongo = function(tablename, args, callback) {
    var delData = function(db, callback) {
        //连接到表
        var collection = db.collection(tablename);
        //删除数据
        collection.remove(args, function(err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback('ok');
        });
    };
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        delData(db, function(result) {
            console.log("del MongoDB:" + JSON.stringify(result));
            callback(result);
            db.close();
        });
    });
}

/**
 * 通用，修改操作
 * @param tablename 操作表名
 * @param where 查询条件，格式：{name: 'defaulthandle'}
 * @param sets  修改内容，格式：{$set: {value: data}}
 *  @callback 返回结果
 */
exports.updataMongo = function(tablename, where, sets, callback) {
    var editdata = function(db, callback) {
        //连接到表
        var collection = db.collection(tablename);
        //查询数据
        collection.update(where, sets, function(err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback('ok');
        });
    }
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        editdata(db, function(result) {
            console.log("updata MongoDB:" + JSON.stringify(result));
            callback(result);
            db.close();
        });
    });
}

/**
 * 通用，修改操作
 * @param tablename 操作表名
 * @param where 查询条件，格式：{name: 'defaulthandle'}
 * @param sets  修改内容，格式：{$set: {value: data}}
 * @param option upsert: <boolean>,multi: <boolean>,writeConcern: <document>
 * @callback 返回结果
 */
exports.updateMongoWithOption = function(tablename, where, sets, option, callback) {

    var editdata = function(db, callback) {
        //连接到表
        var collection = db.collection(tablename);
        //查询数据
        collection.update(where, sets, option, function(err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback('ok');
        });
    }
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        editdata(db, function(result) {
            console.log("updata MongoDB:" + JSON.stringify(result));
            callback(result);
            db.close();
        });
    });
}


/**
 * 通用，查询操作
 * @param tablename 操作表名
 * @param args  查询条件
 * @param params 精确匹配
 * @callback 返回结果
 */
exports.selectMongo = function(tablename, args, params, callback) {
    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection(tablename);
        //查询数据
        collection.find(args, params).toArray(function(err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback(result);
        });
    }
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        selectData(db, function(result) {
            console.log("select MongoDB:" + JSON.stringify(result));
            callback(result);
            db.close();
        });
    });
}

/**
 * 查询表中不同的字段
 * @param tablename 表名
 * @param args 查询字段
 * @param callback 返回值
 */
exports.selectdistinctMongo = function(tablename, args, callback) {
    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection(tablename);
        //查询数据
        collection.distinct(args, function(err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback(result);
        });
    }
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        selectData(db, function(result) {
            console.log("select distinct MongoDB:" + JSON.stringify(result));
            callback(result);
            db.close();
        });
    });
}
