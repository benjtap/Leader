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
    },
    getClosedDeals() {
        return api.get('/Lists/closeddeals');
    },
    createItem(listType, item) {
        // listType: 'quotes', 'followup', 'notrelevant', 'closeddeals'
        return api.post(`/Lists/${listType}`, item);
    }
};
