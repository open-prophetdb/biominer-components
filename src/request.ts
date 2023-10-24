import axios from 'axios';

export const request = axios.create({
  timeout: 1000,
  headers: {
    Authorization: 'Bearer ' + localStorage.getItem('token') || 'my-token',
  },
});
