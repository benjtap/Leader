import api from './api';

export default {
    getActivities() {
        return api.get('/Activities');
    }
};
