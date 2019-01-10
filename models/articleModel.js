var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    artID:{
        type:String,
        trim:true,
        unique:true
    },
    artTitle:{
        type:String,
        trim:true,
    },
    artUrl:{
        type:String,
        unique:true
    },
    picUrl:{
        type:String,
    },
    artDate:{
        type:Date,
    },
    comments:[{
        type: Schema.Types.ObjectId,
        ref: "User",
        content:String
    }]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;