import axios from 'axios';

const client = axios.create({
    baseURL: 'http://localhost:1337/api'
});

export const setAuthHeader = (token) => {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const onSuccess = function (response) {
    return response.data;
};

const onError = function (error) {
    console.error('Request Failed:', error.config);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
        if (error.response.data.status === 401 && invalidTokenMessages.includes(error.response.data.message)) {
            localStorage.removeItem('token');
            location.reload();
        }
    } else {
        console.error('Error Message:', error.message);
    }

    return Promise.reject({
        errMsg: !error?.response
            ? 'Network Issue!'
            : error?.response?.data?.message || error?.response?.data?.errors[0].param + ' ' + error?.response?.data?.errors[0].msg,
        status: error?.response?.status || 'not status'
    });
};

client.interceptors.response.use(onSuccess, onError);
export default client;

const invalidTokenMessages = ['Session has been expired!', 'Invalid token', 'invalid signature'];
