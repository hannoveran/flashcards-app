import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export async function register(
  username: string,
  email: string,
  password: string,
) {
  const res = await axios.post(`${API_URL}/register`, {
    username,
    email,
    password,
  });

  const token = res.data.token;
  saveToken(token);

  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  return res.data;
}

export async function login(email: string, password: string) {
  const res = await axios.post(`${API_URL}/login`, { email, password });

  const token = res.data.token;
  saveToken(token);

  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  return res.data;
}

export async function getProfile(token: string) {
  const res = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateProfile(
  token: string,
  username?: string,
  email?: string,
) {
  const res = await axios.put(
    `${API_URL}/me`,
    { username, email },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export function saveToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function removeToken() {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
