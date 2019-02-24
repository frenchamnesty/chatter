
// global params
var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
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
var rooms = {};

// user channels obj
//var chatterUsers = {};

function disconnect(socket, data){
    var rooms = io.sockets.manager.roomClients[socket.id];

    for(var room in rooms){
        if(room && rooms[room]){
            leaveRoom(socket, { room: room.replace('/','')});
        }
    }
    delete usernames[socket.id]
}

// ON CONNECTION >>>>>>>>>>>>>>>

io.on('connection', function(socket){ 

    // CONNECT
   socket.on('connect', function(data){
        connect(socket, data);
    });

    // CHATMESSAGE
    socket.on('chatmessage', function(data){
        chatmessage(socket, data);
    });

    socket.on('isTyping', function(data){
        isTyping(socket, data);
    });

   // JOIN ROOM
   socket.on('join', function(data){
       join(socket, data);
   });

   // LEAVE ROOM
   socket.on('leaveRoom', function(data){
       leaveRoom(socket, data);
   });

    // DISCONNECT
    socket.on('disconnect', function(data){
        disconnect(socket, data);
    });

});

// connect function

function connect(socket, data){
    // generate user id
    data.userId = uid();

    // compile users on individual thread
    users[socket.id] = data;

    // ready (push user id id)
    socket.emit('ready', { 
        userId: data.userId 
    });

    // immediately join general channel
    join(socket, { room: 'general' })

    // get list of rooms
    socket.emit('roomslist', { rooms: getRooms() });

}

// chat message function 

function chatmessage(socket, data){
    console.log('socket: ', socket);
    console.log('chat message index.js firing')

    socket.broadcast.to(data.room).emit('chatmessage', { user: users[socket.id], message: data.message })

    //, room: data.room
}

function isTyping(socket, data){
    console.log('socket: ', socket);
    console.log('user is typing [index.js]');

    socket.broadcast.to(data.room).emit('isTyping', { user: users[socket.id] })
}

// get rooms function

function getRooms(){
    return Object.keys(io.sockets.manager.rooms);
}

// subscription function 

function join(socket, data){
    var rooms = getRooms();

    if(rooms.indexOf('/' + data.room) < 0){
        socket.broadcast.emit('addroom', { room: data.room, roomId: data.uid() });
    }

    socket.join(data.room, data.roomId);

    updateStatus(data.room, socket, 'online');

    socket.emit('roomUsers', { room: data.room, users: getUsers(socket.id, data.room )});
}

// get users in room function 

function getUsers(socketId, room){
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
    socket.broadcast.to(room).emit('presence', { user: users[socket.id], state: state, room: room})
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