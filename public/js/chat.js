const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#messageText')
const $messageFormButton = document.querySelector('#send-message')
const $messages = document.querySelector('#messages')


const $userNameForm1Input = document.querySelector('#userNameForm1')
const $roomNameForm1Input = document.querySelector('#roomNameForm1')

$('#chatContainer').hide();
$userNameForm1Input.focus();

var audio = new Audio('ting.mp3');
var coin = new Audio('errors.mp3');

document.querySelector('#userForm').addEventListener('submit',(e) => {
    e.preventDefault()
    
    socket.emit('join' , { username:$userNameForm1Input.value , room:$roomNameForm1Input.value } , (error) => {
        if (error) {
            $('#nickError').html(error)
            $userNameForm1Input.focus();
            coin.play();
            $userNameForm1Input.value = ''
        } else {
            $('#userNameContainer').hide(1000);
            $('#chatContainer').show(2000);
            $messageFormInput.focus()    
        }
        $userNameForm1Input.value = ''
    })

    var userName = document.getElementById('userNameForm1').value
    document.querySelector('#handleName').innerHTML = userName[0].toUpperCase()+userName.slice(1).toLowerCase().trim()


})


var feedback = document.getElementById('feedback');
    
$messageFormInput.addEventListener("textInput", () => {
    var userName = document.getElementById('handleName').innerHTML
    socket.emit('typing', userName)
})

socket.on('typing', (data) => {
    feedback.innerHTML = '<p><em>' + data + ' is typing...</em></p>';
})





const autoscroll = () => $messages.scrollTop = $messages.scrollHeight

socket.on('receive' , (message) => {
    feedback.innerHTML = '';
    if(message.username == 'Admin'){
        $('#messages').append(`<div class="media w-50 mb-3">
                            <div class="media-body ml-3">
                                <div class="rounded py-2 px-3 mb-2" style="background-color:#c7ecee;">
                                <span class="small font-weight-bold text-muted">${message.username} : </span>
                                    <p class="text-small mb-0 text-muted">${message.text}</p>
                                </div>
                                <p class="small float-right my-0 font-italic" style="color:#cccccc;">${moment(message.createdAt).format('h:mm A')}</p>
                            </div>
                        </div>`)
                        audio.play();
    } else {
        $('#messages').append(`<div class="media w-50 mb-3">
                            <div class="media-body ml-3">
                                <div class="rounded py-2 px-3 mb-2" style="background-color:#81ecec;">
                                <span class="small font-weight-bold text-muted">${message.username} : </span>
                                    <p class="text-small mb-0 text-muted">${message.text}</p>
                                </div>
                                <p class="small float-right my-0 font-italic" style="color:#cccccc;">${moment(message.createdAt).format('h:mm A')}</p>
                            </div>
                        </div>`)
                        audio.play();
    }
    autoscroll()
})

socket.on('whisper' , (message) => {
    feedback.innerHTML = '';
    if(message.username === 'You'){
        $('#messages').append(`<div class="media w-50 ml-auto mb-3">
                            <div class="media-body ml-3 font-italic">
                                <div class="bg-dark rounded py-2 px-3 mb-2" style="color:#dfe6e9;">
                                <span class="small font-weight-bold"><b>${message.username} : </b></span>
                                    <p class="text-small mb-2 font-italic">${message.text}</p>
                                </div>
                                <p class="small float-right my-0 font-italic" style="color:#cccccc;">${moment(message.createdAt).format('h:mm A')}</p>
                            </div>
                        </div>`)
    } else {
        $('#messages').append(`<div class="media w-50 mb-3">
                            <div class="media-body ml-3 font-italic">
                                <div class="bg-dark rounded py-2 px-3 mb-2" style="color:#dfe6e9;">
                                <span class="small font-weight-bold"><b>${message.username} : </b></span>
                                    <p class="text-small mb-2">${message.text}</p>
                                </div>
                                <p class="small float-right my-0 font-italic" style="color:#cccccc;">${moment(message.createdAt).format('h:mm A')}</p>
                            </div>
                        </div>`)
                        audio.play();
    }
    autoscroll()
})


socket.on('roomData',({ room, users }) => {
    
    var html = '';
    var options = `<option value="" selected>All</option>`;
    var userName = document.querySelector('#handleName').innerHTML
    
        for (var i = 0; i < users.length; i++) {
            if(users[i].username != userName){
            html += `<div class="list-group-item border-0 rounded-0" style="background-color: rgba(255,255,255,0.2);"><i class="fa text-light fa-2x fa-user float-left" aria-hidden="true"></i>
            <h6 class="ml-3 mt-1 text-white float-left">${users[i].username}</h6>
        </div>`
    
            options += `<option value="${users[i].username}">${users[i].username}</option>`
            }
        }

    document.querySelector('#sidebar').innerHTML = html
    document.querySelector('#roomName').innerHTML = room
    document.querySelector('#sendTo').innerHTML = options
    document.querySelector('#activeUsersCount').innerHTML = `(${users.length})`

})

document.querySelector('#message-form').addEventListener('submit',(e) => {
    e.preventDefault()
    var sendTo = document.getElementById("sendTo").value
    const message = document.querySelector("#messageText").value
    $messageFormInput.value = ''
    document.getElementById("sendTo").value = ''
    socket.emit('sendMessage' , {message, sendTo} , (data) => {
        if(data.username == 'Admin') {
            $('#messages').append(`<div class="media w-50 mb-3 ml-auto ">
                                <div class="media-body ml-3">
                                    <div class="bg-danger rounded py-2 px-3 mb-2">
                                    <span class="small font-weight-bold text-white">${data.username} : </span>
                                        <p class="text-small mb-0 text-white">${data.message}</p>
                                    </div>
                                    <p class="small float-right my-0 font-italic" style="color:#cccccc;">${moment(message.createdAt).format('h:mm A')}</p>
                                </div>
                            </div>`)
                            coin.play();
        }
        else{
            $('#messages').append(`<div class="media w-50 mb-3 ml-auto ">
                                <div class="media-body ml-3">
                                    <div class="rounded py-2 px-3 mb-2" style="background-color:#0984e3;">
                                    <span class="small font-weight-bold text-white">${data.username} : </span>
                                        <p class="text-small mb-0 text-white">${data.message}</p>
                                    </div>
                                    <p class="small float-right my-0 font-italic" style="color:#cccccc;">${moment(message.createdAt).format('h:mm A')}</p>
                                </div>
                            </div>`)
        }
        autoscroll()
        $messageFormInput.focus()
    })
 })
