require("dotenv").config();
require("./db/conn");
const express = require('express')
const app = express()
const path = require("path");
const hbs = require("hbs");
const router = require("./routers/router");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.json());
app.use(router);
const port = process.env.PORT||3000

app.use(express.static('public', { maxAge: '1y' }));
app.use(express.static(path.join(__dirname, "./public")));
app.set("views", path.join(__dirname, "../templates/views"));
app.set("view engine", "hbs");

