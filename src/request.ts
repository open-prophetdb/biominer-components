import axios from 'axios';

const token = localStorage.getItem('token') || 'my-token';

export const request = axios.create({
  baseURL: 'https://drugs.3steps.cn',
  timeout: 100000,
  headers: {
    Authorization: 'Bearer ' + token,
  },
});
