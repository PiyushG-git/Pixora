import axios from "axios";

const api = axios.create({
    baseURL: `/api/auth`,
    withCredentials: true,
})

export async function login(username, password) {
    const response = await api.post('/login', { username, password })
    return response.data
}

export async function register(formData) {
    const response = await api.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
}

export async function getMe() {
    const response = await api.get('/get-me')
    return response.data
}

export async function logout() {
    const response = await api.post('/logout')
    return response.data
}