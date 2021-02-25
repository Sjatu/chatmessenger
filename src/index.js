const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const generateMessage = require('./utils/messages.js')
const { addUser, removeUser, getUser, getUsersInRoom , getUserByName} = require('./utils/users.js')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection' , (socket) => {
    
    socket.on('join' , (options , callback) => {
        const { error, user } = addUser({ id: socket.id , ...options })
        if (error) {
            return callback(error)
        }
        
        socket.join(user.room)
        
        socket.emit( 'receive' , generateMessage('Admin',`Welcome! ${user.username}`) )
        socket.broadcast.to( user.room ).emit('receive' , generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage' , ({message,sendTo} , callback) => {
        if (message) {
            const user = getUser(socket.id)

            const filter = new Filter()
            if(filter.isProfane(message)) {
                return callback({username:'Admin', message: 'Profanity is not allowed!'})
            }

            var msg = message.trim()
            if(user) {
                if (sendTo) {
                    const userTo = getUserByName(sendTo)
                    io.to(userTo.id).emit('whisper', generateMessage(`[${user.username}] `,msg))
                    socket.emit( 'whisper' , generateMessage('You',`[${userTo.username}] : ${msg}`) )
                }
                else {
                    socket.broadcast.to( user.room ).emit('receive' , generateMessage(user.username,message))
                    callback({username:'You', message})    
                }
            }
       }
    })

    socket.on('typing', (data) => {
        const user = getUser(socket.id)
        if(user){
            socket.broadcast.to( user.room ).emit('typing',data)
        }
    })


    socket.on('disconnect' , () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('receive' , generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})

server.listen(port, () => {
    console.log(`Server is up at port: ${port}!`)
})