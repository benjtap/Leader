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
            path: '/lead/:number', // Using phone number as ID/Key
            name: 'lead-details',
            component: () => import('../views/LeadDetailsView.vue'),
            props: true,
            meta: { requiresAuth: true }
        },
        {
            path: '/lead/:id/edit',
            name: 'edit-lead',
            component: () => import('../views/EditLeadView.vue'),
            props: true,
            meta: { requiresAuth: true }
        },
        {
            path: '/lead/:leadId/create-quote',
            name: 'create-quote',
            component: () => import('../views/CreateQuoteView.vue'),
            props: true,
            meta: { requiresAuth: true }
        },
        {
            path: '/quote-settings',
            name: 'quote-settings',
            component: () => import('../views/QuoteSettingsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/quote/:quoteId',
            name: 'quote-preview',
            component: () => import('../views/QuotePreviewView.vue'),
            props: true,
            meta: { requiresAuth: true }
        },
        {
            path: '/lead/:leadId/create-note',
            name: 'create-note',
            component: () => import('../views/CreateNoteView.vue'),
            props: true,
            meta: { requiresAuth: true }
        },
        {
            path: '/lead/:leadId/create-task',
            name: 'create-task',
            component: () => import('../views/CreateTaskView.vue'),
            props: true,
            meta: { requiresAuth: true }
        },
        {
            path: '/task/:taskId',
            name: 'task-detail',
            component: () => import('../views/TaskDetailView.vue'),
            props: true,
            meta: { requiresAuth: true }
        },
        {
            path: '/tenant-setup',
            name: 'tenant-setup',
            component: () => import('../views/TenantSetupView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/invite-teammates',
            name: 'invite-teammates',
            component: () => import('../views/InviteTeammatesView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/workspace-selection',
            name: 'workspace-selection',
            component: () => import('../views/WorkspaceSelectionView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('../views/SettingsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/my-notes',
            name: 'my-notes',
            component: () => import('../views/MyNotesView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/dashboard',
            redirect: '/activities'
        },
        {
            path: '/privacy',
            name: 'privacy',
            component: () => import('../views/PrivacyView.vue'),
            meta: { guest: true }
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
    const user = store.getters.currentUser

    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login' })
    } else if (to.meta.guest && isAuthenticated) {
        next({ name: 'activities' }) // Redirect to dashboard if already logged in
    } else {
        // Teammates Logic:
        // If trying to access Invite/List but NO tenant -> Go to Setup
        if (isAuthenticated && to.name === 'invite-teammates' && (!user || !user.tenantId)) {
            next({ name: 'tenant-setup' });
            store.commit('SET_LOADING_ROUTE', false);
            return;
        }
        // If trying to access Setup but HAS tenant -> Go to Invite/List
        if (isAuthenticated && to.name === 'tenant-setup' && user && user.tenantId) {
            next({ name: 'invite-teammates' });
            store.commit('SET_LOADING_ROUTE', false);
            return;
        }

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
