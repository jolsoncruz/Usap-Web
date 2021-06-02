// Package Dependencies
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {cors:{origin:"*"}})

const hbs = require('express-handlebars')
const session = require('express-session')
const bodyParser = require("body-parser")
const urlencoder = bodyParser.urlencoded({extended: false})
const path = require('path')

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
var nodemailer = require("nodemailer");
var xoauth2 = require('xoauth2');

// Import Models
const userModel = require('./models/user')
const roomModel = require('./models/room')

// Environment Configurations
app.set('view engine', 'hbs')
app.engine('hbs',hbs({
    extname: 'hbs',
    defaultView: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    helpers: {
        ifCond: function(v1, v2, options) {
          if(v1 === v2) {
            return options.fn(this);
          }
          return options.inverse(this);
        },
        json: function(context) {
            return JSON.stringify(context);
        }
    }
}))
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))



app.use(session({
    secret: "very super secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge:1000*60*60*24*30,
        httpOnly: true
    }
}));

// Configuration for handling API endpoint data
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var rooms = getRooms()
const users = {}
var finalResult = {};

function getRooms(){
    var tempResult = [];
    roomModel.find({}, {'_id':0}).exec(function(err, allRooms){
        allRooms.forEach(function(document){
            tempResult.push(document.toObject());
        });

        for(var i=0; i<tempResult.length; i++){
            finalResult[tempResult[i].roomSlug] = {};
        }

        console.log(finalResult);
        rooms = finalResult;
    })
}

// function getRooms(){
//     var finalResult = {};
//     roomModel.find({}, {'_id':0}).exec(function(err, allRooms){
//         var tempResult = [];
//         allRooms.forEach(function(document){
//             tempResult.push(document.toObject());
//         });
        
//         for(var i=0; i<tempResult.length; i++){
//             finalResult[tempResult[i].roomSlug] = {};
//         }
//         //console.log(finalResult);
//     }) 
//     setTimeout(function() {
//         console.log("inside interval");
//     }, 1000);
//     console.log(finalResult);
// }

// * LANDING PAGE
app.get('/', (req, res) => {
    roomModel.find({}).lean().exec(function(err, allRooms){
        res.render('home',{
            rooms: allRooms
        });
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'auth'
    })
}) 

app.get('/signup', (req, res) => {
    res.render('signup', {
        layout: 'auth',
        message: 'hello'
    })
}) 

var OTP = 0;
var valid = 0;
var newUser = new userModel({
    userName: '',
    userEmail: '',
    userPassword: ''
})

app.post('/register', urlencoder, (req, res) => {

    newUser.userName = req.body.name;
    newUser.userEmail = req.body.email;
    newUser.userPassword = req.body.password;

    console.log(newUser);
    
    function sendOTP(){
        var smtpTransport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: "dlsu.otp@gmail.com",
                pass: "4ry4nJ0150n"
            }
        });

        var mailOptions = {
            from: "dlsu.otp@gmail.com",
            to: newUser.userEmail,
            subject: "De La Salle Usap Verification",
            text: "Verify your account within 5 minutes! Your OTP is : " + OTP
        };

        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent: " + response.message);
            }
        });
    }

    function generateOTP(){
        OTP = Math.floor(100000 + Math.random() * 900000);
        valid = 1;
        sendOTP();
        console.log(OTP);
        setTimeout(function() {
            valid = 0;
        }, 5 * 60 * 1000);
    }

    userModel.findOne({userEmail: newUser.userEmail}, (err1, userQuery) => {
        if (err1) {
            console.log(err1.errors);
            res.render('register', {
                error: "ERR: DB validation"
            })
        }
        if (userQuery){
            console.log('ERR: User found');
        } else {
            generateOTP();
            res.render('OTP', {
                layout: 'auth'
            })
        }
    })

})

app.post('/checkotp', urlencoder, (req, res) => {
    var userOTP = req.body.otp;
    if (valid == 1){
        if (userOTP == OTP){
            console.log("OTP MATCHES")
            newUser.save(function (err, results) {
                console.log(results);
              });
        }
    }
    newUser.userName = '';
    newUser.userEmail = '';
    newUser.userPassword = '';
})

app.get('/:room', (req, res) => {
    roomModel.find({}).lean().exec(function(err, allRooms){
        roomModel.findOne({roomSlug: req.params.room}).exec(function(err, specificRoom){
            if(specificRoom === null){
                res.render('error',{
                    rooms: allRooms,
                    //session: req.session,
                    error: '404',
                    message: "The page can't be found"
                });
            } else{
                res.render('room',{
                    rooms: allRooms,
                    roomName: specificRoom.roomName,
                    roomSlug: specificRoom.dataSlug
                })
            }
        })
    })
})

io.on('connection', socket => {
    socket.on('new-user', username => {
        console.log("new-user:" + JSON.stringify(users))
        users[socket.id] = username
        socket.broadcast.emit('user-connected', username)
    })
    socket.on('send-chat-message', message => {
        console.log("send-chat-message:" + JSON.stringify(users))
        socket.broadcast.emit('chat-message', {username: users[socket.id], message:message})
    })
    socket.on('disconnect', () => {
        console.log("disconnect:" + JSON.stringify(users))
        socket.broadcast.emit('user-disconnected', users[socket.id])
        delete users[socket.id]
    })
})

//HTTP Status Routes
// app.use((req, res, next) => {
//     res.status(404).render('error',{
//         session: req.session,
//         error: '404',
//         message: "The page can't be found"
//     });
// });

// app.use((req, res, next) => {
//   res.status(500).render('error',{
//     session: req.session,
//     error: '500',
//     message: 'Internal Server Error'
//   });
// });

server.listen(3000), function(){
    console.log('Server started on port 3000');
};