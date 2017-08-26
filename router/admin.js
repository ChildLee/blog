var express = require('express');
var router = express.Router();

var User = require('../model/user');
var Category = require('../model/category');
var Content = require('../model/content');

router.use(function (req, res, next) {
    if (!req.userInfo.isAdmin) {
        res.send('对不起,只有管理员才可以进入后台管理');
        return;
    }
    next();
});

router.get('/', function (req, res, next) {
    res.render('admin/index', {
        userInfo: req.userInfo
    });
});

router.get('/user', function (req, res, next) {
    var page = req.query.page || 1;
    var limit = 10;
    var pages = 0;
    User.count().then(function (count) {
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;

        User.find().limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                page: page,
                count: count,
                limit: limit,
                pages: pages,
                layout: 'user'
            });
        });
    });
});

router.get('/category', function (req, res, next) {
    var page = req.query.page || 1;
    var limit = 10;
    var pages = 0;
    Category.count().then(function (count) {
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;

        Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function (category) {
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                category: category,
                page: page,
                count: count,
                limit: limit,
                pages: pages,
                layout: 'category'
            });
        });
    });
});

router.get('/category/add', function (req, res, next) {
    res.render('admin/category_add', {
        userInfo: req.userInfo
    });
});

router.post('/category/add', function (req, res, next) {
    var name = req.body.name.trim() || '';
    if (name == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '名称不能为空!'
        });
        return;
    }
    Category.findOne({name: name}).then(function (rs) {
        if (rs) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类已经存在'
            });
            return Promise.reject();
        } else {
            return new Category({name: name}).save();
        }
    }).then(function (newCategory) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类保存成功',
            url: '/admin/category'
        });
    }).catch(function (err) {

    });
});

router.get('/category/edit', function (req, res) {
    var id = req.query.id.trim() || '';
    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在!'
            });
        } else {
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category
            });
        }
    });
});

router.post('/category/edit', function (req, res) {
    var id = req.query.id.trim() || '';
    var name = req.body.name.trim() || '';
    if (name == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '名称不能为空!'
        });
        return;
    }
    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在!'
            });
            return Promise.reject();
        } else {
            if (name == category.name) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '修改成功!',
                    url: '/admin/category'
                });
                return Promise.reject();
            } else {
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                })
            }
        }
    }).then(function (sameCategory) {
        if (sameCategory) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '数据库中已经存在同名分类!'
            });
            return Promise.reject();
        } else {
            return Category.update({
                _id: id
            }, {
                name: name
            })
        }
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '修改成功!',
            url: '/admin/category'
        });
    }).catch(function () {
    });
});

router.get('/category/delete', function (req, res) {
    var id = req.query.id || '';
    Category.remove({
        _id: id
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功!',
            url: '/admin/category'
        });
    });

});
/**
 * 内容首页
 */
router.get('/content', function (req, res) {
    var page = req.query.page || 1;
    var limit = 10;
    var pages = 0;
    Content.count().then(function (count) {
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;

        Content.find().sort({_id: -1}).limit(limit).skip(skip).populate(['category', 'user']).then(function (content) {
            res.render('admin/content_index', {
                moment: require("moment"),
                userInfo: req.userInfo,
                content: content,
                page: page,
                count: count,
                limit: limit,
                pages: pages,
                layout: 'content'
            });
        });
    });
});

router.get('/content/add', function (req, res) {
    Category.find().sort({_id: -1}).then(function (category) {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            category: category
        })
    });
});

router.post('/content/add', function (req, res) {
    if (req.body.category == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        });
        return;
    }
    if (req.body.title == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        });
        return;
    }

    var content = new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userInfo._id,
        description: req.body.description,
        content: req.body.content
    });

    content.save().then(function (rs) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content'
        });
    });
});

router.get('/content/edit', function (req, res) {
    var id = req.query.id || '';
    var category = {};
    Category.find().sort({_id: -1}).then(function (rs) {
        category = rs;
        return Content.findOne({'_id': id}).populate('category');
    }).then(function (content) {
        if (!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '指定内容不存在'
            });
            return Promise.reject();
        } else {
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                category: category,
                content: content
            });
        }
    });
});

router.post('/content/edit', function (req, res) {
    var id = req.query.id || '';
    if (req.body.category == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        });
        return;
    }
    if (req.body.title == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        });
        return;
    }

    Content.update({_id: id}, {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function (rs) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content/edit?id=' + id
        });
    })
});

router.get('/content/delete', function (req, res) {
    var id = req.query.id || '';
    Content.remove({
        _id: id
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功!',
            url: '/admin/content'
        });
    });
});

module.exports = router;