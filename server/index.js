

const express = require('express')
const socketio = require('socket.io')
const http = require('http')

const app = express()
const PORT = process.env.PORT || 5000

const {addUser, removeUser, getUser, getUserInRoom} = require('./users.js')

const router = require('./router')

const server = http.createServer(app)
const io = socketio(server)
io.on('connection', (socket) => {
    console.log('We have connection')
    socket.on('join', ({name, room}, callback) =>{
        const {error, user} = addUser({id: socket.id, name, room})

        if(error) return callback(error)
        socket.emit('message', {user: 'admin',text: `Hi ${user.name}, welcome to the room ${user.room}`})
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text:`${user.name}, has joined!`})
        socket.join(user.room)
        io.to(user.room).emit('roomData', {room: user.room, users: getUserInRoom(user.room)})
        callback()
    })
    
    socket.on('sendMessage', (message, callback) =>{
        const user = getUser(socket.id)

        io.to(user.room).emit('message',{user: user.name, text: message})
        io.to(user.room).emit('roomData',{room: user.room, users: getUserInRoom(user.room)})
        callback()
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',{user: 'admin', text: `${user.name} has left!`})
        }
    })
})



app.use(router)
server.listen(PORT, () => console.log('Server has started'))