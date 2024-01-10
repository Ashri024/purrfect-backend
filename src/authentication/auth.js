const model= require("../models/model");
const jwt = require('jsonwebtoken');

const auth= async(req,res,next)=>{
    try{
        console.log("Auth Cookies:",req.cookies.jwt0);
        const token= req.cookies.jwt0;
        jwt.verify(token,process.env.SECRET_KEY);
        next();
    }
    catch(err){
        console.log(err);
        res.clearCookie("jwt0");
        res.clearCookie("loggedIn");
        res.clearCookie("email");
        res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
}
module.exports=auth;