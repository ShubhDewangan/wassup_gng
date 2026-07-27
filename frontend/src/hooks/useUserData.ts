import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../context/AuthContext"
import { fetchUserService } from "../services/user.service"

export const useUserData = () => {
    const { user, loading: isAuthLoading } = useAuth()
    return useQuery({
        queryKey: ['userProfile', user?._id],
        queryFn: () => fetchUserService(user?._id),
        enabled: !!user?._id && isAuthLoading,
        initialData: user,
        staleTime: 5 * 60 * 1000
    })
}