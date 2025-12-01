import { navigate } from "../router.js";
import api from "../services/api.js"; // Asegúrate de exportar bookingService aquí
import { bookingService } from "../services/booking.service.js";
import { UserTopNav } from "../components/UserTopNav.js";
import { toast } from "../utils/toast.js";

const bookingView = {
    state: {
        canchaId: null,
        complejoId: null, // Necesario para la API
        canchaInfo: null,
        currentDate: new Date(),
        selectedSlots: new Set(), // Para guardar horas seleccionadas
        slotsData: []
    },

    render: async (params) => {
        bookingView.state.canchaId = params.id;
        const user = api.getUser();
        
        // Inyectar Flatpickr si no está
        if (!document.getElementById('flatpickr-css')) {
            const l = document.createElement('link'); l.id='flatpickr-css'; l.rel='stylesheet'; l.href='https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css'; document.head.appendChild(l);
            const s = document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/flatpickr'; document.head.appendChild(s);
        }

        setTimeout(() => {
            const nav = document.getElementById('bookingTopNav');
            if(nav) { nav.innerHTML = UserTopNav.render('reservations', user); UserTopNav.attachListeners(); }
        }, 0);

        return `
            <div id="bookingTopNav"></div>
            <div class="booking-page fade-in">
                <div class="container page-content">
                    
                    <!-- HEADER: Info Cancha + Selector Fecha -->
                    <div class="booking-header card">
                        <div class="header-info">
                            <h2 id="courtName">Cargando cancha...</h2>
                            <p id="complexName" class="text-muted">...</p>
                        </div>
                        <div class="date-controls">
                            <button id="prevDay" class="btn-circle">&lt;</button>
                            <input type="text" id="datePicker" class="date-display" readonly>
                            <button id="nextDay" class="btn-circle">&gt;</button>
                        </div>
                    </div>

                    <!-- LEYENDA -->
                    <div class="legend">
                        <span class="legend-item"><span class="dot available"></span>Libre</span>
                        <span class="legend-item"><span class="dot selected"></span>Seleccionado</span>
                        <span class="legend-item"><span class="dot booked"></span>Ocupado</span>
                        <span class="legend-item"><span class="dot closed"></span>Cerrado</span>
                    </div>

                    <!-- GRID DE HORARIOS -->
                    <div id="slotsGrid" class="slots-grid">
                        <div class="loading-slots">Cargando horarios...</div>
                    </div>

                    <!-- FOOTER FLOTANTE (Resumen) -->
                    <div class="booking-footer" id="bookingFooter">
                        <div class="total-info">
                            <span class="total-label">Total a pagar:</span>
                            <span class="total-amount" id="totalAmount">S/ 0.00</span>
                        </div>
                        <button id="btnConfirmBooking" class="btn-confirm" disabled>
                            Continuar Reserva
                        </button>
                    </div>

                </div>
            </div>
        `;
    },

    attachEventListeners: async () => {
        const { canchaId } = bookingView.state;

        // 1. Cargar Info Cancha (Nombre, ComplejoID)
        // Nota: Si no tienes endpoint de getCancha, aquí deberás improvisar o usar data mock
        // Por ahora intentamos obtenerlo.
        try {
            // IMITAMOS OBTENCIÓN DE DATOS (Ajustar según tu backend real)
            // Si tu backend no tiene endpoint público de cancha, esto fallará.
            // Solución rápida: Asumir que venimos del detalle y pasar datos por estado global o URL.
            // Por ahora, haremos una llamada segura.
            const info = await bookingService.getCanchaInfo(canchaId);
            bookingView.state.canchaInfo = info;
            bookingView.state.complejoId = info.complejo_id; // CRÍTICO

            document.getElementById('courtName').textContent = info.nombre || 'Cancha';
            document.getElementById('complexName').textContent = info.complejo_nombre || 'Complejo Deportivo';
        } catch (e) {
            console.warn("No se pudo cargar info detallada cancha");
        }

        // 2. Inicializar Calendario
        const initCalendar = () => {
            if (typeof flatpickr === 'undefined') { setTimeout(initCalendar, 100); return; }
            
            const fp = flatpickr("#datePicker", {
                locale: { firstDayOfWeek: 1 },
                dateFormat: "D d, M", // Ej: Lun 25, Dic
                defaultDate: bookingView.state.currentDate,
                minDate: "today",
                disableMobile: true,
                onChange: (selectedDates) => {
                    bookingView.state.currentDate = selectedDates[0];
                    bookingView.loadSlots();
                }
            });

            document.getElementById('prevDay').addEventListener('click', () => {
                const d = new Date(bookingView.state.currentDate);
                d.setDate(d.getDate() - 1);
                if (d >= new Date().setHours(0,0,0,0)) {
                    bookingView.state.currentDate = d;
                    fp.setDate(d);
                    bookingView.loadSlots();
                }
            });

            document.getElementById('nextDay').addEventListener('click', () => {
                const d = new Date(bookingView.state.currentDate);
                d.setDate(d.getDate() + 1);
                bookingView.state.currentDate = d;
                fp.setDate(d);
                bookingView.loadSlots();
            });
        };
        initCalendar();

        // 3. Cargar Horarios
        await bookingView.loadSlots();

        // 4. Botón Confirmar
        document.getElementById('btnConfirmBooking').addEventListener('click', () => {
            bookingView.processBooking();
        });
    },

    loadSlots: async () => {
        const grid = document.getElementById('slotsGrid');
        grid.innerHTML = '<div class="loading-slots"><div class="spinner"></div></div>';
        
        bookingView.state.selectedSlots.clear();
        bookingView.updateFooter();

        // ✅ CORRECCIÓN DE FECHA (Evita problemas de zona horaria)
        const d = bookingView.state.currentDate;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        console.log("Enviando fecha:", dateStr); // Para depurar

        const slots = await bookingService.getAvailability(bookingView.state.canchaId, dateStr);
        bookingView.state.slotsData = slots;
        
        bookingView.renderSlots(slots);
    },

    renderSlots: (slots) => {
        const grid = document.getElementById('slotsGrid');
        grid.innerHTML = '';

        if (slots.length === 0) {
            grid.innerHTML = '<div class="empty-msg">No hay horarios disponibles para este día.</div>';
            return;
        }

        slots.forEach((slot, index) => {
            const div = document.createElement('div');
            div.className = `time-slot ${slot.status}`;
            div.textContent = slot.time;
            div.dataset.index = index;
            
            if (slot.status === 'available') {
                div.innerHTML += `<span class="price">S/ ${slot.price}</span>`;
                div.onclick = () => bookingView.toggleSlot(index);
            } else if (slot.status === 'booked') {
                div.innerHTML += `<span class="status-text">Ocupado</span>`;
            } else {
                div.innerHTML += `<span class="status-text">Cerrado</span>`;
            }

            grid.appendChild(div);
        });
    },

    toggleSlot: (index) => {
        const slot = bookingView.state.slotsData[index];
        if (bookingView.state.selectedSlots.has(index)) {
            bookingView.state.selectedSlots.delete(index);
        } else {
            bookingView.state.selectedSlots.add(index);
        }
        
        // Actualizar visualmente
        const els = document.querySelectorAll('.time-slot');
        els[index].classList.toggle('selected');
        
        bookingView.updateFooter();
    },

    updateFooter: () => {
        const total = Array.from(bookingView.state.selectedSlots).reduce((acc, idx) => {
            return acc + bookingView.state.slotsData[idx].price;
        }, 0);

        const btn = document.getElementById('btnConfirmBooking');
        const count = bookingView.state.selectedSlots.size;
        
        document.getElementById('totalAmount').textContent = `S/ ${total.toFixed(2)}`;
        
        if (count > 0) {
            btn.disabled = false;
            btn.textContent = `Reservar (${count} h)`;
            document.getElementById('bookingFooter').classList.add('visible');
        } else {
            btn.disabled = true;
            btn.textContent = 'Selecciona horas';
            document.getElementById('bookingFooter').classList.remove('visible');
        }
    },

    processBooking: () => {
        const selectedIndexes = Array.from(bookingView.state.selectedSlots).sort((a, b) => a - b);
        const slots = selectedIndexes.map(i => bookingView.state.slotsData[i]);
        
        // Aquí iría la lógica para enviar la reserva al backend
        // O redirigir a una pasarela de pago / confirmación
        console.log("Reservando:", slots);
        
        // Ejemplo simple
        if(confirm(`Vas a reservar ${slots.length} horas por S/ ${document.getElementById('totalAmount').textContent}. ¿Confirmar?`)) {
            toast.success("¡Reserva iniciada! (Lógica pendiente)");
            // Aquí llamarías a api.createReservation(...)
        }
    }
};

export default bookingView;