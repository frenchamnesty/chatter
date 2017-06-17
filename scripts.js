var socket = io.connect('http://localhost:3000/');
socket.on('connect', newUser);
socket.on('updateUsers', updateUsers);

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
        title: "what's your username?",
        type: "input",
        showCancelButton: false,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "...right here"
    }, function(inputValue){
        if (inputValue === false) return false;
        if (inputValue === "") {
             swal.showInputError("enter a valid username, dummy");
             return false
         }
         inputValue = inputValue.replace(/<(?:.|\n)*?>/gm, '');
         swal("Nice!", "cool, start chatting " + inputValue);
         socket.emit('adduser', inputValue);
     });
}

// for displaying in the chat
function getTime() {
    var datetime = new Date();
    var hours = datetime.getHours();
    var minutes = datetime.getMinutes();
    var seconds = datetime.getSeconds();

    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;

    return hours + ':' + minutes + ':' + seconds;
}

function updateUsers(data) {
    $('#users').empty();
    $.each(data, function(key, value) {
        $('#users').append('<div class="username"><i class="fa fa-user" aria-hidden="true"></i> ' + key + '</div>');
    });
}