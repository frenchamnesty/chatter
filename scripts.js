// GLOBAL GLOBAL GLOBAL GLOBAL GLOBAL GLOBAL
// ---------------------------------------

var socket = io.connect('http://localhost:3000');
var userId = null;
var username = null;
var currentRoom = null;
var roomId = null;
var room = null;
var serverDisplayName = 'Server';

var local;

try {
    local = 'localStorage' in window && window['localStorage'] !== null;
} catch(e){
    local = false;
}

// set chat window height

function setHeight(){
    $('.slimScrollDiv').height('400');
    $('.slimScrollDiv').css('overflow', 'visible')
}

// DOM EVENTS - DOM EVENTS - DOM EVENTS -
// ---------------------------------------

// bind dom events to handler/etc functions
function bindDOMEvents(){
    $('.chat-input input').on('keydown', function(e){
        console.log('user typing');

        handleUsertyping(e);
        var key = e.which || e.keyCode;

        if(key == 13) {
            handleMessage();
        }
    })

    $('.chat-submit button').on('click', function(){
        handleMessage();
    })

    $('#room-list ul').on('scroll', function(){
        $('#room-list ul li.selected').css('top', $(this).scrollTop());
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

    $('#room-list ul li').on('click', function(){
        console.log('clicking on room');
        var room = $(this).attr('data-roomId');
        if(room != currentRoom){
            socket.emit('leaveRoom', { room: currentRoom });
            socket.emit('join', { room: room });
        }
    })

    $('#createRoom').on('click', function(){
        console.log('click create room event');
        $('#chatlog-header').empty();
        createRoom();
    })
}

// TIME TIME TIME TIME TIME TIME TIME TIME
// --------------------------------------- 

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


// USER USER USER USER USER USER USER USER
// ---------------------------------------

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

        $('#user-list').append('<span id="#online" class="statusIndicator"></span><li class="username" key=' + userId + '>' + username + '</li>' );

     });
}

function removeUser(user, announced){
    $('user-list ul li[data-userId="' + user.userId + '"]').remove();

    if(announce){
        insertMessage(serverDisplayName, user.username + ' has left the chat...', true, false, true )
    }
}

function updateUsers(usernames){
    $('#user-list').empty();
    $.each(users, function(key, value){
        $('#user-list').append('<div class="username"><i class="fa fa-user" aria-hidden="true"></i> ' + key + '</div>');
    });
}  

// TYPING TYPING TYPING TYPING TYPING TYPING TYPING TYPING
// ---------------------------------------


function handleUsertyping(recv){
    var userId = recv.userId;
    var main = $('#messages-log' + userId);
    socket.emit('isTyping', { user: userId })
    if (main.parent().find('#isTyping').first().hasClass('no-display')){
        main.parent().find('#isTyping').first().removeClass('no-display');

        setTimeout(function(){
            main.parent().find('#isTyping').first().addClass('no-display');
        }, 2000)
    }
}

function handleChatEvents(id, user){

    $('#messages-log' + id).dialog({
        open: function(event, ui){
            var main = $('#messages-log' + userId);
            var username = main.data("username");

            main.parent().find('#isTyping').first().addClass('no-display');


            var typingTimeout;

            main.find('#chat-input').first().keyup(function(e){
                if(typingTimeout !== undefined) clearTimeout(typingTimeout);

                typingTimeout = setTimeout(function(){
                    call_user_is_typing(user)
                }, 400);

            })
        }
    })
}

function call_user_is_typing(user){
    socket.emit('user_typing', { 'user': user })
}

// MESSAGE MESSAGE MESSAGE MESSAGE MESSAGE 
// ---------------------------------------

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

    if(isSelf){
        $('#messages-log ul').addClass('message-sender');

        console.log('is self?');
    }

    $('#messages-log ul').append($msgTemplate);
    $('#messages-log').animate({ scrollTop: $('.messages-log ul').height() }, 100);
}

// ROOMS ROOMS ROOMS ROOMS ROOMS ROOMS ROOMS
// ---------------------------------------

function setCurrentRoom(room){
    console.log('set current room');
    currentRoom = room;

    $('.rooms-container ul li.selected').removeClass('selected');

    $('.rooms-container ul li[data-roomId="' + room + '"]').addClass('selected');
}

// add user to chat room
function addUserToRoom(user, announce, isSelf){
    console.log('add user to room');
    var userTemplate = [
        '<li data-userId="${userId}" class="user">',
        '<div class="username"><span class="icon"></span> ${username}</div>',
        '<div class="typing"></div>',
        '</li>'
    ]

    $html = $.tmpl(userTemplate, user);

    if(isSelf){
        $html.addClass('self');
    }

    if(announce){
        addMessage("Server", user.username, + 'has joined the chat...', true, false, true);
    }

    $html.appendTo('#messages-log ul');
}

// remove user from chat room
function removeUser(user, announce){
    $('.user-container ul li[data-userId="' + user.userId + '"]').remove();

    if(announce){
        addMessage("Server", user.username + ' has left the chat...', true, false, true);
    }
}

function createRoom(){
    console.log('create room');
    var roomTemplate = [
        '<li data-roomId="${room}">',
        '<span class="icon"></span> ${room}',
        '</li>'
    ]

    var createRoomPopUp = swal({
        title: "name your chatroom", 
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "enter title"
    }, function(inputValue){
        if (inputValue === false) return false;
        if (inputValue === ""){
            swal.showInputError("enter a valid name for your chat room");
            return false;
        }

        if(inputValue.length <= 3){
            swal.showInputError("the name of the chat room must be at least 4 characters");
            return false;
        }

        inputValue = inputValue.replace(/<(?:.|\n)*?>/gm, '');
        
        swal("success!", inputValue + ' has been created - users can now join the room');

        room = inputValue

        socket.emit('leaveRoom', { room: currentRoom });

        socket.emit('join', { room: room, roomId: roomId });

        $('#room-list').append('<li id="online" class="room" key=' + roomId + '>' + room + '</li>');

        $('#chatlog-header').append('<span id="#room-name" kye=' + roomId + '>' + room + '</span>');
    })

}



// SOCKET ON - SOCKET ON - SOCKET ON
// ----------------------------------------


function connect(){
    connected = true;
    addUser();


}




// notes: 

// ENABLE USERNAME INPUT ONLY IF USER HAS BEEN SUBMITTED FOR THE CHAT, possible solution for the other app using react


$(function(){
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var lastMentionedUser = '';
    var lastMentionedId = 0;
    var main = $(this);

    socket.on('connect', connect);
    bindDOMEvents();
    main.parent().find('#isTyping').first().addClass('no-display');

    socket.on('presence', function(data){
        if(data.state === 'online'){
            addUserToRoom(data.user, true);
        } else if (data.state === 'offline'){
            removeUser(data.user, true);
        }
    })

    socket.on('roomslist', function(data){
        for (var i = 0, len = data.rooms.length; i < len; i++){
            if (data.rooms[i] !== ''){
                createRoom(data.rooms[i], false);
            }
        }
    })

    socket.on('roomUsers', function(data){
        console.log('roomUsers');
        createRoom(data.room, false);
        setCurrentRoom(data.room);

        addUserToRoom({ username: username, userId: userId }, false, true );

        for(var i = 0, len = data.users.length; i < len; i++){
            if (data.users[i]){
                addUserToRoom(data.users[i], false)
            }
        }
    })

    socket.on('createroom', function(data){
        createRoom(data.room, true);
    });

    socket.on('deleteroom', function(data){
        deleteRoom(data.room, true);
    })

    function changeStatus(status){
        if(status === -1){
            $('.statusIndicator').addClass('offline').removeClass('connecting');
        } else if (status === 0) {
            $('.statusIndicator').removeClass('offline').addClass('connecting');
        } else if (status === 1){
            $('.statusIndicator').removeClass('offline').removeClass('connecting');
        }
    }

    function updateUsersOnlineList(data, action){
        if (data.userCount !== undefined){
            var num = parseInt(data.userCount);

            $('.onlineNum').text(num);
        }
    }

    function sendMessage(){
        var message = $('.chat-input input').val();

        if (message && connected){
            $('.chat-input').val('');

            socket.emit('chatmessage', {
                text: message,
                replyId: lastMentionId
            });

            lastMentionedId = 0;
            lastMentionedUser = "";
        }
    }

    function addChatTyping(data){
        addMessageElement(messageTypingTempalte(data))
    }

    function removeChatTyping(data){
        $('#isTyping' + data.user.id).remove();
    }

    function updateTyping() {
        return false;
        
        if (connected) {

            if (!typing) {
                typing = true;
                socket.emit('typing');
            }

            lastTypingTime = (new Date()).getTime();

            setTimeout(function() {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= 500 && typing) {
                socket.emit('stop typing');
                typing = false;
                }
            }, 500);
        }
    }
})