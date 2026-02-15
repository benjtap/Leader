import { createStore } from 'vuex'
import api from '../services/api'
import createPersistedState from 'vuex-persistedstate'
import shiftService from '../services/shiftService'
import weeklyPlanService from '../services/weeklyPlanService'
import shiftTypeService from '../services/shiftTypeService'
import settingsService from '../services/settingsService'
import additionDeductionService from '../services/additionDeductionService'
import systemDataService from '../services/systemDataService'
import activityService from '../services/activityService'
import leadsService from '../services/leadsService'
import listsService from '../services/listsService'
import workflowService from '../services/workflowService'
import quotesService from '../services/quotesService'

import { formatSmartDate } from '../utils/dateUtils'

const getDefaultState = () => ({
    // Global UI State
    toast: {
        visible: false,
        message: '',
        type: 'success'
    },
    user: null,
    token: null,

    // Data (Offline-first)
    shifts: [],
    activities: [],
    leads: [],
    draftQuote: null,
    quotes: [], // Legacy compat
    meetings: [],
    closedDeals: [], // Legacy compat
    followUp: [], // Legacy compat
    notRelevant: [], // Legacy compat

    // Dynamic Workflow
    workflowSteps: [],
    // Dynamic Workflow
    workflowSteps: [],
    listData: {}, // Map of type -> items
    tenantMembers: [], // New State

    pendingSync: [],
    lastSync: null,

    // UI Persistence
    activeSlideIndex: 0,
    focusedItemId: null,

    isSyncing: false,
    isLoadingRoute: false,
    isMockMode: false,

    // Metadata (Persistent)
    shiftTypes: [],
    paymentTypes: [],
    sickTypes: [],
    weeklyPlans: [],
    additionsDeductions: [],

    // Settings (Persistent)
    settings: {
        salaryStartDay: 1,
        hourlyWage: 50.0
    },
    generalSettings: {
        pushNotifications: true,
        workTimeMinutes: 0,
        fixedBreak: false,
        fixedBreakMinutes: 0,
        recuperationValue: 378,
        allowUnpaidLeave: false,
        vacationDay: { hours: '08:00', percent: 100 },
        holiday: { hours: '08:00', percent: 100 },
        sickDay1: { hours: '08:00', percent: 0 },
        sickDay2: { hours: '08:00', percent: 50 },
        sickDay3: { hours: '08:00', percent: 50 },
        sickDay4: { hours: '08:00', percent: 100 },
        jobDescriptions: {
            job1: 'עבודה 1', job2: 'עבודה 2', job3: 'עבודה 3',
            job4: 'עבודה 4', job5: 'עבודה 5', job6: 'עבודה 6',
            job7: 'עבודה 7', job8: 'עבודה 8'
        }
    },
    taxSettings: {
        creditPoints: 2.25,
        pointValue: 242,
        isIncomeTaxExempt: false,
        isNationalInsuranceExempt: false,
        isHealthTaxExempt: false,
        isShiftTaxCredit: false,
        studyFund: 0,
        isStudyFundFixed182: false,
        pensionFund: 6,
        isPensionFundFixed182: false
    },
    quoteSettings: {
        includeLogo: false,
        startNumber: 0,
        validityDays: 30,
        currency: 'USD',
        includeTax: false,
        includeTotal: true,
        taxRate: 0,
        showCustomerDetails: false,
        footerText: ''
    }
})

export default createStore({
    state: getDefaultState(),
    getters: {
        isAuthenticated: state => !!state.token,
        currentUser: state => state.user,
        allShifts: state => state.shifts,
        allActivities: state => state.activities,
        allLeads: state => {
            // Aggregate ALL leads from ALL lists (static + dynamic)
            let all = [...(state.leads || []), ...(state.quotes || []), ...(state.followUp || []), ...(state.closedDeals || []), ...(state.notRelevant || [])];

            if (state.listData) {
                Object.values(state.listData).forEach(list => {
                    if (Array.isArray(list)) {
                        all = [...all, ...list];
                    }
                });
            }

            // Deduplicate by ID just in case
            const seen = new Set();
            return all.filter(item => {
                const k = item.id;
                if (!k || seen.has(k)) return false;
                seen.add(k);
                return true;
            });
        },

        // Dynamic Lists Getter
        getListItems: (state) => (type) => {
            // Support legacy hardcoded arrays if needed, but prefer listData
            if (state.listData[type]) return state.listData[type];

            // Fallbacks for backward compatibility
            if (type === 'lead') return state.leads;
            if (type === 'quote' || type === 'quotes') return state.quotes;
            if (type === 'followup') return state.followUp;
            if (type === 'closeddeals') return state.closedDeals;
            if (type === 'notrelevant') return state.notRelevant;

            if (type === 'notrelevant') return state.notRelevant;

            return [];
        },

        allWorkflowSteps: state => state.workflowSteps,
        tenantMembers: state => state.tenantMembers || [], // New Getter

        allQuotes: state => state.quotes, // Legacy
        allMeetings: state => state.meetings,
        allClosedDeals: state => state.closedDeals, // Legacy
        allFollowUp: state => state.followUp, // Legacy
        allNotRelevant: state => state.notRelevant, // Legacy

        syncStatus: state => state.isSyncing,
        allShiftTypes: state => state.shiftTypes,
        allPaymentTypes: state => state.paymentTypes,
        allSickTypes: state => state.sickTypes,
        allWeeklyPlans: state => state.weeklyPlans,
        allAdditionsDeductions: state => state.additionsDeductions,
        salaryStartDay: state => state.settings?.salaryStartDay || 1,
        hourlyWage: state => state.settings?.hourlyWage || 50.0,
        generalSettings: state => state.generalSettings || {},
        taxSettings: state => state.taxSettings || {},
        taxCreditPoints: state => state.taxSettings?.creditPoints || 2.25,
        taxPointValue: state => state.taxSettings?.pointValue || 242,
        taxIsIncomeTaxExempt: state => state.taxSettings?.isIncomeTaxExempt || false,
        taxIsNationalInsuranceExempt: state => state.taxSettings?.isNationalInsuranceExempt || false,
        taxIsHealthTaxExempt: state => state.taxSettings?.isHealthTaxExempt || false,
        taxIsShiftTaxCredit: state => state.taxSettings?.isShiftTaxCredit || false,
        taxStudyFund: state => state.taxSettings?.studyFund || 0,
        taxIsStudyFundFixed182: state => state.taxSettings?.isStudyFundFixed182 || false,
        taxPensionFund: state => state.taxSettings?.pensionFund || 5,
        taxIsPensionFundFixed182: state => state.taxSettings?.isPensionFundFixed182 || false,
        isMockMode: state => state.isMockMode,
        isLoadingRoute: state => state.isLoadingRoute,
        isLoadingRoute: state => state.isLoadingRoute,
        quoteSettings: state => state.quoteSettings || {},
        activeSlideIndex: state => state.activeSlideIndex,
        focusedItemId: state => state.focusedItemId,

        // Grouped activities for Dashboard
        groupedActivities: state => {
            // Gather all known numbers from entities (Leads, Quotes, etc.)
            const allListPhones = [];
            if (state.listData) {
                Object.values(state.listData).forEach(list => {
                    if (Array.isArray(list)) {
                        list.forEach(item => {
                            if (item.phone) allListPhones.push(String(item.phone).replace(/\D/g, ''));
                        });
                    }
                });
            }
            const knownSet = new Set(allListPhones);

            const map = new Map();
            state.activities.forEach(item => {
                if (!item.number) return;

                // Filter out if number belongs to a known entity
                const cleanNum = String(item.number).replace(/\D/g, '');
                if (knownSet.has(cleanNum)) {
                    return;
                }

                if (!map.has(item.number)) {
                    map.set(item.number, {
                        ...item,
                        time: formatSmartDate(item.timestamp)
                    });
                }
            });
            return Array.from(map.values());
        },

        // Get full history for a specific number
        getCallHistory: (state) => (number) => {
            return state.activities
                .filter(a => a.number === number)
                .map(a => ({
                    ...a,
                    time: formatSmartDate(a.timestamp),
                    fullDate: new Date(a.timestamp).toLocaleString()
                }))
                .sort((a, b) => b.timestamp - a.timestamp);
        }
    },
    mutations: {
        SET_TOKEN(state, token) {
            state.token = token
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        },
        SET_USER(state, user) {
            state.user = user
        },
        LOGOUT(state) {
            delete api.defaults.headers.common['Authorization']
            const initialState = getDefaultState()
            Object.keys(initialState).forEach(key => {
                state[key] = initialState[key]
            })
        },
        SET_SHIFTS(state, shifts) { state.shifts = shifts },
        SET_ACTIVITIES(state, activities) { state.activities = activities },
        SET_LEADS(state, leads) { state.leads = leads },
        SET_QUOTES(state, data) { state.quotes = data },
        SET_MEETINGS(state, data) { state.meetings = data },
        SET_CLOSED_DEALS(state, data) { state.closedDeals = data },
        SET_FOLLOWUP(state, data) { state.followUp = data },
        SET_NOT_RELEVANT(state, data) { state.notRelevant = data },

        SET_WORKFLOW_STEPS(state, steps) { state.workflowSteps = steps },
        SET_LIST_DATA(state, { type, items }) {
            state.listData = { ...state.listData, [type]: items };
            // Sync legacy arrays for now
            if (type === 'lead') state.leads = items;
            if (type === 'quote' || type === 'quotes') state.quotes = items;
            if (type === 'followup') state.followUp = items;
            if (type === 'closeddeals') state.closedDeals = items;
            if (type === 'notrelevant') state.notRelevant = items;
        },
        SET_DRAFT_QUOTE(state, quote) {
            state.draftQuote = quote;
        },
        SET_TENANT_MEMBERS(state, members) { state.tenantMembers = members; },
        SET_TENANT_MEMBERS(state, members) { state.tenantMembers = members; },
        SET_QUOTES(state, quotes) { state.quotes = quotes; },

        SET_ACTIVE_SLIDE(state, index) { state.activeSlideIndex = index; },
        SET_FOCUSED_ITEM(state, id) { state.focusedItemId = id; },

        UPDATE_LEAD(state, updatedLead) {
            // Update in leads array
            const index = state.leads.findIndex(l => l.id === updatedLead.id);
            if (index !== -1) {
                state.leads.splice(index, 1, updatedLead);
            }

            // Update in listData if present (since listData['lead'] is the source of truth often)
            if (state.listData['lead']) {
                const listIndex = state.listData['lead'].findIndex(l => l.id === updatedLead.id);
                if (listIndex !== -1) {
                    state.listData['lead'].splice(listIndex, 1, updatedLead);
                }
            }
        },

        ADD_SHIFT(state, shift) {
            state.shifts.push(shift)
            state.pendingSync.push({ type: 'add', item: shift })
        },
        UPDATE_SHIFT(state, { id, shift }) {
            if (!id || !shift) return;
            const index = state.shifts.findIndex(s => s && s.id === id)
            if (index !== -1) {
                state.shifts.splice(index, 1, shift)
            }
            state.pendingSync.push({ type: 'update', id, item: shift })
        },
        DELETE_SHIFT(state, id) {
            state.shifts = state.shifts.filter(s => s && s.id !== id)
            state.pendingSync.push({ type: 'delete', id })
        },
        CLEAR_PENDING(state) { state.pendingSync = [] },
        SET_LAST_SYNC(state, timestamp) { state.lastSync = timestamp },
        SET_SYNCING(state, syncing) { state.isSyncing = syncing },
        SET_LOADING_ROUTE(state, val) { state.isLoadingRoute = val },
        TOGGLE_MOCK_MODE(state) { state.isMockMode = !state.isMockMode },
        SET_MOCK_MODE(state, value) { state.isMockMode = value },
        SET_SHIFT_TYPES(state, types) { state.shiftTypes = types },
        ADD_SHIFT_TYPE(state, type) { state.shiftTypes.push(type) },
        UPDATE_SHIFT_TYPE(state, type) {
            const idx = state.shiftTypes.findIndex(t => t.id === type.id || t.numericId === type.numericId);
            if (idx !== -1) {
                state.shiftTypes.splice(idx, 1, type);
            }
        },
        DELETE_SHIFT_TYPE(state, id) {
            state.shiftTypes = state.shiftTypes.filter(t => t.id !== id)
        },
        SET_WEEKLY_PLANS(state, plans) { state.weeklyPlans = plans },
        ADD_WEEKLY_PLAN(state, plan) { state.weeklyPlans.push(plan) },
        DELETE_WEEKLY_PLAN(state, id) { state.weeklyPlans = state.weeklyPlans.filter(p => p.id !== id) },
        UPDATE_WEEKLY_PLAN(state, plan) {
            const idx = state.weeklyPlans.findIndex(p => p.id === plan.id)
            if (idx !== -1) state.weeklyPlans.splice(idx, 1, plan)
        },
        ADD_ADDITION_DEDUCTION(state, item) { state.additionsDeductions.push(item) },
        DELETE_ADDITION_DEDUCTION(state, id) { state.additionsDeductions = state.additionsDeductions.filter(item => item.id !== id) },
        UPDATE_ADDITION_DEDUCTION(state, item) {
            const idx = state.additionsDeductions.findIndex(i => i.id === item.id);
            if (idx !== -1) state.additionsDeductions.splice(idx, 1, item);
        },
        SET_PAYMENT_TYPES(state, types) { state.paymentTypes = types },
        SET_SICK_TYPES(state, types) { state.sickTypes = types },
        SET_ADDITIONS_DEDUCTIONS(state, items) { state.additionsDeductions = items },
        SET_SALARY_START_DAY(state, day) {
            if (!state.settings) state.settings = {}
            state.settings.salaryStartDay = day
        },
        SET_HOURLY_WAGE(state, wage) {
            if (!state.settings) state.settings = {}
            state.settings.hourlyWage = wage
        },
        SET_GENERAL_SETTING(state, { key, value }) {
            if (!state.generalSettings) state.generalSettings = {};
            state.generalSettings[key] = value;
        },
        SET_GENERAL_SETTINGS_BULK(state, settings) {
            state.generalSettings = { ...state.generalSettings, ...settings }
        },
        SET_TAX_SETTING(state, { key, value }) {
            if (!state.taxSettings) state.taxSettings = {};
            state.taxSettings[key] = value;
        },
        SET_TAX_SETTINGS_BULK(state, settings) {
            state.taxSettings = { ...state.taxSettings, ...settings }
        },
        SHOW_TOAST(state, { message, type }) {
            state.toast.visible = true;
            state.toast.message = message;
            state.toast.type = type || 'success';
        },
        HIDE_TOAST(state) {
            state.toast.visible = false;
        },
        SET_TAX_CREDIT_POINTS(state, points) {
            if (!state.taxSettings) state.taxSettings = {}
            state.taxSettings.creditPoints = points
        },
        SET_TAX_POINT_VALUE(state, value) {
            if (!state.taxSettings) state.taxSettings = {}
            state.taxSettings.pointValue = value
        },
        SET_QUOTE_SETTINGS(state, settings) {
            state.quoteSettings = { ...state.quoteSettings, ...settings };
        }
    },
    actions: {
        // Auth Actions
        loginSuccess({ commit, dispatch }, { token, user }) {
            commit('SET_TOKEN', token);
            commit('SET_USER', user);
            if (token) {
                dispatch('fetchInitialData');
            }
        },
        saveToken({ commit, dispatch }, token) {
            commit('SET_TOKEN', token)
            if (token) {
                dispatch('fetchInitialData')
            }
        },
        async logout({ commit }) {
            try {
                const mobileSync = (await import('../services/mobileSyncService')).default;
                await mobileSync.signOutGoogle();
            } catch (e) {
                console.error("Logout: Google SignOut failed", e);
            }

            commit('LOGOUT')
            localStorage.removeItem('human-resource-data');
            localStorage.removeItem('pending_invite_token');
            window.location.href = '/login';
        },

        // Data Actions
        async fetchInitialData({ dispatch, state }) {
            try {
                await Promise.all([
                    dispatch('fetchActivities'),
                    dispatch('fetchWorkflowAndLists')
                ])
                console.log('Initial data fetched successfully')
            } catch (error) {
                console.error('Error fetching initial data:', error)
            }
        },

        async fetchActivities({ commit, state }) {
            try {
                const res = await activityService.getActivities();
                let backend = res.data || [];
                backend = backend.map(b => ({
                    ...b,
                    timestamp: b.timestamp || new Date(b.createdAt || Date.now()).getTime(),
                    source: 'crm'
                }));

                const mobileSync = (await import('../services/mobileSyncService')).default;
                const logRes = await mobileSync.getCallLogs();

                let nativeLogs = [];
                if (!logRes.error && logRes.data) {
                    nativeLogs = logRes.data.map(l => ({
                        ...l,
                        timestamp: l.rawTime || l.timestamp || Date.now(),
                        source: 'mobile'
                    }));
                }

                // Dynamically collect all phones from all lists in listData (including custom dynamic lists)
                const allListPhones = [];
                if (state.listData) {
                    Object.values(state.listData).forEach(list => {
                        if (Array.isArray(list)) {
                            list.forEach(item => {
                                if (item.phone) allListPhones.push(item.phone);
                            });
                        }
                    });
                }

                const allKnownPhones = new Set(allListPhones);

                const normalize = (p) => p ? String(p).replace(/\D/g, '') : '';
                const allKnownNormalized = new Set(Array.from(allKnownPhones).map(normalize));

                /* 
                // Don't filter out known native logs here. 
                // We want them in state.activities so they appear in Call History (Lead Details).
                // They are filtered out of the "Last Activity" dashboard view via the groupedActivities getter.
                nativeLogs = nativeLogs.filter(log => {
                    const logPhone = normalize(log.number);
                    if (allKnownNormalized.has(logPhone)) return false;
                    return true;
                });
                */

                let combined = [...nativeLogs, ...backend];
                combined.sort((a, b) => b.timestamp - a.timestamp);

                commit('SET_ACTIVITIES', combined);
            } catch (e) { console.error('Error fetching activities', e); }
        },

        async fetchLeads({ commit }) {
            try {
                const res = await leadsService.getLeads();
                if (res.data) commit('SET_LEADS', res.data);
            } catch (e) { console.error('Error fetching leads', e); }
        },

        async fetchLists({ commit }) {
            try {
                const [q, f, n, c] = await Promise.all([
                    listsService.getQuotes(),
                    listsService.getFollowUp(),
                    listsService.getNotRelevant(),
                    listsService.getClosedDeals()
                ]);
                if (q.data) commit('SET_QUOTES', q.data);
                if (f.data) commit('SET_FOLLOWUP', f.data);
                if (n.data) commit('SET_NOT_RELEVANT', n.data);
                if (c.data) commit('SET_CLOSED_DEALS', c.data);
            } catch (e) { console.error('Error fetching lists', e); }
        },

        async fetchWorkflowAndLists({ commit, dispatch }) {
            try {
                const res = await workflowService.getWorkflow();
                const steps = res.data;
                commit('SET_WORKFLOW_STEPS', steps);

                const promises = steps.map(step =>
                    workflowService.getListItems(step.type)
                        .then(r => ({ type: step.type, items: r.data }))
                        .catch(e => { console.error(`Error fetching ${step.type}`, e); return { type: step.type, items: [] }; })
                );

                const results = await Promise.all(promises);

                results.forEach(({ type, items }) => {
                    commit('SET_LIST_DATA', { type, items });
                });

            } catch (e) {
                console.error("Error fetching workflow", e);
            }
        },

        async createWorkflowStep({ dispatch }, name) {
            await workflowService.createStep(name);
            dispatch('fetchWorkflowAndLists');
        },

        async deleteWorkflowStep({ dispatch }, id) {
            await workflowService.deleteStep(id);
            dispatch('fetchWorkflowAndLists');
        },

        async reorderWorkflowSteps({ dispatch }, orderedIds) {
            await workflowService.reorderSteps(orderedIds);
            dispatch('fetchWorkflowAndLists');
        },

        async fetchTenantMembers({ commit }) {
            try {
                const res = await api.get('/tenants/members');
                if (res.data) commit('SET_TENANT_MEMBERS', res.data);
            } catch (e) { console.error("Error fetching members", e); }
        },

        async deleteWorkflowStepAndMove({ dispatch }, { id, targetType, targetUserId }) {
            await workflowService.deleteStepAndMove(id, targetType, targetUserId);
            dispatch('fetchWorkflowAndLists');
        },

        async fetchQuotes({ commit }, leadId) {
            try {
                const res = await quotesService.getQuotesByLead(leadId);
                if (res.data) commit('SET_QUOTES', res.data);
            } catch (e) {
                console.error("Error fetching quotes", e);
            }
        },

        async createQuote({ dispatch }, quote) {
            try {
                await quotesService.createQuote(quote);
                dispatch('fetchQuotes', quote.leadId);
                // dispatch('showToast', { message: 'Quote created successfully', type: 'success' }); // Handled in component
            } catch (e) {
                console.error("Error creating quote", e);
                // dispatch('showToast', { message: 'Failed to create quote', type: 'error' });
                throw e;
            }
        },

        async updateQuote({ dispatch }, { id, quote }) {
            try {
                await quotesService.updateQuote(id, quote);
                dispatch('fetchQuotes', quote.leadId);
            } catch (e) {
                console.error("Error updating quote", e);
                throw e;
            }
        },

        async deleteQuote({ dispatch, state }, { id, leadId }) {
            try {
                await quotesService.deleteQuote(id);
                // Remove from local state immediately for responsiveness
                const quotes = state.quotes.filter(q => q.id !== id);
                state.quotes = quotes; // Direct mutation or commit
                // dispatch('fetchQuotes', leadId); // Optional if we mutate
            } catch (e) {
                console.error("Error deleting quote", e);
                throw e;
            }
        },



        async createActivity({ commit, dispatch }, activity) {
            try {
                const res = await activityService.createActivity(activity);
                dispatch('fetchActivities');
                return res;
            } catch (e) {
                console.error("Failed to create activity", e);
                throw e;
            }
        },

        async updateActivity({ commit, dispatch }, { id, activity }) {
            try {
                const res = await activityService.updateActivity(id, activity);
                dispatch('fetchActivities');
                return res;
            } catch (e) {
                console.error("Failed to update activity", e);
                throw e;
            }
        },

        async deleteActivity({ commit, dispatch }, id) {
            try {
                const res = await activityService.deleteActivity(id);
                dispatch('fetchActivities');
                return res;
            } catch (e) {
                console.error("Failed to delete activity", e);
                throw e;
            }
        },

        async uploadContacts({ commit, dispatch }, contacts) {
            try {
                const res = await leadsService.syncContacts(contacts);
                dispatch('fetchLeads');
                dispatch('fetchWorkflowAndLists');
                dispatch('fetchActivities');
                return res;
            } catch (e) {
                console.error("Failed to sync contacts", e);
                throw e;
            }
        },

        async uploadFile({ commit }, formData) {
            try {
                // We need to use raw axios or api instance for multipart/form-data
                // Ensure 'Content-Type': 'multipart/form-data' is set automatically by browser or force it
                const res = await api.post('/files/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return res.data;
            } catch (e) {
                console.error("File upload failed", e);
                throw e;
            }
        },

        async cleanupDuplicates({ dispatch }) {
            try {
                const res = await leadsService.cleanupDuplicates();
                dispatch('fetchWorkflowAndLists');
                dispatch('showToast', { message: res.data.message, type: 'success' });
                return res;
            } catch (e) {
                console.error("Failed to cleanup duplicates", e);
                throw e;
            }
        },

        async addAdditionDeduction({ commit, state }, item) {
            try {
                const apiItem = { ...item };
                if (apiItem.id && String(apiItem.id).length > 10) delete apiItem.id;

                if (!apiItem.frontendId) {
                    apiItem.frontendId = String(item.id || Date.now());
                }

                const res = await additionDeductionService.create(apiItem);
                if (res.data && res.data.id) {
                    commit('ADD_ADDITION_DEDUCTION', res.data);
                }
            } catch (e) {
                console.error("Failed to create addition/deduction", e);
            }
        },
        async deleteAdditionDeduction({ commit, state }, id) {
            commit('DELETE_ADDITION_DEDUCTION', id)
            try {
                await additionDeductionService.delete(id)
            } catch (e) {
                console.error("Failed to delete addition/deduction", e);
            }
        },
        async updateAdditionDeduction({ commit, state }, item) {
            commit('UPDATE_ADDITION_DEDUCTION', item)
            try {
                if (!item.id) throw new Error("Missing ID for update");
                const apiItem = { ...item };
                if (!apiItem.frontendId) {
                    apiItem.frontendId = String(item.id);
                }
                await additionDeductionService.update(item.id, apiItem)
            } catch (e) {
                console.error("Failed to update addition/deduction. Item:", item, "Error:", e);
            }
        },

        async fetchSettings({ commit, state }) {
            try {
                const res = await settingsService.getSettings()
                if (res.data) {
                    commit('SET_SALARY_START_DAY', res.data.salaryStartDay)
                    commit('SET_HOURLY_WAGE', res.data.hourlyWage)
                    if (res.data.taxSettings) {
                        commit('SET_TAX_SETTINGS_BULK', res.data.taxSettings)
                    }
                    if (res.data.generalSettings) {
                        commit('SET_GENERAL_SETTINGS_BULK', res.data.generalSettings)
                    }
                }
            } catch (e) { console.error(e) }
        },
        async saveAllSettings({ state }) {
            const settings = {
                salaryStartDay: state.settings.salaryStartDay,
                hourlyWage: state.settings.hourlyWage,
                taxSettings: state.taxSettings,
                generalSettings: state.generalSettings
            }
            await settingsService.saveSettings(settings)
        },

        updateSalaryStartDay({ commit, dispatch }, day) {
            commit('SET_SALARY_START_DAY', day)
            dispatch('saveAllSettings')
        },
        updateHourlyWage({ commit, dispatch }, wage) {
            commit('SET_HOURLY_WAGE', wage)
            dispatch('saveAllSettings')
        },

        async syncFixedBreakDeduction({ commit, state, dispatch }, { enabled, minutes }) {
            const existingItem = state.additionsDeductions.find(i =>
                i.isFixedBreakAuto === true ||
                (i.type === 'deduction' && i.description && i.description.includes('הפסקה'))
            );

            if (enabled && minutes > 0) {
                const newItem = {
                    type: 'deduction',
                    period: 'daily',
                    description: 'הפסקה קבועה',
                    amount: 0,
                    minutes: parseInt(minutes),
                    mode: 'time',
                    shiftIds: [],
                    isFixedBreakAuto: true
                };

                if (existingItem) {
                    if (existingItem.minutes !== newItem.minutes || !existingItem.isFixedBreakAuto) {
                        await dispatch('updateAdditionDeduction', { ...existingItem, ...newItem });
                    }
                } else {
                    await dispatch('addAdditionDeduction', { ...newItem, id: Date.now() });
                }
            } else {
                if (existingItem) {
                    await dispatch('deleteAdditionDeduction', existingItem.id);
                }
            }
        },

        async forceRepairFixedBreak({ commit, state, dispatch }) {
            return;
        },

        updateTaxSetting({ commit, dispatch }, payload) {
            commit('SET_TAX_SETTING', payload)
            dispatch('saveAllSettings')
        },
        updateTaxCreditPoints({ commit, dispatch }, points) {
            commit('SET_TAX_CREDIT_POINTS', points)
            dispatch('saveAllSettings')
        },
        updateTaxPointValue({ commit, dispatch }, value) {
            commit('SET_TAX_POINT_VALUE', value)
            dispatch('saveAllSettings')
        },

        async addShiftRate({ commit, state, dispatch }, { shiftId, rate }) {
            const shiftType = state.shiftTypes.find(t => t.id === shiftId)
            if (!shiftType) return

            const updatedRates = [...(shiftType.rates || []), rate]
            const updatedType = { ...shiftType, rates: updatedRates };
            commit('UPDATE_SHIFT_TYPE', updatedType)
            await dispatch('updateShiftType', updatedType)
        },
        async updateShiftRate({ commit, state, dispatch }, { shiftId, index, rate }) {
            const shiftType = state.shiftTypes.find(t => t.id === shiftId)
            if (!shiftType || !shiftType.rates) return

            const updatedRates = [...shiftType.rates]
            updatedRates.splice(index, 1, rate)
            const updatedType = { ...shiftType, rates: updatedRates };
            commit('UPDATE_SHIFT_TYPE', updatedType)
            await dispatch('updateShiftType', updatedType)
        },
        async deleteShiftRate({ commit, state, dispatch }, { shiftId, index }) {
            const shiftType = state.shiftTypes.find(t => t.id === shiftId)
            if (!shiftType) return

            const updatedRates = shiftType.rates.filter((_, i) => i !== index)
            const updatedType = { ...shiftType, rates: updatedRates };
            commit('UPDATE_SHIFT_TYPE', updatedType)
            await dispatch('updateShiftType', updatedType)
        },

        async moveItem({ dispatch, commit, state }, { item, target, targetUserId }) {
            console.log(`Store: Moving item ${item.name || item.id} to ${target} (assigned to: ${targetUserId})`);
            try {
                let targetType = target;
                if (target === 'follow_up') targetType = 'followup';
                if (target === 'not_relevant') targetType = 'notrelevant';
                if (target === 'closed_deal') targetType = 'closeddeals';
                if (target === 'last_activity') {
                    console.warn("Moving TO activity not fully implemented or needed.");
                    return;
                }

                // Logic to enforce assignment to current user ONLY if not already assigned
                const currentUser = state.user;
                const currentUserId = currentUser ? currentUser.id : null;
                let effectiveUserId = targetUserId; // Initialize with the passed targetUserId

                if (item.source === 'crm' || item.source === 'mobile') {
                    // For new leads from activities, default to current user if not provided
                    if (!effectiveUserId) effectiveUserId = currentUserId;

                    const payload = {
                        name: item.name,
                        phone: item.number,
                        listType: targetType,
                        initial: item.initial,
                        color: item.color,
                        sourceId: item.id,
                        email: "",
                        description: "",
                        assignedTo: effectiveUserId ? [effectiveUserId] : [], // Use effectiveUserId
                        userId: effectiveUserId || item.userId // Use effectiveUserId for owner if not specified
                    };

                    const createRes = await leadsService.createLead(payload);
                    let createdLead = createRes.data;
                    console.log("MoveItem - Lead Data:", createdLead);

                    let leadId = createdLead?.id || createdLead?.Id || createdLead?._id;

                    if (!leadId) {
                        console.warn("MoveItem - ID missing in create response. Attempting to fetch item by phone from target list...");
                        try {
                            // Wait briefly for backend consistency
                            await new Promise(resolve => setTimeout(resolve, 500));

                            let listRes;
                            const lt = payload.listType;

                            if (lt === 'lead') listRes = await leadsService.getLeads();
                            else if (lt === 'quote') listRes = await listsService.getQuotes();
                            else if (lt === 'followup') listRes = await listsService.getFollowUp();
                            else if (lt === 'closeddeals') listRes = await listsService.getClosedDeals();
                            else if (lt === 'notrelevant') listRes = await listsService.getNotRelevant();
                            else {
                                // Default fallback to leads + quotes if type unknown
                                const [lRes, qRes] = await Promise.all([leadsService.getLeads(), listsService.getQuotes()]);
                                listRes = { data: [...(lRes.data || []), ...(qRes.data || [])] };
                            }

                            if (listRes && listRes.data) {
                                const foundLead = listRes.data.find(l =>
                                    (l.phone && l.phone === payload.phone) ||
                                    (l.name && l.name === payload.name)
                                );
                                if (foundLead) {
                                    createdLead = foundLead;
                                    leadId = foundLead.id || foundLead.Id || foundLead._id;
                                    console.log("MoveItem - Recovered Lead ID:", leadId);
                                }
                            }
                        } catch (err) { console.error("Recovery failed", err); }
                    }

                    if (!leadId) {
                        console.error("MoveItem - Critical: No ID returned for lead", createdLead);
                        throw new Error("Failed to retrieve Lead ID");
                    }

                    // If lead already existed, it might be in a different list or unassigned
                    if (createdLead.listType !== targetType) {
                        console.log(`Lead exists in ${createdLead.listType}, forcing move to ${targetType}`);
                        await leadsService.moveLead(leadId, targetType);
                    }

                    // Always enforce assignment if requested (CreateAsync doesn't update existing leads)
                    if (effectiveUserId) { // Use effectiveUserId
                        console.log(`Assigning lead ${leadId} to user ${effectiveUserId}`);
                        await leadsService.assignLead(leadId, effectiveUserId);
                    }

                    if ((item.source === 'crm' || item.source === 'mobile') && item.id) {
                        try {
                            await activityService.deleteActivity(item.id);
                        } catch (delErr) {
                            console.warn("Could not delete activity", delErr);
                        }
                    }

                    dispatch('showToast', { message: 'Moved from Activity successfully', type: 'success' });
                    dispatch('fetchActivities');
                    dispatch('fetchWorkflowAndLists');
                }
                else {
                    if (!item.id) throw new Error("Item ID missing for move");

                    // Check if existing item needs assignment enforced
                    // Only enforce current user if the item has NO assignment at all
                    if (!effectiveUserId) {
                        const isAssigned = item.assignedTo && item.assignedTo.length > 0;
                        if (!isAssigned) {
                            effectiveUserId = currentUserId;
                        } else {
                            // If already assigned, keep existing assignment unless explicitly changed
                            console.log("Item already assigned, keeping existing assignment.");
                        }
                    }

                    // Optimistic Update: Remove from all current lists to ensure it doesn't duplicate
                    if (state.listData) {
                        Object.keys(state.listData).forEach(key => {
                            const list = state.listData[key];
                            if (Array.isArray(list)) {
                                const idx = list.findIndex(i => i.id === item.id);
                                if (idx !== -1) {
                                    const newList = [...list];
                                    newList.splice(idx, 1);
                                    commit('SET_LIST_DATA', { type: key, items: newList });
                                }
                            }
                        });
                    }

                    await leadsService.moveLead(item.id, targetType);

                    if (effectiveUserId) { // Use effectiveUserId
                        // If explicit assignment requested
                        console.log(`Assigning existing item ${item.id} to user ${effectiveUserId}`);
                        await leadsService.assignLead(item.id, effectiveUserId);
                    }

                    dispatch('showToast', { message: 'Moved successfully', type: 'success' });
                    await dispatch('fetchWorkflowAndLists');
                }

            } catch (error) {
                console.error("Move failed:", error);
                // Log full error details
                if (error.response) {
                    console.error("Data:", error.response.data);
                    console.error("Status:", error.response.status);
                    console.error("Headers:", error.response.headers);
                }
                dispatch('showToast', { message: 'Move failed', type: 'error' });
                // Revert or re-fetch on failure
                dispatch('fetchWorkflowAndLists');
            }
        },

        async assignItem({ dispatch }, { item, targetUserId }) {
            try {
                if (item.source === 'crm' || item.source === 'mobile') {
                    // Create new lead assigned to target user
                    const payload = {
                        name: item.name || item.number,
                        phone: item.number,
                        listType: 'lead', // Default to Leads list when assigning from activity
                        assignedTo: [targetUserId],
                        userId: targetUserId, // Also make them owner? Usually yes if assigning new lead.
                        initial: item.initial,
                        color: item.color,
                        sourceId: item.id,
                        email: "",
                        description: ""
                    };

                    await leadsService.createLead(payload);

                    if (item.source === 'crm' && item.id) {
                        await activityService.deleteActivity(item.id);
                    }

                    dispatch('showToast', { message: 'Assigned successfully', type: 'success' });
                    dispatch('fetchActivities');
                    dispatch('fetchWorkflowAndLists');
                } else {
                    // Existing lead/item
                    if (!item.id) throw new Error("ID missing");
                    const res = await leadsService.assignLead(item.id, targetUserId);

                    if (res.data) {
                        commit('UPDATE_LEAD', res.data);
                    }

                    dispatch('showToast', { message: 'Assigned successfully', type: 'success' });
                    // Still fetch to be safe, but UI should update instantly now
                    dispatch('fetchWorkflowAndLists');
                }
            } catch (e) {
                console.error("Assign failed", e);
                dispatch('showToast', { message: 'Assign failed', type: 'error' });
            }
        },

        async createTenant({ commit, dispatch }, { companyName, industry, companySize }) {
            try {
                const res = await api.post('/tenants', { companyName, industry, companySize });
                if (res.data.token && res.data.user) {
                    commit('SET_TOKEN', res.data.token);
                    commit('SET_USER', res.data.user);
                }
                return res.data;
            } catch (e) {
                console.error('Create tenant failed', e);
                throw e;
            }
        },

        async joinTenant({ commit, dispatch }, token) {
            try {
                const res = await api.post('/invitations/accept', { token });
                if (res.data.success) {
                    dispatch('showToast', { message: 'Joined team successfully!', type: 'success' });
                    const userRes = await api.get('/auth/profil');
                    if (userRes.data && userRes.data.data) {
                        commit('SET_USER', userRes.data.data);
                    }
                }
                return res.data;
            } catch (e) {
                console.error('Join tenant failed', e);
                throw e;
            }
        },
    },
    plugins: [
        createPersistedState({
            key: 'human-resource-data',
            paths: ['token', 'user']
        })
    ]
})
