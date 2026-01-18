import api from './api';

export default {
    getLeads() {
        return api.get('/Leads');
    }
};
