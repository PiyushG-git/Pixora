import axios from "axios"

const api = axios.create({
    baseURL: '',
    withCredentials: true
})

export async function getFeed() {
    const response = await api.get('/api/posts/feed')
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

// Search posts by caption or username using $regex
export async function searchPosts(query) {
    const response = await api.get(`/api/posts/search?q=${encodeURIComponent(query)}`)
    return response.data
}

// Get posts sorted by like count (highest to lowest)
export async function getPopularPosts() {
    const response = await api.get('/api/posts/popular')
    return response.data
}