// * EXPRESS APP
const express = require('express');
const app = express();
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// * VIEW ENGINE
app.set('view engine', 'hbs');

// * EXPRESS SESSIONS
const session = require('express-session')
app.use(session({
    secret: "very super secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge:1000*60*60*24*30,
        httpOnly: true
    }
}))

// * COOKIES
const cookieparser = require("cookie-parser")
app.use(cookieparser())

// * BODY PARSER - URL ENCODER
const bodyparser = require("body-parser")
const urlencoder = bodyparser.urlencoded({
    extended: false
})

// * MONGODB - MONGOOSE
const mongoose = require('mongoose');
//  const userModel = require('./models/user');
const { raw } = require('body-parser');

app.listen(process.env.PORT || 3000)

app.get('/', (req, res) => {
    res.render('index');
});

app.use((req, res) => {
    res.status(404).render('404');
})