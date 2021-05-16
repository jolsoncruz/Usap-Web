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
const urlencoder = bodyparser.urlencoded({extended: false})
const { raw } = require('body-parser');

// * MONGODB - MONGOOSE
const mongoose = require('mongoose');
const userModel = require('./models/user');

// * IF NOT DEPLOYED THEN USE LOCALHOST
const deployed = false; // todo: change to true when deployed
if(deployed == false){
    const port = 3000;
    app.listen(port, () => {
        console.log(`De La Salle Usap listening at http://localhost:${port}`)
    })
} else {
    app.listen(process.env.PORT || 3000) // HEROKU STATEMENT
}

// * LANDING PAGE
app.get('/', (req, res) => {
    res.render('index');
});

// * 404 PAGE
app.use((req, res) => {
    console.log("ERROR: 404");
    //res.status(404).render('404'); // todo: change to this after creating 404 page
})