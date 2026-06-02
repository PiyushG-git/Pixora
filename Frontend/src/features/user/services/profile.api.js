import axios from "axios";

const api = axios.create({
    baseURL: '/api/users',
    withCredentials: true
});

export async function getUserProfile(username, page = 1, limit = 10) {
    const response = await api.get(`/profile/${username}?page=${page}&limit=${limit}`);
    return response.data;
}

export async function updateProfile(formData) {
    const response = await api.put(`/profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
}
