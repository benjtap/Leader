import api from './api';

export default {
    getAll() {
        return api.get('/Properties');
    },
    getById(id) {
        return api.get(`/Properties/${id}`);
    },
    create(data) {
        return api.post('/Properties', data);
    },
    update(id, data) {
        return api.put(`/Properties/${id}`, data);
    },
    delete(id) {
        return api.delete(`/Properties/${id}`);
    }
};
