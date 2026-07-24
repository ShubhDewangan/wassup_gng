/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { apiFetch } from '../lib/fetcher'

interface SocketContextType {
    Socket: WebSocket | null
    IsConnected: boolean
    OnlineUsers: string[]
    sendMessage: (type: string, payload: any) => void
}

const SocketContext = createContext<SocketContextType>({
    Socket: null,
    IsConnected: false,
    OnlineUsers: [],
    sendMessage: () => {}
})

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [IsConnected, SetIsConnected] = useState<boolean>(false)
    const [Socket, SetSocket] = useState<WebSocket | null>(null)
    const [OnlineUsers, SetOnlineUsers] = useState<string[]>([])
    const [token, setToken] = useState('')
    const wsRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        const fetchToken = async () => {
            try {
            const data = await apiFetch('/api/auth/status')
            setToken(data.token)
        } catch (error) {
            console.log(error)
        }
        }

        fetchToken()
    },[])

    useEffect(() => { 
        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
            console.log('You are Online!')
            SetIsConnected(true)
            SetSocket(ws)
        }

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)

                switch (data.type) {
                    case 'ONLINE_USERS':
                        SetOnlineUsers(data.payload)
                        break
                    default: 
                        break
                }
            } catch (error) {
                console.log('Error parsing WS server',error)
            }
        }

        ws.close = () => {
            console.log('You are offline!')
            SetIsConnected(false)
            SetSocket(null)
        }

        ws.onerror = (error) => {
            console.log('WS server error', error)
        }

        return () => {
            ws.close()
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
        <SocketContext.Provider value={{Socket, IsConnected, OnlineUsers, sendMessage}}>{children}</SocketContext.Provider>
    )
}

export const useSocket = () => useContext(SocketContext)