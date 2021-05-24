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

function getRooms(){
    var finalResult = {};
    roomModel.find({}, {'_id':0}).exec(function(err, allRooms){
        var tempResult = [];
        allRooms.forEach(function(document){
            tempResult.push(document.toObject());
        });
        for(var i=0; i<tempResult.length; i++){
            finalResult[tempResult[i].roomSlug] = {};
        }
    }) 
    return finalResult;
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
//         console.log(finalResult);
//     }) 
//     setInterval(1000);
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