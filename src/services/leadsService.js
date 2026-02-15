import api from './api';

export default {
    getLeads() {
        return api.get('/Leads');
    },
    syncContacts(contacts) {
        return api.post('/Leads/sync', contacts);
    },
    createLead(lead) {
        return api.post('/Leads', lead);
    },
    cleanupDuplicates() {
        return api.post('/Leads/cleanup');
    },
    moveLead(id, targetType) {
        return api.post('/Leads/move', { id, targetType });
    },
    assignLead(id, targetUserId) {
        return api.post('/Leads/assign', { id, targetUserId });
    }
};
