/**
 * EdChange API OAuth Handler
 * 
 * Integrates Google Sign-In with your EdChange API (port 5000)
 * Handles token management, API calls, and authentication state
 */

// ════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════

const AUTH_CONFIG = {
  GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE', // Replace with your actual ID
  API_BASE_URL: 'http://localhost:4000', // Your EdChange API
  JWT_CHECK_INTERVAL: 5 * 60 * 1000, // Check token every 5 minutes
};

// Authentication state
let authState = {
  isAuthenticated: false,
  user: null,
  tokenExpiry: null
};

// ════════════════════════════════════════════════════════════
// INITIALIZATION - Run on Page Load
// ════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initializeGoogleSignIn();
  checkAuthStatus();
  setupTokenRefreshTimer();
  setupEventListeners();
});

/**
 * Initialize Google Sign-In Library
 * Load Google's authentication library and create sign-in button
 */
function initializeGoogleSignIn() {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  
  script.onload = () => {
    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
      client_id: AUTH_CONFIG.GOOGLE_CLIENT_ID,
      callback: handleGoogleSignInSuccess,
      auto_select: false,
      itp_support: true
    });

    // Render sign-in button on login page
    const signInButton = document.getElementById('google-signin-button');
    if (signInButton) {
      window.google.accounts.id.renderButton(
        signInButton,
        {
          theme: 'outline',
          size: 'large',
          width: '300',
          text: 'signin_with'
        }
      );
    }
  };

  document.head.appendChild(script);
}

/**
 * Handle successful Google Sign-In
 * Google calls this when user successfully authenticates
 * 
 * @param {Object} response - Contains credential (ID token from Google)
 */
async function handleGoogleSignInSuccess(response) {
  const idToken = response.credential;
  
  console.log('✅ Google Sign-In successful, sending token to EdChange API...');

  try {
    // Decode Google's ID token to get user info (without verification on frontend)
    // The backend will verify this token
    const googlePayload = JSON.parse(atob(idToken.split('.')[1]));
    
    // Call YOUR API endpoint
    const result = await fetch(`${AUTH_CONFIG.API_BASE_URL}/api/auth/oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // ✅ CRITICAL: Send cookies
      body: JSON.stringify({
        name: googlePayload.name,
        email: googlePayload.email,
        oauthProvider: 'google',
        oauthId: googlePayload.sub // Google's unique user ID
      })
    });

    const data = await result.json();

    if (result.ok) {
      console.log('✅ EdChange API verified token, user logged in:', data.user);
      
      // Update auth state
      authState.isAuthenticated = true;
      authState.user = data.user;
      
      // Redirect to home page
      window.location.href = '/';
    } else {
      console.error('❌ EdChange API rejected token:', data.message);
      alert('Login failed: ' + data.message);
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    alert('Network error during login. Please try again.');
  }
}

/**
 * Check current authentication status
 * Run on page load to restore session if user is logged in
 */
async function checkAuthStatus() {
  try {
    const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      credentials: 'include' // Include cookies
    });

    const data = await response.json();

    if (data.authenticated) {
      console.log('✅ User is authenticated:', data.user);
      authState.isAuthenticated = true;
      authState.user = data.user;
      
      // Update UI to show logged-in state
      updateUIForLoggedInUser(data.user);
    } else {
      console.log('ℹ️ User is not authenticated');
      authState.isAuthenticated = false;
      authState.user = null;
      
      // Update UI for logged-out state
      updateUIForLoggedOutUser();
    }
  } catch (error) {
    console.error('❌ Auth check failed:', error);
  }
}

/**
 * Update UI when user is logged in
 */
function updateUIForLoggedInUser(user) {
  // Hide login button
  const loginBtn = document.querySelector('.login-btn');
  if (loginBtn) loginBtn.style.display = 'none';

  // Show profile info in sidebar
  const userInfo = document.querySelector('.mini-profile');
  if (userInfo) {
    userInfo.innerHTML = `
      <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}" alt="Profile" class="avatar-md" style="width: 70px; height: 70px; border-radius: 50%; margin-bottom: 10px;">
      <h3>${user.name}</h3>
      <p>${user.email}</p>
      ${user.isFree ? '<p style="color: green; font-weight: bold;">✅ School Account</p>' : ''}
      <button id="logout-btn" class="login-btn" style="margin-top: 15px;">Logout</button>
    `;
    
    document.getElementById('logout-btn').addEventListener('click', logout);
  }
}

/**
 * Update UI when user is logged out
 */
function updateUIForLoggedOutUser() {
  // Show login button
  const loginBtn = document.querySelector('.login-btn');
  if (loginBtn) loginBtn.style.display = 'block';

  // Clear profile info
  const userInfo = document.querySelector('.mini-profile');
  if (userInfo) {
    userInfo.innerHTML = '<p>Not logged in</p>';
  }
}

// ════════════════════════════════════════════════════════════
// LOGOUT HANDLER
// ════════════════════════════════════════════════════════════

async function logout() {
  try {
    console.log('Logging out...');
    
    const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Logged out successfully');
      
      // Clear auth state
      authState.isAuthenticated = false;
      authState.user = null;
      
      // Redirect to login
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('❌ Logout error:', error);
    alert('Failed to logout. Please try again.');
  }
}

// ════════════════════════════════════════════════════════════
// API HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════

/**
 * Make authenticated API calls to your EdChange API
 * Automatically includes JWT in cookie
 * Automatically refreshes token if expired
 * 
 * @param {string} endpoint - API endpoint (e.g., '/api/posts')
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Object>} - API response
 * 
 * @example
 * const data = await apiCall('/api/user');
 * const newPost = await apiCall('/api/posts', {
 *   method: 'POST',
 *   body: JSON.stringify({ content: 'Hello' })
 * });
 */
async function apiCall(endpoint, options = {}) {
  const url = `${AUTH_CONFIG.API_BASE_URL}${endpoint}`;
  
  const fetchOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include' // ✅ Include cookies (JWT)
  };

  try {
    let response = await fetch(url, fetchOptions);

    // If token expired (401), try to refresh it
    if (response.status === 401) {
      const errorData = await response.json();
      
      if (errorData.expired) {
        console.log('🔄 Token expired, refreshing...');
        
        const refreshed = await refreshToken();
        
        if (refreshed) {
          // Retry the original request with new token
          response = await fetch(url, fetchOptions);
        } else {
          // Refresh failed, redirect to login
          window.location.href = '/login';
          return null;
        }
      } else {
        // Not authenticated, redirect to login
        window.location.href = '/login';
        return null;
      }
    }

    // Handle other errors
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error(`❌ API call to ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * Refresh JWT token using refresh token
 * Called when access token expires
 * 
 * @returns {Promise<boolean>} - true if successful, false otherwise
 */
async function refreshToken() {
  try {
    const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Token refreshed');
      return true;
    } else {
      console.error('❌ Token refresh failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Refresh error:', error);
    return false;
  }
}

/**
 * Set up timer to refresh token before expiry
 * Prevents user from being logged out mid-session
 */
function setupTokenRefreshTimer() {
  setInterval(() => {
    if (authState.isAuthenticated) {
      refreshToken();
    }
  }, AUTH_CONFIG.JWT_CHECK_INTERVAL);
}

// ════════════════════════════════════════════════════════════
// UI EVENT LISTENERS
// ════════════════════════════════════════════════════════════

function setupEventListeners() {
  // Logout button listener
  document.addEventListener('click', (e) => {
    if (e.target.id === 'logout-btn') {
      logout();
    }
  });
}

// ════════════════════════════════════════════════════════════
// EXPORT FOR USE IN OTHER SCRIPTS
// ════════════════════════════════════════════════════════════

/**
 * Global authManager object
 * Use in your app like: authManager.apiCall('/api/posts')
 */
window.authManager = {
  isAuthenticated: () => authState.isAuthenticated,
  getUser: () => authState.user,
  apiCall: apiCall,
  logout: logout,
  refreshToken: refreshToken
};

// ════════════════════════════════════════════════════════════
// USAGE EXAMPLES IN YOUR APP
// ════════════════════════════════════════════════════════════

/**
 * Example 1: Get user's profile
 * 
 * async function getUserProfile() {
 *   const data = await authManager.apiCall('/api/auth/user');
 *   console.log('User:', data.user);
 * }
 */

/**
 * Example 2: Check if user is logged in
 * 
 * if (authManager.isAuthenticated()) {
 *   console.log('User is logged in:', authManager.getUser());
 * } else {
 *   console.log('User is not logged in');
 * }
 */

/**
 * Example 3: Get all test users (debug endpoint)
 * 
 * async function getTestUsers() {
 *   const data = await authManager.apiCall('/api/auth/test-users');
 *   console.log('All users in DB:', data.users);
 * }
 */

/**
 * Example 4: Create a post (when you build that endpoint)
 * 
 * async function createPost(content) {
 *   const data = await authManager.apiCall('/api/posts', {
 *     method: 'POST',
 *     body: JSON.stringify({ content, author: authManager.getUser().email })
 *   });
 *   console.log('Post created:', data);
 * }
 */