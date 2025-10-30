import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_API_URL } from '$env/static/public';

let cachedUser = null;

const initialValue = browser && typeof window !== 'undefined'
  ? JSON.parse(window.localStorage.getItem('user')) ?? null
  : null;

export const user = writable(initialValue);
cachedUser = initialValue;

// Save only safe fields to localStorage (no tokens)
function saveUserToLocalStorage(userData) {
  if (browser && typeof window !== 'undefined') {
    const { access_token, ...userWithoutToken } = userData || {};
    localStorage.setItem('user', JSON.stringify(userWithoutToken));
  }
}

// Clear both store and localStorage
function clearUser() {
  user.set(null);
  cachedUser = null;
  if (browser && typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

// Update in-memory store with access_token, but only save safe fields
export function loginUser(userData) {
  const { access_token, ...userWithoutToken } = userData;
  cachedUser = { ...userWithoutToken, access_token };
  user.set(cachedUser);
  saveUserToLocalStorage(userWithoutToken);
  initializeTokenRefresh();
}

export function updateUser(newData) {
  user.update(currentUser => {
    const updatedUser = { ...currentUser, ...newData };
    const { access_token, ...userWithoutToken } = updatedUser;
    cachedUser = updatedUser;
    saveUserToLocalStorage(userWithoutToken);
    return updatedUser;
  });
}

export function logoutUser() {
  clearUser();
  fetch(`${PUBLIC_API_URL}/user/logout`, {
    method: 'POST',
    credentials: 'include'
  });
}

// Token refresh logic
async function refreshAccessToken() {
  try {
    const res = await fetch(`${PUBLIC_API_URL}/user/token/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Failed to refresh access token');

    const data = await res.json();
    user.update(u => {
      const newUser = { ...u, access_token: data.access_token };
      cachedUser = newUser;
      return newUser;
    });
    console.log('Access token refreshed');
    return data.access_token;
  } catch (err) {
    console.error('Token refresh failed:', err);
    logoutUser();
    return null;
  }
}

let refreshInterval = null;

function initializeTokenRefresh() {
  if (refreshInterval) return;
  refreshAccessToken();
  refreshInterval = setInterval(refreshAccessToken, 9 * 60 * 1000);
}

export function checkUser() {
  if (cachedUser) {
    user.set(cachedUser);
    initializeTokenRefresh();
  } else if (browser && typeof window !== 'undefined') {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      const parsed = JSON.parse(localUser);
      cachedUser = parsed;
      user.set(parsed);
      initializeTokenRefresh();
    }
  }
}

checkUser();
