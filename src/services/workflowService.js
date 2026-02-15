import api from './api';

export default {
    getWorkflow() {
        return api.get('/Workflow');
    },
    createStep(name) {
        return api.post('/Workflow', { name });
    },
    deleteStep(id) {
        return api.delete(`/Workflow/${id}`);
    },
    reorderSteps(orderedIds) {
        return api.put('/Workflow/reorder', orderedIds);
    },
    getListItems(type) {
        return api.get(`/Lists/${type}`);
    },
    deleteStepAndMove(id, targetType, targetUserId) {
        return api.post(`/Workflow/${id}/move-and-delete`, { targetType, targetUserId });
    }
};
