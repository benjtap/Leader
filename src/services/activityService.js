import api from './api';

export default {
    getActivities() {
        return api.get('/Activities');
    },
    createActivity(activity) {
        return api.post('/Activities', activity);
    }
};
