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
router.use(cors());

router.use(cookieParser());
let expiry =1000*60*60;

router.post("/login", async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password.toString();
        console.log("request body: ",req.body);
        const useremail = await model.findOne({email: email});
        console.log("user found: ",useremail);

        const isMatch = await bcrypt.compare(password, useremail.password);
        if(isMatch){
            const token = await useremail.generateAuthToken();
            console.log("Token generated while login: ", token);
            //print the cookies 
            res.json({email:useremail.email, loggedIn:isMatch, token});
        }else{
            res.status(404).json({error:"invalid password"});
        }
    } catch (error) {
        console.log(error)
        res.status(404).send("email not found");
    }

});


router.post('/signUp', async(req, res) => {
    console.log("sign Up page");
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
        res.json({status:true});
}
catch(err){
    console.log(err);
    res.status(400).send(err);
}
});

//Zaruat nhi hai iski
router.get("/logout",async(req,res)=>{
    try{
        console.log(req.cookies.jwt0)
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

router.get("/logoutAll",async(req,res)=>{
    try{
        //write the logoutAll functionality using crypto
        const newSecretKey = crypto.randomBytes(32).toString("hex");
        process.env.SECRET_KEY = newSecretKey;
        console.log("new Secret Key",newSecretKey);

        console.log("Logout successfully from all devices!!!");
        res.send({status:true});
        }
        catch(err){
            console.log("Error: ", err);
            res.send(err);
        }
});


module.exports = router;    
