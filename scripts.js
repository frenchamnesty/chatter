

/*
$(function() {
    messageLog = $('#m');
    sendBtn = $('#send');
    bindButton();
    window.setInterval(time, 1000*10);
    $('#chatMessages').slimScroll({ height: '600px'});
    sendButton.click(function() {sendMessage(); });
    setHeight();
    $('#m').keypress(function(e){
        if (e.which === 13) { sendMessage();}
    })

})

function setHeight(){
    $('.slimScrollDiv').height('603');
    $('.slimScrollDiv').css('overflow', 'visible')
}

function time(){
    $('time').each(function(){
        $(this).text($.timeago($(this).attr('title')))
    })
}

socket.on('message', function(data){
    addMessage(data['message'], data['init'], new Date().toISOString(), false)
    console.log(data);
})
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

function updateUsers(thisUser) {
    $('#user-list').empty();
    $.each(thisUser, function(key, value) {
        $('#user-list').append('<li class="username"><i class="fa fa-user" aria-hidden="true"></i> ' + key + '</div>');
    });
}
*/
    /*
    $('#user-list').append('<li><i class="fa fa-user" aria-hidden="true"></i>' + usernames.thisUser + '</li>');
    console.log('this user update users: ' + thisUser);
    

    $('#user-list').append($('<option></option>').val(username).html(username));
    if (notify && (thisUser !== username) && (thisUser !== 'everyone')){
        $('#user-list').append('<span class="admin">==>' + username + " just joined <==<br/>")
    }
    */

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

//socket.on('connect', newUser);
//socket.on('updateLog', loadMessage)
//socket.on('updateUsers', updateUsers);


// ENABLE USERNAME INPUT ONLY IF USER HAS BEEN SUBMITTED FOR THE CHAT!!!!!!!!!!!

// global params
//var socket = io.connect('http://localhost:3000');
var socket = null;
var userId = null;
var username = null;
var currentRoom = null;
var serverDisplayName = 'Server';

var template = {
    room: [
        '<li data-roomId="${room}">',
        '<span class="icon"></span> ${room}',
        '</li>'
    ].join(""),

    user: [
        '<li data-userId="${userId}" class="user">',
        '<div class="username"><span class="icon"></span> ${username}</div>',
        '<div class="typing"></div>',
        '</li>'
    ].join(""),

    message: [
        '<li class="message">',
        '<div class="sender">${sender}: </div><div class="text">${text}</div><div class="time">${time}</div>',
        '</li>'
    ].join("")
};

function bindDOMEvents(){
    $('input#m').on('keydown', function(e){
        var key = e.which || e.keyCode;

        if(key == 13) {
            handleMessage();
        }
    })

    $('#log').on('scroll', function(){
        var self = this;

        window.setTimeout(function(){
            if($(self).scrollTop() + $(self).height() < $(self).find('ul').height()){
                $(self).addClass('scroll');
            } else {
                $(self).removeClass('scroll');
            }
        }, 50);
    });
}

/*
function bindSocketEvents(){
    socket.on('connect', function(){
        socket.emit('connect', {            username: username 
        })
    })

    socket.on('ready', function(data){
        $('#log').animate({ 'opacity': 0 }, 200, function(){
            $(this).hide();
            $('input#m').focus();
        })
        
        userId = data.userId;

    })

    socket.on('userList', function(data){

        for(var i = 0, len = data.users.length; i < len; i++){
            if (data.users[i] !== ''){
                addUser(data.users[i], false)
            }
        }
    })
    */


function removeUser(user, announced){
    $('user-list ul li[data-userId="' + user.userId + '"]').remove();

    if(announce){
        insertMessage(serverDisplayName, user.username + ' has left the chat...', true, false, true )
    }
}

function insertMessage(sender, message, showTime, isSelf, room){
    var $html = $.template(template.message, {
        sender: sender, 
        text: message, 
        time: showTime ? getTime() : ''
    });

    if(isSelf){
        $html.find('.sender').css('color', 'red')
    }

    $html.appendTo('#log');

    $('#log').animate({ scrollTop: $('#log').height() }, 100)
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

function handleMessage(){
    var message = $('input#m').val().trim();

    if(message){
        socket.emit('chatmessage', {
            message: message,
            room: currentRoom
        });

        insertMessage(username, message, true, true);
    } else {
        //
    }
}

function addUser(data){

    var usernamePopUp = swal({
        title: "what's your username?",
        type: "input",
        showCancelButton: false,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "...right here"
    }, function(inputValue){
        if (inputValue === false) return false;

        if(inputValue === ""){
            swal.showInputError("enter a valid username");
            return false;
        }

        inputValue = inputValue.replace(/<(?:.|\n)*?>/gm, '');
         swal("## good2go ##!", "cool, start chatting " + inputValue);

        username = inputValue
        

        socket.emit('ready', function(data){
            data = {
                userId: data.userId,
                username: data.username 
            },

            $('#log').animate({ 'opacity': 0}, 200, function(){
                $(this).hide();
                $('input#m').focus();
            })

            userId = data.userId;
        })

        $('#user-list').append('<li class="username" key=' + userId + '>' + username + '</li>' );

        //socket.emit('ready', { userId: data.userId, username: data.username });

        //

       // subscribe(socket, { room: 'everyone' });

        //socket.emit('roomsList', { rooms: getRooms() });

         //console.log('user data saved: ' + 'username: ' + data.username + ' user id: ' + data.userId)
     });

    // 
    /*
    var $html = $.template(template.user, user);

    if(self){
        $html.addClass('self');
    }

    if(announce){
        insertMessage(serverDisplayName, user.username + ' has joined the chat...', true, false, true);
    }

    $html.appendTo('#user-list');
    */
}

function updateUsers(usernames){
    $('#user-list').empty();
    $.each(usernames, function(key, value){
        $('#user-list').append('<div class="username"><i class="fa fa-user" aria-hidden="true"></i> ' + key + '</div>');
    });
}  

function connect(){
    $('log').html('connecting...');

    //bindSocketEvents();
}

var socket = io.connect('http://localhost:3000');

//socket.on('connnect', connect);

socket.on('connect', addUser);

//socket.on('ready', addUser);

socket.on('userList', updateUsers);

//socket.on('connect', newUser);
//socket.on('updateLog', loadMessage)
//socket.on('updateUsers', updateUsers);