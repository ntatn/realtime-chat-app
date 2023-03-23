import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { useLocation } from 'react-router-dom'
import queryString from 'query-string'
import './Chat.css'
import InfoBar from '../InfoBar/InfoBar'
import Input from '../Input/Input'
import Messages from '../Messages/Messages'
import TextContainer from '../TextContainer/TextContainer'
let socket
const ENDPOINT = 'localhost:5000'
const Chat = () => {
    const [name, setName] = useState('')
    const [room, setRoom] = useState('')
    const [users, setUsers] = useState('');
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const { search } = useLocation()
    useEffect(() => {

        const { name, room } = queryString.parse(search)

        socket = io(ENDPOINT, { transports: ['websocket', 'polling', 'flashsocket'] })

        setName(name)
        setRoom(room)
        socket.emit('join', { name, room }, () => {

        })
        return () => {
            socket.emit('disconnect')
            socket.off()
        }
    }, [ENDPOINT, search])

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages([...messages, message])
        })
        socket.on("roomData", ({users})=>{
            setUsers(users)
        })
    }, [messages])

    const sendMessage = (event) => {
        event.preventDefault();
    
        if(message) {
          socket.emit('sendMessage', message, () => setMessage(''));
        }
      }
    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            </div>
            <TextContainer users={users} />
        </div>
    )
}

export default Chat