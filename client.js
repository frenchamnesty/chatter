// set chat window height
function setHeight(){
    $('.slimScrollDiv').height('400');
    $('.slimScrollDiv').css('overflow', 'visible')
}

// DOM EVENTS - DOM EVENTS - DOM EVENTS -
// ---------------------------------------

// bind dom events to handler/etc functions
function bindDOMEvents(){
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

    $('#room-list li').on('click', function(){
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

function appendUser(data) {
    chatter.debug.users = data.users;
    $('#user-list').append('<span id="#online" class="statusIndicator"></span><li class="username" key=' + data.userId + '>' + data.username + '</li>');
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

    swal({
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
// notes: 

// ENABLE USERNAME INPUT ONLY IF USER HAS BEEN SUBMITTED FOR THE CHAT, possible solution for the other app using react
$(function(){
    window.chatter = {};
    var chatter = window.chatter;
    var currentRoom = null;
    var local;
    var socket;

    chatter.debug = {}

    try {
        local = 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        local = false;
    }

    function socketConnect() {
        socket = io.connect('http://localhost:3000');
    }

    function socketHandle(){
        socket.on('connect', function (data) {
            chatter.connected = true;
            console.log('connected!');
            addNewUser();
            return;
        })

        socket.on('chat', function(recv) {
            var msg = JSON.parse(recv);
            console.log('msg: ', msg);
            handleChatMessage(msg);
        })
    }

    function handleChatMessage(recv) {
        var action = recv.action;
        console.log('action: ', action);

        if (action === 'userList'){
            var usersOnline = recv.users;
            var numberOfUsers = recv.count;

            $('#users-online').text("(" + numberOfUsers + ")");
            $('#user-list').empty();

            for (var id in usersOnline) {
                var userMetaData = usersOnline[id]

                $('#user-list').append('<div class="username" uid="' + userMetaData.uid + '"><i class="fa fa-user" aria-hidden="true"></i>' + userMetaData.name + '</div>');
            }
        }

        if (action === 'message') {
            chatter.typing = false;
            var id = recv.data.user.uid;
            var username = recv.data.user.name;
            var msg = recv.data.msg;

            addMessage(username, msg, true, true);

            // TODO: do alerts?/notifications?
        }

        if (action === 'usertyping') {
            chatter.typing = true;
            handleIsTypingIndicator(recv);
        }
    }

    function handleIsTypingIndicator(recv) {
        var username = recv.data.name;

        if (!chatter.typing) {
            return;
        }

        $('li#isTyping').text(`${username} is typing...`).removeClass('isTyping');

        setTimeout(function() {
            $('li#isTyping').addClass('isTyping');
        }, 2000);
    }

    function addNewUser(data) {
        swal({
            title: "what's your username?",
            type: "input",
            showCancelButton: false,
            closeOnConfirm: false,
            animation: "slide-from-top",
            inputPlaceholder: "enter name here"
        }, function (inputValue) {
            if (inputValue === false) return false;

            if (inputValue === "") {
                swal.showInputError("enter a valid username");
                return false;
            }

            if (inputValue.length <= 3) {
                swal.showInputError("username must be at least 4 characters");
                return false;
            }

            inputValue = inputValue.replace(/<(?:.|\n)*?>/gm, '');
            swal("all set!", "welcome " + inputValue + ', let the chatter begin');

            joinChat(inputValue);

            $('#log').animate({
                'opacity': 0
            }, 200, function () {
                $(this).hide();
                $('#m').focus();
            })
        });
    }

    function joinChat(username){
        socket.emit('join', {
            'uid': null, 
            'name': username
        }, function(data) {
            var received = JSON.parse(data);

            if (received.join === 'successful') {
                chatter.currentUser = received.config;
            }
        })
    }

    function bindChatterDOMEvents(){
        var html = [
            '<li class="isTyping isTypingVisible" id="isTyping">',
            '<span id="typing-user" class="fl text"></span>',
            '</li>'
        ].join("");

        var $typingTemplate = $.tmpl(html, {
            username: 'null'
        })

        $('#messages-log ul').append($typingTemplate);

        $('.chat-input input').on('keydown', function (e) {
            var key = e.which || e.keyCode;

            if (key == 13) {
                handleMessage();
            }
        })

        $('.chat-submit button').on('click', function (e) {
            handleMessage();
        })

        $('input#chat-input').keyup(function(e) {
            showUserIsTyping(chatter.currentUser)
        })

        $('#room-list').on('scroll', function () {
            $('#room-list li.selected').css('top', $(this).scrollTop());
        })
    }
    
    function showUserIsTyping(user){
        var isTypingTimeout;

        if (!!isTypingTimeout) {
            clearTimeout(isTypingTimeout);
        } else {
            isTypingTimeout = setTimeout(function () {
                socket.emit('usertyping', {
                    'user': user
                })
            }, 100)
        }
    }

    function handleMessage() {
        var message = $('.chat-input input').val().trim();
        var username = chatter.currentUser.name;

        if (message) {
            socket.emit('message', {
                'user': username,
                'message': message
            }, function(data) {
                var received = JSON.parse(data);

                if (received.success) {
                    $('.chat-input input').val('');
                } else {
                    console.log('there was an error with the chat going through');
                }
            });
        } else {
            console.log('chat did not go through');
        }
    }

    // add message to chat window
    function addMessage(sender, message, showTime, isSelf) {
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

        if (isSelf) {
            $('#messages-log ul').addClass('message-sender');
        }

        $('#messages-log ul').append($msgTemplate);
        $('#messages-log').animate({
            scrollTop: $('.messages-log ul').height()
        }, 100);
    }

    socketConnect();
    socketHandle();
    bindChatterDOMEvents()
})


// $(function(){
//     socket.on('presence', function(data){
//         if(data.state === 'online'){
//             addUserToRoom(data.user, true);
//         } else if (data.state === 'offline'){
//             removeUser(data.user, true);
//         }
//     })

//     socket.on('roomslist', function(data){
//         chatter.debug.rooms = data.rooms;
//         for (var i = 0, len = data.rooms.length; i < len; i++){
//             if (data.rooms[i] !== ''){
//                 createRoom(data.rooms[i], false);
//             }
//         }
//     })

//     socket.on('roomUsers', function(data){
//         console.log('roomUsers');
//         createRoom(data.room, false);
//         setCurrentRoom(data.room);

//         addUserToRoom({ username: username, userId: userId }, false, true );

//         for(var i = 0, len = data.users.length; i < len; i++){
//             if (data.users[i]){
//                 addUserToRoom(data.users[i], false)
//             }
//         }
//     })

//     socket.on('createroom', function(data){
//         createRoom(data.room, true);
//     });

//     socket.on('deleteroom', function(data){
//         deleteRoom(data.room, true);
//     })

//     function changeStatus(status){
//         if(status === -1){
//             $('.statusIndicator').addClass('offline').removeClass('connecting');
//         } else if (status === 0) {
//             $('.statusIndicator').removeClass('offline').addClass('connecting');
//         } else if (status === 1){
//             $('.statusIndicator').removeClass('offline').removeClass('connecting');
//         }
//     }

//     function updateUsersOnlineList(data, action){
//         if (data.userCount !== undefined){
//             var num = parseInt(data.userCount);

//             $('.onlineNum').text(num);
//         }
//     }

//     function updateTyping() {
//         return false;
        
//         if (connected) {

//             if (!typing) {
//                 typing = true;
//                 socket.emit('typing');
//             }

//             lastTypingTime = (new Date()).getTime();

//             setTimeout(function() {
//                 var typingTimer = (new Date()).getTime();
//                 var timeDiff = typingTimer - lastTypingTime;
//                 if (timeDiff >= 500 && typing) {
//                 socket.emit('stop typing');
//                 typing = false;
//                 }
//             }, 500);
//         }
//     }
// })