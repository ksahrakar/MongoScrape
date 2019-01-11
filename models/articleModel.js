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
        unique:true
    },
    artUrl:{
        type:String,
        unique:true,
        unique:true
    },
    picUrl:{
        type:String,
        unique:true
    },
    artDate:{
        type:Date,
    },
    comments:[{
        type: Schema.Types.ObjectId,
        ref: "Comment",
        artID:this.artID
    }]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;