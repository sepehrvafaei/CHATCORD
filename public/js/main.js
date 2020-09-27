const chatForm=document.getElementById('chat-form');
const chatMessages= document.querySelector('.chat-messages');
const roomName=document.getElementById('room-name');
const roomUsers=document.getElementById('users');


const {userName,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});

const socket=io();

socket.emit('joinRoom',{userName,room});

socket.on('roomUsers',({room,users})=>{
    displayRoomName(room);
    displayRoomUsers(users);
});

socket.on('message',message=>{
    console.log(message);
    displayMessage(message);
    chatMessages.scrollTop=chatMessages.scrollHeight;
});

chatForm.addEventListener('submit',e=>{
    e.preventDefault();
    const msg=e.target.msg.value;
    socket.emit('chatMessage',msg);
    e.target.msg.value='';
    e.target.msg.focus();
})

function displayMessage(message){
    const div=document.createElement('div');
    div.classList.add('message');
    div.innerHTML=
    `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>`;
    chatMessages.appendChild(div);
}

function displayRoomName(room){
    roomName.innerHTML=room;
}

function displayRoomUsers(users){
    roomUsers.innerHTML=`${users.map(user=>`<li>${user.userName}</li>`).join('')}`;
}