
// global params
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = 3000;
var path = require('path');
var uid = require('uid');

// server
server.listen(port, function(){
    console.log('server connection estabslihed on port:3000')
});

// directories
app.use(express.static(path.join(__dirname, '/')));


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// user list obj 
var users = {};

// user channels obj
//var chatterUsers = {};

/*

    // disconnect
    socket.on('disconnect', function(){
        var username = usernames[[socket.username]]
        delete username;
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updateLogs', username + ' has left the chat');
    });

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

function disconnect(socket, data){
    var rooms = io.sockets.manager.roomClients[socket.id];

    for(var room in rooms){
        if(room && rooms[room]){
            unsubscribe(socket, { room: room.replace('/','')});
        }
    }
    delete usernames[socket.id]
}

// ON CONNECTION >>>>>>>>>>>>>>>

io.on('connection', function(socket){ 

    // on connect - establish the user info

   socket.on('connect', function(data){
        connect(socket, data);
    });

    socket.on('chatmessage', function(data){
        chatmessage(socket, data);
    });

   // socket.on('subscribe', function(data){
   //     subscribe(socket, data);
   // })

});

// connect function

function connect(socket, data){
    // generate user id
    data.userId = uid();

    // compile users on individual thread
    users[socket.id] = data;

    // fire ready function to store user id

    socket.emit('ready', { 
        userId: data.userId 
    });

    // update user list
    socket.emit('userList', { 
        users: getUsers() 
    })

}

// chat message function 

function chatmessage(socket, data){
    console.log('chat message index.js firing')

    socket.broadcast.to(data.room).emit('chatmessage', { user: users[socket.id], message: data.message })

    //, room: data.room
}

// get rooms function

function getRooms(){
    return Object.keys(io.sockets.manager.rooms);
}

// subscription function 

function subscribe(socket, data){
    var rooms = getRooms();

    if(rooms.indexOf('/' + data.room) < 0){
        socket.broadcast.emit('addroom', { room: data.room });
    }

    socket.join(data.room);

    updatePresence(data.room, socket, 'online');

    socket.emit('roomUsers', { room: data.room, users: getUsersInRoom(socket.id, data.room )});
}

// get users in room function 

function getUsersInRoom(socketId, room){
	// get array of socket ids in this room
	var socketIds = io.sockets.manager.rooms['/' + room];
	var userSockets = [];
	
	if(socketIds && socketIds.length > 0){
		socketsCount = socketIds.lenght;
		
		// push every client to the result array
		for(var i = 0, len = socketIds.length; i < len; i++){
			
			// check if the socket is not the requesting
			// socket
			if(socketIds[i] != socketId){
				userSockets.push(users[socketIds[i]]);
			}
		}
	}
	
	return socketIds;
}

// get users function 

function getUsers(socketId, user){
    var socketIds = io.sockets.manager.users['/' + user];
    var users = [];

    if (socketIds && socketIds.length > 0){
        socketsCount = socketIds.length;

        for (var i = 0, len = socketIds.length; i < len; i++){
            if (socketIds[i] !== socketId){
                users.push(userSockets[socketIds[i]])
            }
        }
    }
    return users
}

// update presence function 

function updatePresence(room, socket, state){
    room = room.replace('/', '');

    socket.broadcast.to(room).emit('presence', { user: userSockets[socket.id], state: state, room: room})
}