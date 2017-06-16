var socket = io.connect('http://localhost:3000/');
socket.on('connect', newUser);
//socket.on('sendMessage', loadMessages);
//socket.on('updateUsers', updateUserList);

$(function () {
    $('form').submit(function(){
        socket.emit('sendMessage', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('sendMessage', function(msg){
        $('#messages').append($('<li>').text(msg));
    });
});

function newUser() {
    var usernamePopUp = swal({
        title: "Please enter your username",
        type: "input",
        showCancelButton: false,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "e.g Gavin Belson or Mr.Robot"
    }, function(inputValue){
        if (inputValue === false) return false;
        if (inputValue === "") {
             swal.showInputError("Hey, we need you to enter your username!");
             return false
         }
         inputValue = inputValue.replace(/<(?:.|\n)*?>/gm, '');
         swal("Nice!", "Your username is " + inputValue, "success");
         socket.emit('adduser', inputValue);
     });
}


/*
       $(function () {
            var socket = io();
            $('form').submit(function(){
                socket.emit('sendMessage', $('#m').val())
                $('#m').val('');
                return false;
            });


            socket.on('sendMessage', function(msg){
                $('#messages').append($('<li>').text(msg));
            });
        });
*/