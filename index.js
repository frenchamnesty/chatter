var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');

app.use(express.static(path.join(__dirname, '/')));


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// server

http.listen(3000, function(){
    console.log('server connection established. listening on *:3000');
});

// username obj 
var usernames = {};
var username 

// clients
var clients = {};
var socketsOfClients = {};

io.on('connection', function(socket){    
    // add a user
    socket.on('newUser', function(username){
        socket.username = username;
        usernames[username] = username;
        socket.emit('updateLog', 'Server', "you're in!");
        socket.boradcast.emit('updateLog', 'Server', username + ' has joined the chat');
        io.sockets.emit('updateUsers', usernames);
    })

    // send a message
    socket.on('sendMessage', function(msg){
        console.log('message: ' + msg);
        io.emit('sendMessage', msg);
    })

    // disconnect
    socket.on('disconnect', function(){
        delete usernames[socket.username];
        io.sockets.emit('updateusers', username);
        socket.broadcast.emit('updateLog', 'Server', socket.username + ' has left the chat');
    });



})


