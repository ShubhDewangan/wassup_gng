import { Navigate, Route, Routes } from "react-router-dom"
import { SecuredRoute } from "./Secure-Route"
import GoogleAuth from "../pages/auth/GoogleAuth"
import LogoutPage from "../pages/auth/LogoutPage"
import ChatLayout from "../pages/chat/ChatLayout"
import EmptyChatState from "../pages/chat/EmptyChatState"
import ActiveChatState from "../pages/chat/ActiveChatState"

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/auth' element={<GoogleAuth />} />

            <Route element={<SecuredRoute />}>
                <Route path="/chat/" element={<ChatLayout />}>
                    <Route index element={<EmptyChatState />} />
                    <Route path=":id" element={<ActiveChatState />} />
                </Route>
                <Route path="/logout" element={<LogoutPage />} />
            </Route>

            <Route path='*' element={<Navigate to='/chat' replace />} />
        </Routes>
    )
}