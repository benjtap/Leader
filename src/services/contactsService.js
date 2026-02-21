import api from './api';

export default {
    getAll() {
        return api.get('/Contacts');
    },
    getById(id) {
        return api.get(`/Contacts/${id}`);
    },
    create(data) {
        return api.post('/Contacts', data);
    },
    update(id, data) {
        return api.put(`/Contacts/${id}`, data);
    },
    delete(id) {
        return api.delete(`/Contacts/${id}`);
    }
};
