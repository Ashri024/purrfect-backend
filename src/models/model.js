const mongoose = require("mongoose");
const validator= require("validator");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const schema= new mongoose.Schema({ 
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("invalid email id");
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:8
    },
    confirmPass:{
        type:String,
        required:true,
        minlength:8
    },
    phone:{
        type:Number,
        required:true,
        unique:true,
        minlength:10,
        maxlength:10
    }
});

const weatherSchema= new mongoose.Schema({
    weatherCode:{
        type:[Number],
        required:true
    },
    url:{
        type:String,
        required:true
    },
    dayIcon:{
        type:String,
        required:true
    },
    nightIcon:{
        type:String,
        required:true
    }
});

let expiry = Math.floor(Date.now() / 1000) + (60 * 60);
schema.methods.generateAuthToken= async function(){
    try{
        const token= jwt.sign({_id:this._id.toString(),exp:expiry},process.env.SECRET_KEY);
        return token;
    }
    catch(err){
        console.log(err);
    }
}

schema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10);
        // this.confirmPass=await bcrypt.hash(this.confirmPass,10);
    }
    next();
})
const Weather= new mongoose.model("WeatherImg",weatherSchema);
const Register= new mongoose.model("Register",schema);
module.exports={Register,Weather};