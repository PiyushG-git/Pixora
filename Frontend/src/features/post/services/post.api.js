import axios from "axios"

const api = axios.create({
    baseURL: '',
    withCredentials: true
})

export async function getFeed(page = 1, limit = 10) {
    const response = await api.get(`/api/posts/feed?page=${page}&limit=${limit}`)
    return response.data
}

export async function createPost(imageFile, caption) {
    const formData = new FormData()
    formData.append("image", imageFile)
    formData.append('caption', caption)
    const response = await api.post("/api/posts", formData)
    return response.data
}

export async function likePost(postId) {
    const response = await api.post("/api/posts/like/" + postId)
    return response.data
}

export async function unLikePost(postId) {
    const response = await api.post("/api/posts/unlike/" + postId)
    return response.data
}

export async function deletePost(postId) {
    const response = await api.delete("/api/posts/" + postId)
    return response.data
}

// Search posts by caption or username using $regex
export async function searchPosts(query, page = 1, limit = 10) {
    const response = await api.get(`/api/posts/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
    return response.data
}

// Get posts sorted by like count (highest to lowest)
export async function getPopularPosts(page = 1, limit = 10) {
    const response = await api.get(`/api/posts/popular?page=${page}&limit=${limit}`)
    return response.data
}