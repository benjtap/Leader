import api from './api'

export default {
    getShifts() {
        return api.get('/shifts')
    },
    createShift(shift) {
        return api.post('/shifts', shift)
    },
    updateShift(id, shift) {
        return api.put(`/shifts/${id}`, shift)
    },
    deleteShift(id) {
        return api.delete(`/shifts/${id}`)
    }
}
