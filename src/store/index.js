import { createStore } from 'vuex'
import api from '../services/api'
import createPersistedState from 'vuex-persistedstate'
import shiftService from '../services/shiftService'
import weeklyPlanService from '../services/weeklyPlanService'
import shiftTypeService from '../services/shiftTypeService'
import settingsService from '../services/settingsService'
import additionDeductionService from '../services/additionDeductionService'
import systemDataService from '../services/systemDataService'

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
    pendingSync: [],
    lastSync: null,

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
    }
})

export default createStore({
    state: getDefaultState(),
    getters: {
        isAuthenticated: state => !!state.token,
        currentUser: state => state.user,
        allShifts: state => state.shifts,
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
        isLoadingRoute: state => state.isLoadingRoute
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
        }
    },
    actions: {
        // Auth Actions
        saveToken({ commit, dispatch }, token) {
            commit('SET_TOKEN', token)
            if (token) {
                dispatch('fetchInitialData')
            }
        },
        logout({ commit }) {
            commit('LOGOUT')
            window.location.href = '/login';
        },

        // Data Actions
        async fetchInitialData({ dispatch, state }) {
            try {
                await Promise.all([
                    dispatch('fetchShifts'),
                    dispatch('fetchWeeklyPlans'),
                    dispatch('fetchShiftTypes'),
                    dispatch('fetchSettings'),
                    dispatch('fetchAdditionsDeductions'),
                    dispatch('fetchSystemData')
                ])
                console.log('Initial data fetched successfully')

                // Force fix break if missing
                const hasValidFixedBreak = (state.additionsDeductions || []).some(r =>
                    (r.isFixedBreakAuto || r.description?.includes('הפסקה')) &&
                    r.mode === 'time' &&
                    r.minutes > 0
                );

                if (!hasValidFixedBreak) {
                    console.log("No valid fixed break found. Forcing repair...");
                    await dispatch('forceRepairFixedBreak');
                }
            } catch (error) {
                console.error('Error fetching initial data:', error)
            }
        },

        async fetchShifts({ commit, state }) {
            try {
                const response = await shiftService.getShifts()
                if (response.data) {
                    const normalized = response.data
                        .filter(s => s != null)
                        .map(s => {
                            const d = new Date(s.date);
                            return {
                                ...s,
                                dayNumber: d.getDate().toString().padStart(2, '0'),
                                fullDate: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
                            };
                        });
                    commit('SET_SHIFTS', normalized)
                    commit('SET_LAST_SYNC', Date.now())
                }
            } catch (error) {
                console.error('Failed to fetch shifts:', error)
            }
        },

        async fetchWeeklyPlans({ commit, state }) {
            try {
                const response = await weeklyPlanService.getWeeklyPlans()
                if (response.data) {
                    commit('SET_WEEKLY_PLANS', response.data)
                }
            } catch (error) {
                console.error('Failed to fetch weekly plans:', error)
            }
        },

        async addShift({ commit, state }, shift) {
            try {
                const apiShift = {
                    ...shift,
                    salary: parseFloat(shift.salary) || 0,
                    extra: parseFloat(shift.extra) || 0,
                    deduction: parseFloat(shift.deduction) || 0,
                    break: parseInt(shift.break) || 0
                };
                delete apiShift.dayNumber;
                delete apiShift.fullDate;

                const response = await shiftService.createShift(apiShift);

                if (response && response.data && response.data.id) {
                    const newShift = { ...shift, id: response.data.id };
                    commit('ADD_SHIFT', newShift);
                } else {
                    commit('ADD_SHIFT', shift);
                }
            } catch (e) {
                console.error('Failed to create shift API', e);
                throw e;
            }
        },

        async updateShift({ commit, state }, { id, shift }) {
            if (!id || !shift) return;
            commit('UPDATE_SHIFT', { id, shift })
            try {
                const apiShift = {
                    ...shift,
                    id: id,
                    salary: parseFloat(shift.salary) || 0,
                    extra: parseFloat(shift.extra) || 0,
                    deduction: parseFloat(shift.deduction) || 0,
                    break: parseInt(shift.break) || 0
                };
                delete apiShift.dayNumber;
                delete apiShift.fullDate;

                await shiftService.updateShift(id, apiShift)
            } catch (e) {
                console.error('Failed to update shift API', e);
            }
        },

        async deleteShift({ commit, state }, id) {
            commit('DELETE_SHIFT', id)
            try {
                await shiftService.deleteShift(id)
            } catch (e) {
                console.error('Failed to delete shift API', e);
            }
        },

        async sync({ commit, state, dispatch }) {
            if (state.isSyncing || !state.token) return
            commit('SET_SYNCING', true)
            try {
                if (state.pendingSync.length > 0) {
                    await dispatch('pushPending')
                }
                await dispatch('fetchShifts')
            } catch (error) {
                console.error('Sync failed:', error)
            } finally {
                commit('SET_SYNCING', false)
            }
        },

        async pushPending({ state, commit }) {
            const pending = [...state.pendingSync]
            for (const op of pending) {
                try {
                    if (op.type === 'add') {
                        await shiftService.createShift(op.item)
                    } else if (op.type === 'update') {
                        await shiftService.updateShift(op.id, op.item)
                    } else if (op.type === 'delete') {
                        await shiftService.deleteShift(op.id)
                    }
                } catch (error) {
                    console.error(`Failed to sync ${op.type}:`, error)
                }
            }
            commit('CLEAR_PENDING')
        },

        async fetchShiftTypes({ commit, state }) {
            try {
                const response = await shiftTypeService.getShiftTypes()
                if (response.data && response.data.length > 0) {
                    commit('SET_SHIFT_TYPES', response.data)
                }
            } catch (e) { console.error(e) }
        },

        async addShiftType({ commit, state }, type) {
            try {
                const res = await shiftTypeService.createShiftType(type)
                if (res.data) {
                    commit('ADD_SHIFT_TYPE', res.data)
                    commit('UPDATE_SHIFT_TYPE', res.data)
                }
            } catch (e) {
                console.error("Failed to create shift type", e);
            }
        },

        async updateShiftType({ commit, state }, type) {
            try {
                const res = await shiftTypeService.updateShiftType(type.id, type)
                if (res.data) {
                    commit('UPDATE_SHIFT_TYPE', res.data)
                }
            } catch (e) {
                console.error(e)
            }
        },

        async deleteShiftType({ commit, state }, id) {
            commit('DELETE_SHIFT_TYPE', id)
            await shiftTypeService.deleteShiftType(id)
        },

        showToast({ commit }, { message, type }) {
            commit('SHOW_TOAST', { message, type });
            setTimeout(() => {
                commit('HIDE_TOAST');
            }, 3000);
        },

        async addWeeklyPlan({ commit, state }, plan) {
            const res = await weeklyPlanService.createWeeklyPlan(plan)
            if (res.data) commit('ADD_WEEKLY_PLAN', res.data)
        },
        async deleteWeeklyPlan({ commit, state }, id) {
            commit('DELETE_WEEKLY_PLAN', id)
            await weeklyPlanService.deleteWeeklyPlan(id)
        },
        async updateWeeklyPlan({ commit, state }, plan) {
            commit('UPDATE_WEEKLY_PLAN', plan)
            await weeklyPlanService.updateWeeklyPlan(plan.id, plan)
        },

        async fetchAdditionsDeductions({ commit, state }) {
            try {
                const res = await additionDeductionService.getAll()
                if (res.data) commit('SET_ADDITIONS_DEDUCTIONS', res.data)
            } catch (e) { console.error(e) }
        },
        async fetchSystemData({ commit, state }) {
            try {
                const [payRes, sickRes] = await Promise.all([
                    systemDataService.getPaymentTypes(),
                    systemDataService.getSickTypes()
                ])
                if (payRes.data) commit('SET_PAYMENT_TYPES', payRes.data)
                if (sickRes.data) commit('SET_SICK_TYPES', sickRes.data)
            } catch (e) { console.error('Error fetching system data', e) }
        },

        async addAdditionDeduction({ commit, state }, item) {
            try {
                const apiItem = { ...item };
                if (apiItem.id && String(apiItem.id).length > 10) delete apiItem.id; // Remove fake IDs if generated by client

                // SATISFY BACKEND VALIDATION: FrontendId is Required
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

                // SATISFY BACKEND VALIDATION: FrontendId is Required
                if (!apiItem.frontendId) {
                    apiItem.frontendId = String(item.id);
                }

                await additionDeductionService.update(item.id, apiItem)
            } catch (e) {
                console.error("Failed to update addition/deduction. Item:", item, "Error:", e);
                // Maybe revert commit if critical?
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
            // Find any deduction that looks like a "Break" (manual or auto)
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
                    // Update existing (even if it was manual before, we take control)
                    if (existingItem.minutes !== newItem.minutes || !existingItem.isFixedBreakAuto) {
                        await dispatch('updateAdditionDeduction', { ...existingItem, ...newItem });
                    }
                } else {
                    // Create new
                    await dispatch('addAdditionDeduction', { ...newItem, id: Date.now() });
                }
            } else {
                // If disabled, remove the auto-created one (found by flag or name)
                if (existingItem) {
                    await dispatch('deleteAdditionDeduction', existingItem.id);
                }
            }
        },

        async forceRepairFixedBreak({ commit, state, dispatch }) {
            console.log("Force Repair Fixed Break - CHECK ONLY (Auto-Repair Disabled to prevent 40m overwrite)");
            // Logic disabled to respect user settings (20, 30, etc.)
            // Previously this function forced 40m if it thought break was missing.
            // Now we trust the user.
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
            if (!shiftType || !shiftType.rates) return

            const updatedRates = shiftType.rates.filter((_, i) => i !== index)
            const updatedType = { ...shiftType, rates: updatedRates };
            commit('UPDATE_SHIFT_TYPE', updatedType)
            await dispatch('updateShiftType', updatedType)
        }
    },
    plugins: [
        createPersistedState({
            key: 'human-resource-data',
            // FIX: Only persist Auth. Do NOT persist settings/shifts to avoid stale "Ghost Objects" (like the 40min bug).
            // App will fetch fresh data from API on reload.
            paths: ['token', 'user']
        })
    ]
})
