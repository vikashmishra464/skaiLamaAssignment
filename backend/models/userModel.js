const mongoose=require("mongoose");

const userSchema=mongoose.Schema({
    profile_name:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('User', userSchema);
