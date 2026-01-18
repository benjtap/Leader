import api from './api'

export default {
    getWeeklyPlans() {
        return api.get('/WeeklyPlan')
    },
    createWeeklyPlan(plan) {
        return api.post('/WeeklyPlan', plan)
    },
    updateWeeklyPlan(id, plan) {
        return api.put(`/WeeklyPlan/${id}`, plan)
    },
    deleteWeeklyPlan(id) {
        return api.delete(`/WeeklyPlan/${id}`)
    }
}
