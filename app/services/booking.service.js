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
 getMyReservations: async (page = 1, limit = 10) => {
        const user = authService.getUser();
        if (!user) return { data: [], total: 0 };

        try {
            const res = await http.request('/api/reserva/list', 'POST', { 
                usuario_id: user.usuario_id || user.id,
                limit: limit, // ✅ Usamos el límite dinámico (10)
                page: page
            });
            // Aseguramos formato de respuesta
            if (Array.isArray(res)) return { data: res, total: res.length };
            return res;
        } catch (e) {
            console.error("Error obteniendo mis reservas:", e);
            return { data: [], total: 0 };
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
            
            const rawRanges = response.data?.slots || response.slots || [];
            
            // ✅ CORREGIDO: Usar nueva lógica para priorizar bloqueos
            return processRangeToSlots(rawRanges);

        } catch (e) {
            console.error("❌ Error cargando agenda:", e);
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
            
            credito_id: reservationData.creditoId || null,
            monto_credito: reservationData.montoCredito || 0, // Nuevo campo enviado

            detalles: reservationData.slots.map(slot => ({
                hora_inicio: slot.time + ":00",
                hora_fin: calculateEndTime(slot.time) + ":00", 
                precio: slot.price
            }))
        };

        return await http.request('/api/reservas/crear', 'POST', payload);
    },

getUserCredits: async () => {
        const user = authService.getUser();
        if (!user) return [];
        try {
            const res = await http.request('/api/usuarios/creditos', 'POST', { usuario_id: user.usuario_id || user.id });
            return Array.isArray(res.creditos) ? res.creditos : [];
        } catch (e) {
            console.error("Error obteniendo créditos:", e);
            return [];
        }
    },

};

function processRangeToSlots(ranges) {
    // 🔍 DEBUG: Mira esto en la consola del navegador (F12)
    console.log("⬇️ DATOS RECIBIDOS DEL BACKEND:", ranges);

    const slots = [];
    
    // Función auxiliar para convertir "HH:mm:ss" a minutos (ej: "10:30" -> 630)
    const timeToMinutes = (timeStr) => {
        if (!timeStr) return null; // Retorna null si no hay hora
        const [h, m] = timeStr.split(':').map(Number);
        return (h * 60) + (m || 0);
    };

    // Recorremos las 24 horas del día (0 a 23)
    for (let hour = 0; hour < 24; hour++) {
        // Rango de ESTE bloque de 1 hora (ej: 10:00 a 11:00)
        const slotStart = hour * 60; 
        const slotEnd = (hour + 1) * 60;

        // Filtramos qué rangos de la BD tocan esta hora
        const coveringRanges = ranges.filter(r => {
            let rangeStart = timeToMinutes(r.hora || r.hora_inicio);
            let rangeEnd = timeToMinutes(r.hora_fin || r.hora_final);

            // 🛡️ PROTECCIÓN CRÍTICA:
            // Si rangeEnd es null o igual a rangeStart (error de datos), asumimos que dura 1 hora (60 min)
            if (rangeEnd === null || rangeEnd === rangeStart) {
                rangeEnd = rangeStart + 60; 
            }
            // Caso especial: Si termina "00:00" y es un rango de apertura ("available"), es el final del día
            else if (rangeEnd === 0 && (r.estado === 'available' || r.estado === 'disponible')) {
                rangeEnd = 1440; // 24 horas * 60 min
            }
            // Caso especial: Si es una reserva ("booked") y termina en "00:00", cuidado que no bloquee todo el día anterior
            // (La lógica estricta de abajo lo maneja, pero aseguramos que 0 sea 1440 solo si el inicio es menor)
            else if (rangeEnd === 0 && rangeStart < 1440) {
                 rangeEnd = 1440;
            }

            // Lógica de colisión:
            // Un rango ocupa este slot si: Empieza antes de que termine el slot Y Termina después de que empiece
            return rangeStart < slotEnd && rangeEnd > slotStart;
        });

        // Determinar estado por prioridad
        let status = 'closed';
        let price = 0;

        // 1. Buscamos si hay BLOQUEOS (Reservas)
        const bookedRange = coveringRanges.find(r => 
            r.estado === 'booked' || r.estado === 'reservado' || r.estado === 'ocupado'
        );

        // 2. Buscamos si está ABIERTO (Horario atención)
        const availableRange = coveringRanges.find(r => 
            r.estado === 'available' || r.estado === 'disponible' || r.estado === 'activo'
        );

        if (bookedRange) {
            status = 'booked';
        } else if (availableRange) {
            status = 'available';
            price = parseFloat(availableRange.precio);
        }

        slots.push({
            time: `${hour.toString().padStart(2, '0')}:00`,
            displayTime: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`,
            status: status,
            price: price
        });
    }

    return slots;
}

// Helper interno
function calculateEndTime(startTime) {
    const [h, m] = startTime.split(':').map(Number);
    const endH = h + 1;
    return `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}