// Package Dependencies
const express = require('express')
const io = require('socket.io')(3000, {cors:{origin:"*"}})
const path = require('path')
const hbs = require('express-handlebars')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require("body-parser")
const session = require('express-session')
const bcrypt = require('bcrypt')
const urlencoder = bodyParser.urlencoded({extended: false})

// Import Models
const userModel = require('./models/user')

// Environment Configurations
app.set('port', (process.env.PORT || 5000))
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

// Configuration for handling API endpoint data
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// * LANDING PAGE
app.get('/', (req, res) => {
    userModel.find({}).exec(function(err, users){
        res.render('body',{
            data: users
        });
    });
});

//HTTP Status Routes
// app.use((req, res, next) => {
//     res.status(404).render('frontend/error',{
//         session: req.session,
//         error: '404',
//         message: "The page can't be found"
//     });
// });

// app.use((req, res, next) => {
//   res.status(500).render('frontend/error',{
//     session: req.session,
//     error: '500',
//     message: 'Internal Server Error'
//   });
// });

app.listen(app.get('port'), function(){
    console.log('Server started on port ' + app.get('port'));
});