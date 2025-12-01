import http from "./httpClient.js";
import { authService } from "./auth.service.js";

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

        getCanchaInfo: async (canchaId) => {
        try {
            // Nota: Asumimos que existe este endpoint público o usamos el de lista filtrando
            // Si no tienes GET /api/canchas/{id}, podrías usar el de búsqueda de complejos
            // Para simplificar, asumiremos que puedes obtener info básica.
            // Si no, podríamos necesitar crear un endpoint simple en PHP: public function getCancha($id)...
            return await http.request(`/api/canchas/${canchaId}`, 'GET');
        } catch (e) {
            console.error("Error cargando info cancha", e);
            return { nombre: 'Cancha', complejo_id: 0 };
        }
    },

  getAvailability: async (canchaId, date) => {
        try {
            console.log(`📅 Consultando agenda para cancha ${canchaId} en fecha ${date}`);
            
            const response = await http.request('/api/alquiler/agenda', 'POST', {
                cancha_id: canchaId,
                fecha: date
            });
            
            // Detectar estructura de respuesta (directa o empaquetada)
            const slots = response.data?.slots || response.slots || [];
            
            if (slots.length === 0) {
                console.warn("⚠️ El backend devolvió 0 slots. Revisa AlquilerFacade.php");
            }

            // Mapeamos al formato visual
            return slots.map(s => ({
                time: s.hora.substring(0, 5), // "08:00:00" -> "08:00"
                displayTime: `${s.hora.substring(0, 5)} - ${s.hora_fin.substring(0, 5)}`,
                status: s.estado, // 'available', 'booked', 'closed'
                price: parseFloat(s.precio)
            }));

        } catch (e) {
            console.error("❌ Error cargando agenda:", e);
            return [];
        }
    },
    // Generador de slots local (Legacy/Fallback) - Solo si el backend fallara totalmente
    generateSlots: (rangos) => { return []; },

    // Procesar los rangos del backend y convertirlos en slots de 1 hora
    generateSlots: (horariosBackend) => {
        const slots = [];
        const startOfDay = 6; // 6:00 AM
        const endOfDay = 23;  // 11:00 PM

        for (let hour = startOfDay; hour < endOfDay; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00:00`;
            const timeStrEnd = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
            
            // Verificar estado de esta hora específica
            let status = 'closed'; // Por defecto cerrado
            let price = 0;

            // Buscamos si esta hora cae dentro de algún rango del backend
            const rango = horariosBackend.find(h => 
                timeStr >= h.hora_inicio && timeStr < h.hora_fin
            );

            if (rango) {
                status = rango.disponible ? 'available' : 'booked';
                price = parseFloat(rango.monto);
            }

            slots.push({
                time: `${hour}:00`,
                displayTime: `${hour}:00 - ${hour + 1}:00`,
                status: status, // available, booked, closed
                price: price
            });
        }
        return slots;
    }

    
};