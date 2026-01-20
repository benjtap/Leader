import api from './api';

export default {
    getLeads() {
        return api.get('/Leads');
    },
    syncContacts(contacts) {
        return api.post('/Leads/sync', contacts);
    }
};
