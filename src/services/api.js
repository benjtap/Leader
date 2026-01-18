import axios from 'axios'

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 120000, // 2 minutes for Render cold starts
    headers: {
        'Content-Type': 'application/json'
    }
})

// Export a setup function to inject store and configure interceptors
export const setupInterceptors = (store) => {
    // Request interceptor
    api.interceptors.request.use(
        (config) => {
            const token = store.state.token
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`
            }
            return config
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    // Response interceptor
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            const originalRequest = error.config;

            // Handle 401/403 (Auth) - These should still potentially redirect/block
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                store.dispatch('logout')
                return Promise.reject(error)
            }

            // For other errors, we want to prevent navigation blocking and enable offline-like behavior
            // Log the error
            console.error("API Error (Caught):", error);

            // Show user notification
            const message = error.response?.data?.message || 'שגיאת תקשורת' || error.message;
            store.dispatch('showToast', {
                message: `שגיאה: ${message}`,
                type: 'error'
            });

            // Return a "safe" response object so the calling code (e.g. router guards, actions) 
            // does not crash or block. This allows the app to fall back to local/offline logic.
            return Promise.resolve({
                data: null,
                status: error.response?.status || 500,
                statusText: error.message,
                headers: error.response?.headers,
                config: error.config,
                error: true
            });
        }
    )
}

export default api
