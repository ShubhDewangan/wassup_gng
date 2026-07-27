/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useEffect, useState } from "react"
import { apiFetch } from "../lib/fetcher"

interface User {
    _id: any
    name: string
    email: string
    avatar?: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    loading: boolean
    logout: () => void
    refetchUser: () => Promise<void>
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: false,
    logout: () => {},
    refetchUser: async () => {},
    isAuthenticated: false
})

const AuthProvider = ({children} : {children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState('')
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    
    const fetchUserDetails = async () => {
        try {
            const data = await apiFetch('/api/auth/status')
            setUser(data.user)
            setToken(data.token)
            setIsAuthenticated(true)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserDetails()
    },[])

    const logout = async () => {
        try {
            await apiFetch('/api/auth/logout')
        } catch (error) {
            console.log(error)
        } finally {
            setUser(null)
            setIsAuthenticated(false)
            window.location.href = '/auth'
        }
    }

    return (
        <AuthContext.Provider value={{user, token, loading, logout, refetchUser: fetchUserDetails, isAuthenticated}}>
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = () => useContext(AuthContext)

export { AuthProvider, useAuth }
