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

// user list obj 
var usernames = {};

// user channels obj
var userSockets = {};

io.on('connection', function(socket){    

// add user + set username
    socket.on('set username', function(username){
        if(usernames[username] === undefined){
            usernames[username] = socket.id;
            userSockets[socket.id] = username;
            usernameAvailable(socket.id, username);
            userJoined(username);
            socket.emit('newUser', username);
            //socket.broadcast.emit('updateLogs', username + ' has joined the chat');
            socket.emit('updateUsers', usernames);
            console.log('update users if firing from the index');
       /* } else {
            usernameInUse(socket.id, username);  */
        }
    })

    // disconnect
    socket.on('disconnect', function(){
        var username = usernames[[socket.username]]
        delete username;
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updateLogs', username + ' has left the chat');
    });


/*
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
        var sender;

        if (msg.socketName){
            sender = userSockets[socket.id]
        } else {
            sender = msg.source;
        }

        if (msg.target == "everyone") {
            io.sockets.emit('message', 
            {   "source": sender,
                "message": msg.message,
                "target": msg.target })
        } else {
            io.sockets.sockets[usernames[msg.target]].emit('message',
            {   "source": sender,
                "message": msg.message,
                "target": msg.target })
        }
        console.log('message: ' + msg);
        io.emit('sendMessage', socket.username, msg);
    })
  

    // disconnect
    socket.on('disconnect', function(){
        delete usernames[socket.username];
        io.sockets.emit('updateusers', username);
        socket.broadcast.emit('updateLog', 'Server', socket.username + ' has left the chat');
    });
  */


})

function userJoined(username){
    Object.keys(userSockets).forEach(function(socketId){
        io.sockets.sockets[socketId].emit('userJoined', { "username" : username });
    })
}

function userLeft(username){
    io.sockets.emit('userleft', { "username" : username });
}

function usernameAvailable(socketId, username){
    setTimeout(function(){
        console.log(username + ' has joined the chat. their individual chat id is: ' + socketId);

        io.sockets.sockets[socketId].emit('welcome', { "username" : username, "currentusers" : JSON.stringify(Object.keys(usernames)) });
    }, 500)
}


/*
function usernameInUse(socketId, username){
    setTimeout(function(){
        io.sockets.sockets[socketId].emit('error', { "usernameTaken" : true })
    })
}
*/


