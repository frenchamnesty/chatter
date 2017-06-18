/*

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

// for displaying in the chat


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

// ENABLE USERNAME INPUT ONLY IF USER HAS BEEN SUBMITTED FOR THE CHAT!!!!!!!!!!!

// global params

var socket = io.connect('http://localhost:3000');
var userId = null;
var username = null;
var currentRoom = null;
var serverDisplayName = 'Server';

var markup = {
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
    $('.chat-input input').on('keydown', function(e){
        var key = e.which || e.keyCode;

        if(key == 13) {
            handleMessage();
        }
    })

    $('.chat-submit button').on('click', function(){
        handleMessage();
    })

    $('#messages-log ul').on('scroll', function(){
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
                $('#m').focus();
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

function handleMessage(){
    var message = $('.chat-input input').val().trim();
    console.log('handle messsage is firing');

    if(message){

        socket.emit('chatmessage', {
            message: message
        });
        
        console.log('handle message should go through, msg: ' + message);
                    
        addMessage(username, message, true, true);
        
        $('.chat-input input').val('');
    
    } else {
        console.log('chat did not go through');
    }
}

function addMessage(sender, message, showTime, isSelf){

    var html = [
				'<li>',
					'<span class="fl sender">${sender} [<span class="fr time">${time}</span>]: </span><span class="fl text">${text}</span>',
				'</li>'
			].join("");

    var $msgTemplate = $.tmpl(html, {
        sender: sender,
        text: message,
        time: showTime ? getTime() : ''
    })
    console.log('add message firing');

/*
    var time = showTime ? getTime() : '';

    console.log('sender: ' + sender);
    console.log('message: ' + message);
    console.log('time: ' + time);
*/
    if(isSelf){
        $('#messages-log ul').addClass('message-sender');

        console.log('is self?');
    }

/*
    $('#messages-log ul').append(					'<li><span class="sender">${sender}: </span><span class="message">${message}</span><span class="fr time">${time}</span></li>');
*/

    $('#messages-log ul').append($msgTemplate);

   // $msgTemplate.appendTo('messages-log ul');

    $('#messages-log').animate({ scrollTop: $('.messages-log ul').height() }, 100)

    //$html.appendTo('#messages-log ul');

    console.log('appending?');

    //$('.messages-log').animate({ scrollTop: $('.messages-log ul').height() }, 100);


   // $('#messages-log').animate({ scrollTop: $('#messages-log ul').height() }, 100)
}

function updateUsers(usernames){
    $('#user-list').empty();
    $.each(users, function(key, value){
        $('#user-list').append('<div class="username"><i class="fa fa-user" aria-hidden="true"></i> ' + key + '</div>');
    });
}  

/*
function connect(){
    $('log').html('connecting...');
}
*/

//socket.on('connnect', connect);

socket.on('connect', addUser);

//socket.on('ready', addUser);

socket.on('userList', updateUsers);

/*
socket.on('chatmessage', function(data){
    console.log('chat message is firing from socket on');


    var username = data.user.username;
    var message = data.message;

    addMessage(username, message, true, false, false);

});
*/

/*
socket.on('presence', function(data){
    if(data.state === 'online'){
        addUser(data.user, true);
    } else if (data.state === 'offline'){
        removeUser(data.user, true);
    }
})
*/

$(function(){
    bindDOMEvents();
})