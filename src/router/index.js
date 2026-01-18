import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'

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
            path: '/shifts',
            name: 'shifts',
            component: () => import('../views/ShiftsView.vue'),
            meta: { requiresAuth: true } // Or false if testing without login
        },
        {
            path: '/summary',
            name: 'summary',
            component: () => import('../views/SummaryView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/weekly-plan',
            name: 'weekly-plan',
            component: () => import('../views/WeeklyPlanView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/weekly-schedules',
            name: 'weekly-schedules',
            component: () => import('../views/WeeklySchedulesListView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/shift-types',
            name: 'shift-types',
            component: () => import('../views/ShiftTypesView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/hours',
            name: 'hours',
            component: () => import('../views/HoursView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('../views/SettingsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/overtime-settings',
            name: 'overtime-settings',
            component: () => import('../views/OvertimeSettingsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/additions-deductions',
            name: 'additions-deductions',
            component: () => import('../views/AdditionsDeductionsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/tax-deductions',
            name: 'tax-deductions',
            component: () => import('../views/TaxDeductionsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/general-settings',
            name: 'general-settings',
            component: () => import('../views/GeneralSettingsView.vue'),
            meta: { requiresAuth: true }
        },
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
        next({ name: 'shifts' }) // Redirect to dashboard if already logged in
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
