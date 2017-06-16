var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('user has connected');
    socket.on('disconnect', function(){
        console.log('user has disconnected');
    })
})

// username obj 
var usernames = {};

io.on('connection', function(socket){

    // send a message
    socket.on('send', function(msg){
        console.log('message: ' + msg);
        io.emit('send', msg);
    })


    // add a user
    socket.on('newUser', function(username){
        socket.username = username;
        usernames[username] = username;
        socket.emit('updateLog', 'Server', "you're in!");
        socket.boradcast.emit('updateLog', 'Server', username + ' has joined the chat');
        io.sockets.emit('updateUsers', usernames);
    })

    socket.on('disconnect', function(){
        delete usernames[socket.username];
        io.sockets.emit('updateusers', username);
        socket.broadcast.emit('updateLog', 'Server', socket.username + ' has left the chat');
    });

})

http.listen(3000, function(){
    console.log('server connection established. listening on *:3000');
});

