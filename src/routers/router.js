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
        51: "Drizzle: Light",
        52: "Drizzle: Moderate",
        53: "Drizzle: Dense",
        56: "Freezing Drizzle: Light",
        57: "Freezing Drizzle: Dense",
        61: "Rain: Slight",
        63: "Rain: Moderate",
        65: "Rain: Heavy",
        66: "Freezing Rain: Light",
        67: "Freezing Rain: Heavy",
        71: "Snow fall: Slight",
        73: "Snow fall: Moderate",
        75: "Snow fall: Heavy",
        77: "Snow grains",
        80: "Rain showers: Slight",
        81: "Rain showers: Moderate",
        82: "Rain showers: Heavy",
        85: "Snow showers: Slight",
        86: "Snow showers: Heavy",
        95: "Thunderstorm: Slight or moderate",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail",
    };

    return descriptions[code] || "Unknown Weather Status";
}

router.get("/weather",async(req,res)=>{
    try {
        
    let lat= req.query.lat;
    let lon= req.query.lon;
    console.log("Backend Lat: ", lat);
    console.log("Backend Lon: ", lon);
    let currentWeather=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m&hourly=temperature_2m,weather_code,visibility&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=1`;

    let airQuality=`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5&current=european_aqi`;
    
    Promise.all([
        fetch(currentWeather).then(res => res.json()),
        fetch(airQuality).then(res => res.json())
        ]).then(async([WeatherData, AirQuality]) => {
        let weather_code = WeatherData.current.weather_code;
        let is_day = WeatherData.current.is_day;
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
} catch (error) {
        res.status(404).json({error:"Something went wrong"});
}
});
router.get("/forecast",async(req,res)=>{
    let forecast_days=req.query.forecast_days;
    let lat= req.query.lat;
    let lon= req.query.lon;
    
    let sevenDaysWeather=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=14`;
    fetch(sevenDaysWeather).then(res => res.json())
    .then(async(sevenDaysWeatherData)=>{
        // console.log("Data fetched for forecast: ",sevenDaysWeatherData);
        const dayArrayPromises = sevenDaysWeatherData.daily.time.map(async(dateString,i) => {
            let dateObj;
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayNo = new Date(dateString).getDay();
            let weather_code = sevenDaysWeatherData.daily.weather_code[i];
            let weatherDescription =weatherDescriptionFunc(weather_code);
            let temperature_max=sevenDaysWeatherData.daily.temperature_2m_max[i];
            let temperature_min=sevenDaysWeatherData.daily.temperature_2m_min[i];
            let weatherImgField =await Weather.findOne({weatherCode: { $in: weather_code } });
            let weatherImg = weatherImgField.dayIcon;

            dateObj = {
                day: days[dayNo],
                date: dateString,
                weatherDescription:weatherDescription,
                temperature_max:temperature_max,
                temperature_min:temperature_min,
                weatherIcon:weatherImg
            };
            return dateObj;
        })

        const dayArray = await Promise.all(dayArrayPromises);
        res.json({forecastArray:dayArray});
    });
});

router.get("/hourlyForecast",async(req,res)=>{
    let three_hour=[1,4,7,10,13,16,19,22];  
    // let three_hour=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
    const labels=["1 AM","4 AM","7 AM","10 AM","1 PM","4 PM","7 PM","10 PM"];
    // const labels = ["12 AM","1 AM","2 AM","3 AM","4 AM","5 AM","6 AM","7 AM","8 AM","9 AM","10 AM","11 AM","12 PM",
    // "1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM","8 PM","9 PM","10 PM","11 PM"];

    let lat= req.query.lat;
    let lon= req.query.lon;
    let startDate=req.query.startDate;
    let hourlyUrl= `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code&timezone=auto&start_date=${startDate}&end_date=${startDate}`
    fetch(hourlyUrl).then(res => res.json())
    .then(async(hourlyData)=>{
        let hourObj=[];
        for(let i=0;i<three_hour.length;i++){
            let weatherCode=hourlyData.hourly.weather_code[three_hour[i]];

            let weatherImgField =await Weather.findOne({weatherCode: { $in: weatherCode } });

            let weatherIcon = weatherImgField.dayIcon;
            hourObj.push({
                weatherIcon:weatherIcon,
                temperature:hourlyData.hourly.temperature_2m[three_hour[i]],
                label:labels[i]
            })
        }
        res.json({hourObj:hourObj});
    });
});

router.post("/login", async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password.toString();
        const useremail = await model.findOne({email: email});

        const isMatch = await bcrypt.compare(password, useremail.password);
        if(isMatch){
            const token = await useremail.generateAuthToken();
            //print the cookies 
            res.json({email:useremail.email, loggedIn:isMatch, token});
        }else{
            res.status(404).json({error:"invalid password"});
        }
    } catch (error) {
        res.status(404).json({error:"email not found"});
    }

});

router.post('/signUp', async(req, res) => {
    try{
        
        if(req.body.password != req.body.confirmPass){
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
    res.status(400).send(err);
}
});

//Zaruat nhi hai iski
router.get("/logout",async(req,res)=>{
    try{
        res.clearCookie("loggedIn");
        res.clearCookie("jwt0");
        res.clearCookie("email");
        // await req.user.save();

        res.redirect(`${process.env.FRONTEND_URL}/`);
        }
        catch(err){
            res.send(err);
        }
    
});

router.post("/addCity", async (req, res) => {
    try {
        console.log("Adding City to db...");
        let userEmail = req.body.email;
        // Create a new city history entry
        const cityHistory = {
            location: req.body.location,
            lat: req.body.lat,
            lon: req.body.lon,
            current_temp: req.body.current_temp,
            min: req.body.min,
            max: req.body.max,
            humidity: req.body.humidity,
            icon: req.body.icon,
            date: req.body.date,
            precipitation: req.body.precipitation
        };

        // Find the user by email and update their search history
        const updatedUser = await model.findOneAndUpdate(
            { email: userEmail },
            { $push: { 
                searchHistory: { 
                $each: [cityHistory], 
                $slice: -20 
                }
            } },
            { new: true }
        );

        res.json({ status: true, updatedUser });
    } catch (err) {
        console.log("err: ", err);
        res.status(500).json({ error: err, status: false });
    }
});

router.get("/getCities", async (req, res) => {
    try {
        console.log("Getting City from db...");
        let userEmail = req.query.email;
        const user = await model.findOne({ email: userEmail });
        let searchHistory = user.searchHistory;

        res.json({ status: true, searchHistory });
    } catch (err) {
        console.log("err: ", err);
        res.status(500).json({ error: err, status: false });
    }
});

router.get("/mega",(req,res)=>{
    res.render("mega");
})
module.exports = router;    
