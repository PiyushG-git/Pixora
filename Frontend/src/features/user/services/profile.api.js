import axios from "axios";

const api = axios.create({
    baseURL: '/api/users',
    withCredentials: true
});

export async function getUserProfile(username) {
    const response = await api.get(`/profile/${username}`);
    return response.data;
}

export async function updateProfile(formData) {
    const response = await api.put(`/profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
}
