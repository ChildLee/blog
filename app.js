var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Cookies = require('cookies');
var User = require('./model/user');

var app = express();
mongoose.Promise = global.Promise;

//设置静态文件目录
app.use('/public', express.static('./public'));
app.use(bodyParser.urlencoded({extended: true}));

//设置模板
app.set('views', './views');
app.set('view engine', 'ejs');
// app.set('view cache', true);//是否开启页面缓存,ejs默认关闭

app.use(function (req, res, next) {
    req.cookies = new Cookies(req, res);
    req.userInfo = {};
    if (req.cookies.get('userInfo')) {
        req.userInfo = JSON.parse(req.cookies.get('userInfo'));
        try {
            User.findById(req.userInfo._id).then(function (userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            });
        } catch (e) {
            next();
        }
    } else {
        next();
    }
});

//根据功能划分模块
app.use('/admin', require('./router/admin'));
app.use('/api', require('./router/api'));
app.use('/', require('./router/main'));

mongoose.connect('mongodb://localhost/blog', {useMongoClient: true}, function (err) {
    if (!err) {
        //监听80端口
        app.listen(80);
        console.log('http://127.0.0.1/');
    } else {
        console.log('数据库连接失败');
    }
});