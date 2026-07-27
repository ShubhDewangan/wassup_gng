/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueries, useQuery } from '@tanstack/react-query'
import { fetchUserService } from '../services/user.service'

type UserData = {
    _id: any,
    name: string,
    email: string,
    avatar?: string,
    googleId?: string
}

export const useOtherUser = (userId: string) => {
    return useQuery({
        queryKey: ['otherUser', userId],
        queryFn: () => fetchUserService(userId!),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000
    })
}

export const useMultipleUser = (userIds: string[]) => {
    const results = useQueries({
        queries: userIds.map((id: string) => ({
            queryKey: ['otherUser', id],
            queryFn: () => fetchUserService(id!),
            staleTime: 5 * 60 * 1000
        }))
    })

    const isLoading = results.some((result) =>  result.isLoading)
    const isError = results.some((result) => result.isError)

    const users = results
        .map((result) => result.data)
        .filter((user): user is UserData => !!user)

    return { users, isLoading, isError }
}