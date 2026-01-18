import api from './api'

export default {
    getPaymentTypes() {
        return api.get('/SystemData/payment-types')
    },
    getSickTypes() {
        return api.get('/SystemData/sick-types')
    }
}
