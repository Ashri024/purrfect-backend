const express = require('express')
const app=express();
const router = express.Router();
const {Register:model, Weather}= require("../models/model");
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

router.post("/weatherImg",async(req,res)=>{
    try{
        let obj=[
            {
              "weatherCode":[0],
              "url": "https://f005.backblazeb2.com/file/WeatherApp/brightDay.jpg",
              "dayIcon":"https://f005.backblazeb2.com/file/WeatherApp/DayIcons/clear.svg",
              "nightIcon":"https://f005.backblazeb2.com/file/WeatherApp/NightIcons/clear.svg"
            },
             {
              "weatherCode":[1,2,3],
              "url": "https://f005.backblazeb2.com/file/WeatherApp/cloudy.png",
                "dayIcon":"https://f005.backblazeb2.com/file/WeatherApp/DayIcons/cloudy.svg",
                "nightIcon":"https://f005.backblazeb2.com/file/WeatherApp/NightIcons/cloudy.svg"
            },
            {
              "weatherCode":[45,48],
              "url": "https://f005.backblazeb2.com/file/WeatherApp/fog.png",
                "dayIcon":"https://f005.backblazeb2.com/file/WeatherApp/DayIcons/fog.svg",
                "nightIcon":"https://f005.backblazeb2.com/file/WeatherApp/NightIcons/fog.svg"
            },
            {
              "weatherCode":[51,53,55],
              "url": "https://f005.backblazeb2.com/file/WeatherApp/drizzle.png",
                "dayIcon":"https://f005.backblazeb2.com/file/WeatherApp/DayIcons/drizzle.svg",
                "nightIcon":"https://f005.backblazeb2.com/file/WeatherApp/NightIcons/drizzle.svg"
            },
            {
              "weatherCode":[56,57,66,67],
              "url": "https://f005.backblazeb2.com/file/WeatherApp/freezingRain.png",
                "dayIcon":"https://f005.backblazeb2.com/file/WeatherApp/DayIcons/freezingRain.svg",
                "nightIcon":"https://f005.backblazeb2.com/file/WeatherApp/NightIcons/freezingRain.svg"
            },
            {
              "weatherCode":[61,63,65,80,81,82],
              "url": "https://f005.backblazeb2.com/file/WeatherApp/rain.png",
                "dayIcon":"https://f005.backblazeb2.com/file/WeatherApp/DayIcons/rain.svg",
                "nightIcon":"https://f005.backblazeb2.com/file/WeatherApp/NightIcons/rain.svg"
            },
            {
              "weatherCode":[71,73,75,77,85,86],
              "url": "https://f005.backblazeb2.com/file/WeatherApp/snowy.jpg",
                "dayIcon":"https://f005.backblazeb2.com/file/WeatherApp/DayIcons/snow.svg",
                "nightIcon":"https://f005.backblazeb2.com/file/WeatherApp/NightIcons/snow.svg"
            },
            {
              "weatherCode":[95,96,99],
              "url": "https://f005.backblazeb2.com/file/WeatherApp/thunder2.png",
                "dayIcon":"https://f005.backblazeb2.com/file/WeatherApp/DayIcons/thunder.svg",
                "nightIcon":"https://f005.backblazeb2.com/file/WeatherApp/NightIcons/thunder.svg"
            }
            ]
            
        for(let i=0;i<req.body.length;i++){
        const weather = new Weather({
            weatherCode:req.body[i].weatherCode,
            url:req.body[i].url,
            dayIcon:req.body[i].dayIcon,
            nightIcon:req.body[i].nightIcon
        });
        await weather.save();
    }
        res.json({status:true});
    }
    catch(err){
        console.log(err);
        res.status(400).send(err);
    }
});

function weatherDescriptionFunc(code) {
    const descriptions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog and depositing rime fog",
        48: "Fog and depositing rime fog",
        51: "Drizzle: Light intensity",
        52: "Drizzle: Moderate intensity",
        53: "Drizzle: Dense intensity",
        56: "Freezing Drizzle: Light intensity",
        57: "Freezing Drizzle: Dense intensity",
        61: "Rain: Slight intensity",
        63: "Rain: Moderate intensity",
        65: "Rain: Heavy intensity",
        66: "Freezing Rain: Light intensity",
        67: "Freezing Rain: Heavy intensity",
        71: "Snow fall: Slight intensity",
        73: "Snow fall: Moderate intensity",
        75: "Snow fall: Heavy intensity",
        77: "Snow grains",
        80: "Rain showers: Slight intensity",
        81: "Rain showers: Moderate intensity",
        82: "Rain showers: Heavy intensity",
        85: "Snow showers: Slight intensity",
        86: "Snow showers: Heavy intensity",
        95: "Thunderstorm: Slight or moderate",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail",
    };

    return descriptions[code] || "Unknown Weather Status";
}

router.get("/weather",async(req,res)=>{
    console.log("request parameters: ",req.query);
    let lat= req.query.lat;
    let lon= req.query.lon;
    let currentWeather=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m&hourly=visibility&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=1`;

    let airQuality=`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5&current=european_aqi`;
    // let weatherCodeInterpreter=`https://gist.githubusercontent.com/stellasphere/9490c195ed2b53c707087c8c2db4ec0c/raw/76b0cb0ef0bfd8a2ec988aa54e30ecd1b483495d/descriptions.json`;
    
    console.log("Fetching data");
    Promise.all([
        fetch(currentWeather).then(res => res.json()),
        fetch(airQuality).then(res => res.json())
        ]).then(async([WeatherData, AirQuality]) => {
        console.log("current weather: ", WeatherData);
        console.log("air quality: ", AirQuality);
        let weather_code = WeatherData.current.weather_code;
        let is_day = WeatherData.current.is_day;
        console.log("weather code: ", weather_code);
        // let weatherImg = await Weather.findOne({weatherCode: { $in: weather_code } });
        
            Weather.findOne({weatherCode: { $in: weather_code } }).then((weatherImg)=>{
                let weatherDescription =weatherDescriptionFunc(weather_code);
                if(is_day){
                    weatherImg={
                        url:weatherImg.url,
                        icon:weatherImg.dayIcon
                    }
                    weatherDescription= {
                     is_day:"Day",
                     desc:weatherDescription
                    }
                    res.json({WeatherData, AirQuality, weatherImg,weatherDescription});
                }else{

                    weatherImg={
                        url:weatherImg.url,
                        icon:weatherImg.nightIcon
                    }
                    weatherDescription= {
                        is_day:"Night",
                        desc:weatherDescription
                    }
                    res.json({WeatherData, AirQuality, weatherImg,weatherDescription});
                }
            });
    });

    // res.json({lat,lon});
});
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


router.get("/mega",(req,res)=>{
    res.render("mega");
})
module.exports = router;    
