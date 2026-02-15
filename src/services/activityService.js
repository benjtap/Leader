import api from './api';

export default {
    getActivities() {
        return api.get('/Activities');
    },
    createActivity(activity) {
        return api.post('/Activities', activity);
    },
    updateActivity(id, activity) {
        return api.put(`/Activities/${id}`, activity);
    },
    deleteActivity(id) {
        return api.delete(`/Activities/${id}`);
    }
};
