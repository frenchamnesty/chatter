
var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var port = 3000;
var path = require('path');
var uid = require('uid');

var users = {};
var rooms = {};

server.listen(port, function(){
    var serverAddress = server.address().address;
    console.log(`server connection on ${serverAddress} established on port ${port}`);
});

app.use(express.static(path.join(__dirname, '/')));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    socket.on('join', function(recv, fn) {
        console.log('SERVER JOIN: ', recv)
        
        if (recv.uid == null && recv.name) {
            recv.uid = uid()
        }

        socket.user = recv.id;
        users[socket.user] = {
            'uid': recv.uid,
            'name': recv.name,
            'status': 'online'
        }

        rooms[socket.user] = {
            'socket': socket
        }

        if (Object.keys(users).length > 0){
            socket.emit('chat', JSON.stringify({
                'action': 'userList',
                'users': users,
                'count': Object.keys(users).length
            }))
        }

        socket.broadcast.emit('chat', JSON.stringify({
            'action': 'mainChat',
            'user': users[socket.user]
        }))

        if (typeof fn !== 'undefined') {
            fn(JSON.stringify(
                {
                    'join': 'successful',
                    'config': users[socket.user]
                }
            ))
        }
    });

    socket.on('message', function(recv, fn) {
        var date = new Date();
        var id = rooms[recv.uid].socket.id;
        console.log('on message: ', recv);
        var msg = {
            'msg': recv.message,
            'user': users[socket.user]
        }

        if (typeof fn !== 'undefined') {
            fn(JSON.stringify({
                'success': true,
                'date': date
            }))
        }

        io.sockets.connected[id].emit('chat', JSON.stringify({
            'action': 'message',
            'data': msg,
            'date': date
        }))
    })

    socket.on('usertyping', function(recv) {
        var id = rooms[recv.uid].socket.id;
        io.sockets.connected[id].emit('chat', JSON.stringify(
            {
                'action': 'usertyping',
                'data': users[socket.user]
            }
        ))
    })

    socket.on('disconnect', function () {
        console.log('user disconnected');
    })
});


// ---------------------------------------------------------------------------------------------------------

function disconnect(socket, data) {
    var rooms = io.sockets.manager.roomClients[socket.id];

    for (var room in rooms) {
        if (room && rooms[room]) {
            leaveRoom(socket, {
                room: room.replace('/', '')
            });
        }
    }
    delete usernames[socket.id]
}

// get rooms function

function getRooms(){
    if (io.sockets.adapter && io.sockets.adapter.rooms) {
        console.log('io.sockets.adapter.rooms: ', io.sockets.adapter.rooms);
    }

    return io.sockets.adapter && io.sockets.adapter.rooms ? Object.keys(io.sockets.adapter.rooms) : false;
}

// leave room 

function leaveRoom(socket, data){
    updateStatus(data.room, socket, 'offline');

    socket.leave(data.room);

    if(!countUsers(data.room)){
        io.sockets.emit('deleteroom', { room: data.room })
    }
}

// update state of chat function 

function updateStatus(room, socket, state){
    room = room.replace('/', '');
    socket.broadcast.to(room).emit('presence', { 
        user: users[socket.id], 
        state: state, 
        room: room
    })
}

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


function usernameInUse(socketId, username){
    setTimeout(function(){
        io.sockets.sockets[socketId].emit('error', { "usernameTaken" : true })
    })
}