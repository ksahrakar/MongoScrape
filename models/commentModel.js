var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    body:{
        type:String,
        trim:true
    }
});

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;