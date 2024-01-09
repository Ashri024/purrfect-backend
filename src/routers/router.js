const express = require('express')
const app=express();
const router = express.Router();
const model= require("../models/model");
const path  = require("path");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const auth = require("../authentication/auth");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
router.use(cookieParser());
let expiry =1000*60*60;
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', `${process.env.FRONTEND_URL}}`);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.get('/',auth, (req, res) => {
    res.cookie("loggedIn", req.loggedIn, { maxAge: expiry,sameSite: 'none',  secure: true });
    res.cookie("email", req.email, { maxAge: expiry, sameSite: 'none',  secure: true});
    res.redirect(`${process.env.FRONTEND_URL}/`);
});

router.post('/signUp', async(req, res) => {
    try{
        if(req.body.password != req.body.confirmPass){
            console.log("passwords are not matching");
            return res.status(400).json({error:"Passwords are not matching"});
        }
        const user = new model({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPass: req.body.confirmPass,
        phone: req.body.phone
        });

        await user.save();
        res.redirect(`${process.env.BACKEND_URL}/login`);
}
catch(err){
    console.log(err);
    res.status(400).send(err);
}
});

router.get("/logout",auth,async(req,res)=>{
    try{
        res.clearCookie("loggedIn");
        res.clearCookie("jwt0");
        res.clearCookie("email");
        console.log("Logout successfully!!!");
        // await req.user.save();

        res.redirect(`${process.env.FRONTEND_URL}/`);
        }
        catch(err){
            console.log("Error: ", err);
            res.send(err);
        }
    
});
router.get("/logoutAll",auth,async(req,res)=>{
    try{
        //write the logoutAll functionality using crypto
        const newSecretKey = crypto.randomBytes(32).toString("hex");
        process.env.SECRET_KEY = newSecretKey;
        console.log("new Secret Key",newSecretKey);

        res.clearCookie("loggedIn");
        res.clearCookie("jwt0");
        res.clearCookie("email");
        console.log("Logout successfully from all devices!!!");
        // await req.user.save();
        res.redirect(`${process.env.FRONTEND_URL}/`);
        }
        catch(err){
            console.log("Error: ", err);
            res.send(err);
        }
});

router.post("/login",async(req,res)=>{
    console.log("Cookies:");
    try{
        const email=req.body.email;
        const password=req.body.password;
        const useremail=await model.findOne({email:email});
        const isMatch=await bcrypt.compare(password,useremail.password);
        if(isMatch){
            const token = await useremail.generateAuthToken();
            res.cookie("jwt0", token, { maxAge: expiry,sameSite: 'none',  secure: true });
            // console.log("")
            console.log("Token generated while login: ", token);
            res.redirect("/");
        }
        else{
            res.status(400).json({error:"invalid login details"});
        }
    }
    catch(err){
        res.status(400).send("invalid login details");
    }
});
module.exports = router;    