import http from "./httpClient.js";
import { authService } from "./auth.service.js";

export const bookingService = {
    
    // --- GESTIÓN ADMIN (Listado General) ---
    list: async (complejoId, page = 1, search = '') => {
        const payload = {
            complejo_id: complejoId ? parseInt(complejoId) : null,
            page: page,
            limit: 10,
            searchTerm: search // backend espera 'searchTerm'
        };
        return await http.request('/api/reserva/list', 'POST', payload);
    },

    // --- GESTIÓN USUARIO (Mis Reservas) ---
    getMyReservations: async () => {
        const user = authService.getUser();
        if (!user) return [];

        try {
            const res = await http.request('/api/reserva/list', 'POST', { 
                usuario_id: user.usuario_id || user.id,
                limit: 20 
            });
            return Array.isArray(res) ? res : (res.data || []);
        } catch (e) {
            console.error("Error obteniendo mis reservas:", e);
            return [];
        }
    },

    // --- DETALLES Y ACCIONES ---
    getDetails: async (reservaId) => {
        return await http.request('/api/reserva-detalle/list', 'POST', { reserva_id: reservaId });
    },

    confirmPayment: async (id) => {
        return await http.request(`/api/reserva/confirmar-pago/${id}`, 'POST'); // Asegúrate de tener esta ruta en PHP o usa update status
        // Si no tienes ruta específica, usa la lógica de update si existe
    },

    cancel: async (id) => {
        return await http.request(`/api/reserva/cancelar/${id}`, 'PUT');
    },

    // --- PROCESO DE RESERVA (BOOKING) ---
    
    // 1. Info para Header
    getCanchaInfo: async (canchaId) => {
        try {
            return await http.request(`/api/canchas/${canchaId}`, 'GET');
        } catch (e) {
            return { nombre: 'Cancha', complejo_id: 0 };
        }
    },

    // 2. Disponibilidad (Agenda)
    getAvailability: async (canchaId, date) => {
        try {
            const response = await http.request('/api/alquiler/agenda', 'POST', {
                cancha_id: canchaId,
                fecha: date
            });
            
            const slots = response.data?.slots || response.slots || [];
            
            return slots.map(s => ({
                time: s.hora.substring(0, 5), 
                displayTime: `${s.hora.substring(0, 5)} - ${s.hora_fin.substring(0, 5)}`,
                status: s.estado,
                price: parseFloat(s.precio)
            }));
        } catch (e) {
            console.error("Error cargando agenda:", e);
            return [];
        }
    },

    // 3. Métodos de Pago
    getPaymentMethods: async () => {
        try {
            const res = await http.request('/api/metodos-pago', 'GET');
            return Array.isArray(res) ? res : (res.data || []);
        } catch (e) { return []; }
    },

    // 4. Crear Reserva
    createReservation: async (reservationData) => {
        const user = authService.getUser();
        if (!user) throw new Error("Debes iniciar sesión.");

        const payload = {
            usuario_id: user.usuario_id || user.id,
            cancha_id: reservationData.canchaId,
            fecha_reserva: reservationData.date,
            total_pago: reservationData.total,
            metodo_pago_id: reservationData.paymentMethodId,
            detalles: reservationData.slots.map(slot => ({
                hora_inicio: slot.time + ":00",
                hora_fin: calculateEndTime(slot.time) + ":00", 
                precio: slot.price
            }))
        };

        return await http.request('/api/reservas/crear', 'POST', payload);
    }
};

// Helper interno
function calculateEndTime(startTime) {
    const [h, m] = startTime.split(':').map(Number);
    const endH = h + 1;
    return `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}