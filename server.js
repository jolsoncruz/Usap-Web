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

const port = process.env.PORT || 3000
// ? app.listen(process.env.PORT || 3000)

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

//  * GLOBAL VARIABLES
var rooms = {}
var OTP = 0;
var valid = 0;
var newUser = new userModel({
    userName: '',
    userEmail: '',
    userPassword: ''
})

// * LANDING PAGE
app.get('/', (req, res) => {
    if(req.session.loggedIn == true){
        roomModel.find({}).lean().exec(function(err, allRooms){
            res.render('home',{
            rooms: allRooms,
            userName: req.session.userName
        });
    });
    } else {
        res.redirect('/login');
    }
});

app.get('/getRooms', (req, res) => {
    if(req.session.getRooms == 0){
        roomModel.find({}, {'_id':0}).exec(function(err, allRooms){
            var tempResult = [];
            allRooms.forEach(function(document){
                tempResult.push(document.toObject());
            });
            
            for(var i=0; i<tempResult.length; i++){
                rooms[tempResult[i].roomSlug] = { users: {} };
            }
            req.session.getRooms = 1;
            res.redirect('/');
        }) 
    } else {
        res.render('error',{
            rooms: allRooms,
            error: '404',
            message: "The page can't be found"
        });
    }
});

app.get('/login', (req, res) => {
    if(req.session.loggedIn == true){
        res.redirect('/')
    } else {
        res.render('login', {
            layout: 'auth',
            error: ''
        })
    }
})

app.post('/login', urlencoder ,(req, res) => {
    var user = {
        userEmail: req.body.email,
        userPassword: req.body.password
    }

    userModel.findOne({userEmail: user.userEmail}, (err, userQuery) => {
        if (err) {
            console.log(err.errors)
        }
        if (userQuery) {
            console.log("User found!")
            if(bcrypt.compareSync(user.userPassword, userQuery.userPassword)){
                console.log("Login Successful");
                req.session.loggedIn = true;
                req.session.userEmail = userQuery.userEmail;
                req.session.userName = userQuery.userName;
                req.session.getRooms = 0;
                console.log(userQuery);
                res.redirect('/getRooms');
            } else {
                res.render('login', {error: "Incorrect password, please try again!", layout: 'auth'})
            }
        } else {
            res.render('login', {
                error: "User not found!",
                layout: 'auth'})
        }
    })
})

app.get('/signup', (req, res) => {
    if(req.session.loggedIn == true){
        res.redirect('/')
    } else {
        res.render('signup', {
            layout: 'auth',
            message: 'hello'
        })
    }
}) 

app.post('/register', urlencoder, (req, res) => {
    newUser.userName = req.body.name;
    newUser.userEmail = req.body.email;
    newUser.userPassword = bcrypt.hashSync(req.body.password,10);

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
                layout: 'auth',
                error: ''
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
              req.session.userName = newUser.userName;
              req.session.userEmail = newUser.userEmail;
              req.session.loggedIn = true;
              res.redirect('/');
        } else {
            console.log("WRONG OTP");
            res.render('OTP', {
                layout: 'auth',
                error: 'Wrong OTP, please try again!'
            })
        }
    } else {
        console.log("EXPIRED OTP");
        res.render('OTP', {
            layout: 'auth',
            error: 'Expired OTP, please try again!'
        })
    }
})

app.get('/logout', (req, res) => {
    req.session.loggedIn = false;
    res.redirect('/')
})

app.get('/:room', (req, res) => {
    if(req.session.loggedIn == true){
        roomModel.find({}).lean().exec(function(err, allRooms){
            roomModel.findOne({roomSlug: req.params.room}).exec(function(err, specificRoom){
                if(specificRoom === null){
                    res.render('error',{
                        rooms: allRooms,
                        error: '404',
                        message: "The page can't be found"
                    });
                } else{
                    res.render('room',{
                        layout: 'rooms',
                        rooms: allRooms,
                        roomName: specificRoom.roomName,
                        roomSlug: specificRoom.roomSlug,
                        userName: req.session.userName
                    })
                }
            })
        })
    } else {
        res.redirect('/')
    }
})

io.on('connection', socket => {
    socket.on('new-user', (roomSlug, username) => {
        socket.join(roomSlug)
        rooms[roomSlug].users[socket.id] = username
        socket.to(roomSlug).emit('user-connected', username)
        console.log(rooms)
    })
    socket.on('send-chat-message', (roomSlug, message) => {
        console.log("roomSlug:" + roomSlug)
        socket.to(roomSlug).emit('chat-message', {username: req.session.userName, message:message})
        console.log(rooms)
    })
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(roomSlug => {
            socket.to(roomSlug).emit('user-disconnected', rooms[roomSlug].users[socket.id])
            delete rooms[roomSlug].users[socket.id]
            console.log(rooms)
        })
    })
})

function getUserRooms(socket){
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if(room.users[socket.id] != null) names.push(name)
        return names
    }, [])
}

//HTTP Status Routes
app.use((req, res, next) => {
  res.status(500).render('error',{
    session: req.session,
    error: '500',
    message: 'Internal Server Error',
    layout: 'auth'
  });
});

server.listen(port), function(){
    console.log('Server started on port' + port);
};