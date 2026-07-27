import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export const SecuredRoute = () => {
    const { isAuthenticated, loading: isLoading } = useAuth()

    if (isLoading) {
        return <div>Recognising You</div>
    } 

    return isAuthenticated ? <Outlet /> : <Navigate to='/auth' replace />
}