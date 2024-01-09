const model= require("../models/model");
const jwt = require('jsonwebtoken');

const auth= async(req,res,next)=>{
    try{
        console.log("Auth Cookies:",req.cookies);
        const token= req.cookies.jwt0;
        const verifyUser= jwt.verify(token,process.env.SECRET_KEY);
        console.log(verifyUser);
        const user= await model.findOne({_id:verifyUser._id});
        console.log("user mil gaya: ",user);
        req.email=user.email;
        req.loggedIn=true;
        next();
    }
    catch(err){
        console.log(err);
        res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
}
module.exports=auth;