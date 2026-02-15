import api from './api';

export default {
    getQuotesByLead(leadId) {
        return api.get(`/quotes/lead/${leadId}`);
    },
    createQuote(quoteData) {
        return api.post('/quotes', quoteData);
    },
    updateQuote(id, quoteData) {
        return api.put(`/quotes/${id}`, quoteData);
    },
    deleteQuote(id) {
        return api.delete(`/quotes/${id}`);
    }
};
