import { apiFetch } from "../lib/fetcher"

export const fetchUserService = async (userId: string) => {
    const req = await apiFetch(`/api/user/${userId}`)
    return req.user
}

export const fetchContacts = async () => {
    const req = await apiFetch('/api/user/all-users')
    return req.users
}