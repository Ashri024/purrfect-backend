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
const cors = require("cors");
// app.use(cors());
router.use(cookieParser());
let expiry =1000*60*60;

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL); // replace with your origin
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

router.get('/',auth, (req, res) => {
    console.log("the cors url: ",process.env.FRONTEND_URL);
    console.log("the cors url: ",process.env.FRONTEND_URL);
    console.log("Auth ke baad: ",req.email);
    console.log("Auth ke baad: ",req.loggedIn);
    res.cookie("email", req.email, { sameSite: 'None', secure: true });
    res.cookie("loggedIn", req.loggedIn, { sameSite: 'None', secure: true });
    res.redirect(`${process.env.FRONTEND_URL}/`);
});

router.post("/login",async(req,res)=>{
    console.log("Hi u reached here");
    try{
        const email=req.body.email;
        const password=req.body.password;
        const useremail=await model.findOne({email:email});
        const isMatch=await bcrypt.compare(password,useremail.password);
        if(isMatch){
            const token = await useremail.generateAuthToken();
            console.log("Token generated while login: ", token);
            res.cookie("jwt0", token, { sameSite: 'None', secure: true });
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


module.exports = router;    
