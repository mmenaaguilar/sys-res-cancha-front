import http from "./httpClient.js";

export const bookingService = {
    
    list: async (complejoId, page = 1, search = '') => {
        const payload = {
            complejo_id: complejoId ? parseInt(complejoId) : null,
            page: page,
            limit: 10,
            search: search
        };
        return await http.request('/api/reserva/list', 'POST', payload);
    },

    getDetails: async (reservaId) => {
        return await http.request('/api/reserva-detalle/list', 'POST', { reserva_id: reservaId });
    },

    confirmPayment: async (id) => {
        return await http.request(`/api/reserva/confirmar-pago/${id}`, 'POST');
    },

    cancel: async (id) => {
        return await http.request(`/api/reserva/cancelar/${id}`, 'PUT');
    },

    getReservas: async (complejoId, page, searchTerm) => {
    // Debe enviar 'searchTerm' en el cuerpo del POST o GET
    return await httpClient.request('/api/reservas', 'POST', { 
        complejo_id: complejoId, 
        page: page,
        searchTerm: searchTerm  // <--- ¡Esto es vital!
    });
},
};