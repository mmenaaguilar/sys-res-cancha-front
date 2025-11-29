import http from "./httpClient.js";

export const contactService = {
    
    list: async (complejoId) => {
        try {
            const res = await http.request('/api/contactos/list', 'POST', { complejo_id: parseInt(complejoId) });
            if(Array.isArray(res)) return res;
            if(res.data && Array.isArray(res.data)) return res.data;
            return [];
        } catch(e) { return []; }
    },

    create: async (data) => {
        return await http.request('/api/contactos', 'POST', data);
    },

    update: async (id, data) => {
        return await http.request(`/api/contactos/${id}`, 'PUT', data);
    },

    toggleStatus: async (id) => {
        return await http.request(`/api/contactos/status/${id}`, 'PUT');
    },

    delete: async (id) => {
        return await http.request(`/api/contactos/${id}`, 'DELETE');
    }
};