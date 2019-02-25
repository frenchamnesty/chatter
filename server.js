
// global params
var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var port = 3000;
var path = require('path');
var uid = require('uid');

// user list obj 
var users = {};
var rooms = {};

// server
server.listen(port, function(){
    console.log(`server connection estabslihed on port: ${port}`);
});

// directories
app.use(express.static(path.join(__dirname, '/')));


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// ON CONNECTION >>>>>>>>>>>>>>>

io.on('connection', function (socket) {
    socket.on('ready', function(data) {
        console.log('user created, ready fired: ', data);
        ready(socket, data);
    });

    // CHATMESSAGE
    socket.on('chatmessage', function(data){
        chatmessage(socket, data);
    });

    // socket.on('isTyping', function(data){
    //     isTyping(socket, data);
    // });

    // socket.on('typing', (data) => {
    //     socket.broadcast.emit('typing', { name: socket.name })
    // })

   // JOIN ROOM
//    socket.on('join', function(data){
//        join(socket, data);
//    });

   // LEAVE ROOM
//    socket.on('leaveRoom', function(data){
//        leaveRoom(socket, data);
//    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    })

    // DISCONNECT
    // socket.on('disconnect', function(data){
    //     disconnect(socket, data);
    // });

});

function createUserId() {
    return uid();
}

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

// connect function

function ready(socket, data) {
    userId = uid();
    data.userId = userId;
    users[socket.id] = data;


    socket.emit('appendUser', {
        username: data.username,
        userId: userId,
        users: users
    });

    console.log('users: ', users);


    socket.join('general');
    // immediately join general channel
    // join(socket, {
    //     room: 'general'
    // })

    // get list of rooms
    // socket.emit('roomslist', {
    //     rooms: getRooms()
    // });
}

// chat message function 

function chatmessage(socket, data){
    socket.broadcast.to(data.room).emit('chatmessage', { user: users[socket.id], message: data.message })

    //, room: data.room
}

function isTyping(socket, data){
    console.log('user is typing: ', data);

    socket.broadcast.to(data.room).emit('isTyping', { user: users[socket.id] })
}

// get rooms function

function getRooms(){
    if (io.sockets.adapter && io.sockets.adapter.rooms) {
        console.log('io.sockets.adapter.rooms: ', io.sockets.adapter.rooms);
    }

    return io.sockets.adapter && io.sockets.adapter.rooms ? Object.keys(io.sockets.adapter.rooms) : false;
}

// subscription function 

function join(socket, data){
    var roomId = uid();
    console.log('join | data: ', data);

    var rooms = getRooms();
    console.log('ROOMS: ', rooms);

    if (!rooms) {
        roomId = uid();
        console.log('room id: ', roomId);
        socket.broadcast.emit('addroom', {
            room: data.room,
            roomId: roomId
        })
        
        socket.join(data.room, roomId);

    } else if (rooms && rooms.indexOf('/' + data.room) <= 0) {
        socket.broadcast.emit('addroom', {
            room: data.room,
            roomId: roomId
        });

        socket.join(data.room, roomId);
    } else {
        socket.join(data.room, data.roomId);
    }

    updateStatus(data.room, socket, 'online');

    var userIds = getUsers(socket.id, data.room);

    socket.emit('roomUsers', { room: data.room, users: userIds});
}

// get users in room function 
function getUsers(socketId, room){
    // console.log('io.sockets: ', io.sockets);
    console.log('users: ', users);
    console.log('room: ', room);
    var rooms = io.sockets.adapter.rooms;
    var roomTarget = rooms[room];
    console.log('roomtarget: ', roomTarget);
    console.log('rooms: ', rooms);

    var socketIds = roomTarget.sockets;
    console.log('socketIds: ', socketIds);

	// get array of socket ids in this room
	// var socketIds = io.sockets.manager.rooms['/' + room];
    var userSockets = [];
    
    var ids = Object.keys(socketIds);
    console.log('ids: ', ids);

    return ids;
	
	// if(socketIds && socketIds.length > 0){
	// 	socketsCount = socketIds.length;
		
	// 	// push every client to the result array
	// 	for(var i = 0, len = socketIds.length; i < len; i++){
			
	// 		// check if the socket is not the requesting
	// 		// socket
	// 		if(socketIds[i] != socketId){
	// 			userSockets.push(users[socketIds[i]]);
	// 		}
	// 	}
	// }
	// return socketIds;
}

// count online users 

function countUsers(room){
    if(io.sockets.manager.rooms['/' + room]){
        return io.sockets.manager.rooms['/' + room].length;
    }
    return 0;
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

//////////// 

/*


})

*/

/*

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
*/

/*
function usernameInUse(socketId, username){
    setTimeout(function(){
        io.sockets.sockets[socketId].emit('error', { "usernameTaken" : true })
    })
}
*/


/*

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

     */