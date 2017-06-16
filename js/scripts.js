//var socket = io.connect('http://localhost:3000');



var socket = io();

$('form').submit(function(){
    socket.emit('send', $('#m').val())
        $('#m').val('');
        return false;
    });


    socket.on('send', function(msg){
        $('#messages').append($('<li>').text(msg));
    });
});