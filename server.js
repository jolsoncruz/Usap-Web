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

// * LANDING PAGE
app.get('/', (req, res) => {
    roomModel.find({}).exec(function(err, data){
        res.render('home',{
            rooms: data
        });
    });
});

app.get('/:room', (req, res) => {
    roomModel.findOne({roomSlug: req.params.room}).exec(function(err, data){
        if(data === null){
            res.render('error',{
                //session: req.session,
                error: '404',
                message: "The page can't be found"
            });
        } else{
            console.log(data);
            res.render('room',{
                roomName: data.roomName,
                roomSlug: data.dataSlug
            })
        }
    })
})

const users = {}

io.on('connection', socket => {
    socket.on('new-user', username => {
        users[socket.id] = username
        socket.broadcast.emit('user-connected', username)
    })
    socket.on('send-chat-message', message => {
        socket.broadcast.emit('chat-message', {username: users[socket.id], message:message})
    })
    socket.on('disconnect', () => {
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