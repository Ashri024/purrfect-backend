const mongoose = require("mongoose");
const validator= require("validator");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");


const cityHistorySchema = new mongoose.Schema({
    location:{
        type:String,
        required:true
    },
    lat:{
        type:Number,
        required:true
    },
    lon:{
        type:Number,
        required:true
    },
    current_temp:{
        type:Number,
        required:true
    },
    min:{
        type:Number,
        required:true
    },
    max:{
        type:Number,
        required:true
    },
    precipitation:{
        type:Number,
        required:true, 
    },
    humidity:{
        type:Number,
        required:true
    },
    icon:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    }
});
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
    phone: {
        type: String,
        required: true,
        unique: true,
        minlength: [10, 'Phone number is shorter than the expected length (10).'],
        maxlength: [10, 'Phone number is longer than the maximum allowed length (10).'],
        match: [/^[0-9]+$/, 'Phone number should only contain numeric characters.']
    },
    searchHistory:[cityHistorySchema]
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
    nighturl:{
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

// const CityHistory = new mongoose.model("CityHistory",cityHistorySchema);
const Weather= new mongoose.model("WeatherImg",weatherSchema);
const Register= new mongoose.model("Register",schema);
module.exports={Register,Weather};