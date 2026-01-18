import api from './api'

export default {
    getSettings() {
        return api.get('/Settings')
    },
    saveSettings(settings) {
        return api.post('/Settings', settings)
    }
}
