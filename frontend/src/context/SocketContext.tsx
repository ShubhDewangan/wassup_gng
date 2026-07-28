/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useAuth } from "./AuthContext";
import { createContext, useContext, useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

interface SocketContextType {
    socket: WebSocket | null
    isConnected: boolean
    onlineUsers: string[]
    sendMessage: (type: string, payload: any) => void
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineUsers: [],
    sendMessage: () => {}
})

export const SocketProvider = ({ children }: { children: React.ReactNode}) => {
    const { token } = useAuth()
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [ onlineUsers, setOnlineUsers ] = useState<string[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const wsRef = useRef<WebSocket | null>(null)
    // const navigate = useNavigate()
    
    useEffect(() => {

        if (!token) return

        const socket = new WebSocket(`${import.meta.env.VITE_PUBLIC_WS_URL}/?token=${token}`)
        wsRef.current = socket

        socket.onopen = () => {
            console.log('You are Online!')
            setIsConnected(true)
            setSocket(socket)
            // navigate('/chat')
        }

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)

                // console.log(data)
                if (data.event === 'presence:initial_list') {
                    setOnlineUsers(data.data)
                    // console.log(data.data)
                } else if (data.event === 'presence:online') {
                    setOnlineUsers(prev => prev.includes(data.data) ? prev : [...prev, data.data])
                } else if (data.event === 'presence:offline') {
                    setOnlineUsers(prev => prev.filter((user) => user !== data.data))
                }
                
            } catch (error) {
                console.log(error)
            }
        }

        socket.onclose = () => {
            console.log('You are Offline!')
            setIsConnected(false)
            setSocket(null)
        }

        socket.onerror = (error) => {
            console.log('Connection error: ', error)
        }

        return () => {
            socket.close()
        }
    }, [token])

    const sendMessage = (type: string, payload: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, payload }))
        } else {
            console.log('Cannot able to send this message!')
        }
    }

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineUsers, sendMessage }}>{children}</SocketContext.Provider>
    )
}

export const useSocket = () => useContext(SocketContext)