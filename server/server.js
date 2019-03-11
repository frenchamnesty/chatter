const port = process.env.PORT || 3000;
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io').listen(server)
const path = require('path')
const crypto = require('crypto')

var users = {}
var socks = {}

function UID() {
    this.id = ++UID.lastId;
}

UID.lastId = 0;

io.on('connection', function(socket) {
    socket.on('join', function(recv, fn) {
        if (!recv.user) {
            
        }
    })
})


server.listen(port, function(){
    var serverAddress = server.address();
    console.log(`server connection on ${serverAddress} established on port ${port}`);
})

