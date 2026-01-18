import api from './api'

export default {
    getAll() {
        return api.get('/AdditionsDeductions')
    },
    create(item) {
        return api.post('/AdditionsDeductions', item)
    },
    update(id, item) {
        return api.put(`/AdditionsDeductions/${id}`, item)
    },
    delete(id) {
        return api.delete(`/AdditionsDeductions/${id}`)
    }
}
