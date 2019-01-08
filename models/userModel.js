var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username:{
        type:String,
        trim:true
    },
    password:{
        type:String,
        trim:true,
        required:"password is required"
    },
    email:{
        type:String,
        unique:true
    },
    articles:[{
        type: Schema.Types.ObjectId,
        ref:"Article"
    }]
});

var User = mongoose.model("User", UserSchema);

module.exports = User;