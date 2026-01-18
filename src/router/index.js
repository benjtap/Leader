import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), // History mode
    routes: [
        {
            path: '/',
            name: 'login',
            component: LoginView,
            alias: '/login',
            meta: { guest: true }
        },
        {
            path: '/activities',
            name: 'activities',
            component: () => import('../views/DashboardView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/dashboard',
            redirect: '/activities'
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/activities'
        }
    ]
})

import store from '../store'

router.beforeEach((to, from, next) => {
    // Start Loading Indicator
    store.commit('SET_LOADING_ROUTE', true);

    const isAuthenticated = store.getters.isAuthenticated
    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login' })
    } else if (to.meta.guest && isAuthenticated) {
        next({ name: 'activities' }) // Redirect to dashboard if already logged in
    } else {
        next()
    }
})

router.afterEach(() => {
    // Stop Loading Indicator
    // Minimal delay to prevent flickering on fast loads
    setTimeout(() => {
        store.commit('SET_LOADING_ROUTE', false);
    }, 300);
})

export default router
