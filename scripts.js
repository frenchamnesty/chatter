var socket = io.connect('http://localhost:3000/');
var thisUser;


/*
$(function () {
    $('form').submit(function(){
        socket.emit('sendMessage', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('sendMessage', function(msg){
        $('<span class="message">' + '[' + getTime() + '] ' + 'strong>' + username + ':</strong> ' + msg + '</span><br/>').insertAfter($('#log'))
       // $('#messages').append($('<li>').text(msg));
    });
});

*/

// need update logs

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
         swal("## good2go ##!", "cool, start chatting " + inputValue);
         thisUser = inputValue;

         socket.emit('set username', thisUser);

         console.log('this user: ' + thisUser)
         console.log('username set as: ' + inputValue)
         //$('#user-list').append('<li>').text(inputValue);
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

/*
function updateUsers(thisUser) {
    $('#user-list').empty();
    $.each(thisUser, function(key, value) {
        $('#user-list').append('<li class="username"><i class="fa fa-user" aria-hidden="true"></i> ' + key + '</div>');
    });
}
*/


function updateUsers(usernames){
    $('#user-list').empty();
    $.each(usernames, function(key, value){
        $('#user-list').append('<div class="username"><i class="fa fa-user" aria-hidden="true"></i> ' + key + '</div>');
    });
    
    /*
    $('#user-list').append('<li><i class="fa fa-user" aria-hidden="true"></i>' + usernames.thisUser + '</li>');
    console.log('this user update users: ' + thisUser);
    

    $('#user-list').append($('<option></option>').val(username).html(username));
    if (notify && (thisUser !== username) && (thisUser !== 'everyone')){
        $('#user-list').append('<span class="admin">==>' + username + " just joined <==<br/>")
    }
    */
}


/*
function updateLog(username){
    Object.keys(socketsOf)
    $('#log').empty();
    $.each(username, function(key, value){
        $('log').append('<li class="notice">')
    })
}

function loadMessage(username, msg){
    $('<span class="message">' + '[' + getTime() + '] ' + 'strong>' + username + ':</strong> ' + msg + '</span><br/>').insertAfter($('#log'))
}



function updateUsers(username, notify){
    $('select#users').append($('<option></option>').val(username).html(username));
    if (notify && (thisUser !== username) && (thisUser !== 'everyone')){
        $('#user-list').append('<span class="admin">==>' + username + " just joined <==<br/>")
    }
}

function sendMessage() {
    var targetUser = $('#users').val();
    $('form').submit(function(){
        socket.emit('sendMessage', 
         {
                  "userSockets": true,
                  "source": "",
                  "message": $('input#msg').val(),
                  "target": trgtUser
                });
	    $('#m').val("");
    })
}

function addMessage(msg){
    var html;
    if (msg.target == "everyone") {
        html = "<span class='to-all'>" + msg.source + " : " + msg.message + "</span><br/>"
    } else {
        // private message
        html = "<span class='private'>" + msg.source + " (private) : " + msg.message + "</span><br/>"
    }
  $('#log').append(html);
}

*/

socket.on('connect', newUser);
//socket.on('updateLog', loadMessage)
socket.on('updateUsers', updateUsers);


// ENABLE USERNAME INPUT ONLY IF USER HAS BEEN SUBMITTED FOR THE CHAT!!!!!!!!!!!