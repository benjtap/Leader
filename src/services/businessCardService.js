
import api from './api';

export default {
    async getMyCard() {
        return api.get('/BusinessCard');
    },
    async saveCard(cardData) {
        return api.post('/BusinessCard', cardData);
    }
};
