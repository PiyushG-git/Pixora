import axios from "axios"

const api = axios.create({
    baseURL: '',
    withCredentials: true
})

// Get top users sorted by follower count (highest to lowest)
export async function getTopCreators() {
    const response = await api.get('/api/users/top')
    return response.data
}

// Follow a user by username (requires auth — handled by backend)
export async function followUser(username) {
    const response = await api.post(`/api/users/follow/${username}`)
    return response.data
}

// Unfollow a user by username (requires auth — handled by backend)
export async function unfollowUser(username) {
    const response = await api.post(`/api/users/unfollow/${username}`)
    return response.data
}
