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

http.listen(3000, function(){
    console.log('listening on *:3000');
});


var usernames = {};

io.on('connection', function(socket){

    socket.on('send', function(msg){
        console.log('message: ' + msg);
        io.emit('send', msg);
    })


    socket.broadcast.emit('hi');


})

