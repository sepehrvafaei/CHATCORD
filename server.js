const express=require('express');
const path=require('path');
const http=require('http');
const socketio=require('socket.io');
const formatMessage=require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers}=require('./utils/users');

const app=express();
const server=http.createServer(app);
const io=socketio(server);
const botName='ChatCord Bot';

app.use(express.static(path.join(__dirname,'public')));

io.on('connection',socket=>{
    socket.on('joinRoom',({userName,room})=>{
        const user=userJoin(socket.id,userName,room);
        socket.join(user.room);
        socket.emit('message',formatMessage(botName,'Welcome to ChatCord'));
        socket.broadcast.to(user.room).emit(
            'message',formatMessage(botName, `${user.userName} has joined the chat`));
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });
    socket.on('chatMessage',msg=>{
        const user=getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.userName,msg));
    });
    socket.on('disconnect',()=>{
        const user=userLeave(socket.id);
        if(user.id){
            io.to(user.room).emit('message',formatMessage(botName,`${user.userName} has left the chat.`));
        }
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });
});

const PORT=3000 || process.env.PORT;

server.listen(PORT,()=>console.log(`server running on port ${PORT}`));
