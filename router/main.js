var express = require('express');
var router = express.Router();
var Category = require('../model/category');
var Content = require('../model/content');

var data;
router.use(function (req, res, next) {
    data = {
        markdown: require("markdown").markdown,
        moment: require("moment"),
        userInfo: req.userInfo,
        category: []
    };
    Category.find().sort({_id: -1}).then(function (category) {
        data.category = category;
        next();
    })
});

/**
 * 首页
 */
router.get('/', function (req, res, next) {
    data.categoryid = req.query.categoryid || '';
    data.count = 0;
    data.page = Number(req.query.page || 1);
    data.limit = 10;
    data.pages = 0;
    var where = {};
    if (data.categoryid) {
        where.category = data.categoryid;
    }

    Content.where(where).count()
        .then(function (count) {
            data.count = count;
            data.pages = Math.ceil(data.count / data.limit);
            data.page = Math.min(data.page, data.pages);
            data.page = Math.max(data.page, 1);
            var skip = (data.page - 1) * data.limit;

            return Content.where(where).find().sort({_id: -1}).limit(data.limit).skip(skip).populate(['category', 'user']);
        }).then(function (contents) {
        data.contents = contents;
        data.layout = 'index';
        res.render('main/layout', data);
    });
});

router.get('/view', function (req, res) {
    var contentId = req.query.contentid || '';
    data.categoryid = req.query.categoryid || '';
    Content.findOne({_id: contentId}).populate(['category', 'user'])
        .then(function (content) {
            data.content = content;
            content.views++;
            content.save();
            data.layout = 'view';
            res.render('main/layout', data);
        });
});

module.exports = router;