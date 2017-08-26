var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var contentSchema = new Schema({
    //关联字段
    category: {
        //类型
        type: Schema.Types.ObjectId,
        //引用
        ref: 'category'
    },

    title: String,

    user: {
        //类型
        type: Schema.Types.ObjectId,
        //引用
        ref: 'user'
    },

    addTime: {
        type: Date,
        default: Date.now()
    },

    views: {
        type: Number,
        default: 0
    },

    description: {
        type: String,
        default: ''
    },

    content: {
        type: String,
        default: ''
    },

    //评论
    comments: {
        type: Array,
        default: []
    }
});

module.exports = mongoose.model('content', contentSchema);