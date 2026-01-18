import api from './api'

export default {
    getShiftTypes() {
        return api.get('/ShiftTypes')
    },
    createShiftType(shiftType) {
        return api.post('/ShiftTypes', shiftType)
    },
    updateShiftType(id, shiftType) {
        return api.put(`/ShiftTypes/${id}`, shiftType)
    },
    deleteShiftType(id) {
        return api.delete(`/ShiftTypes/${id}`)
    }
}
