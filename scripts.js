// global params

var socket = io.connect('http://localhost:3000');
var userId = null;
var username = null;
var currentRoom = null;
var serverDisplayName = 'Server';

// prob will do away with this >> 
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
};

// bind dom events to handler/etc functions
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

// add user 
function addUser(data){
    var usernamePopUp = swal({
        title: "what's your username?",
        type: "input",
        showCancelButton: false,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "enter name here"
    }, function(inputValue){
        if (inputValue === false) return false;

        if(inputValue === ""){
            swal.showInputError("enter a valid username");
            return false;
        }

        if(inputValue.length <= 3){
            swal.showInputError("username must be at least 4 characters");
            return false;
        }

        inputValue = inputValue.replace(/<(?:.|\n)*?>/gm, '');
         swal("all set!", "welcome " + inputValue + ', let the chatter begin');

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

        $('#user-list').append('<span id="#online"></span><li class="username" key=' + userId + '>' + username + '</li>' );

     });
}

// handle message input
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

// add message to logs
function addMessage(sender, message, showTime, isSelf){

    // variable for html structure
    var html = [
				'<li>',
					'<span id="sender">${sender} </span>[<span class="fr time">${time}</span>]: <span class="fl text">${text}</span>',
				'</li>'
			].join("");

    var $msgTemplate = $.tmpl(html, {
        sender: sender,
        text: message,
        time: showTime ? getTime() : ''
    })

    // msg is from self?
    if(isSelf){
        $('#messages-log ul').addClass('message-sender');

        console.log('is self?');
    }

    // append message to logs
    $('#messages-log ul').append($msgTemplate);
    $('#messages-log').animate({ scrollTop: $('.messages-log ul').height() }, 100);
}

function updateUsers(usernames){
    $('#user-list').empty();
    $.each(users, function(key, value){
        $('#user-list').append('<div class="username"><i class="fa fa-user" aria-hidden="true"></i> ' + key + '</div>');
    });
}  

socket.on('connect', addUser);
socket.on('userList', updateUsers);

$(function(){
    bindDOMEvents();
})




// notes: 

// ENABLE USERNAME INPUT ONLY IF USER HAS BEEN SUBMITTED FOR THE CHAT, possible solution for the other app using react