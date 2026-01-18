import api from './api';

export default {
    getQuotes() {
        return api.get('/Lists/quotes');
    },
    getFollowUp() {
        return api.get('/Lists/followup');
    },
    getNotRelevant() {
        return api.get('/Lists/notrelevant');
    }
};
