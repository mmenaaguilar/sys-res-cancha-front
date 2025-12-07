import { navigate } from "../router.js";
import api from "../services/api.js";
import { bookingService } from "../services/booking.service.js";
import { UserTopNav } from "../components/UserTopNav.js";
import { getAbsoluteImageUrl } from "../utils/helpers.js";
import { toast } from "../utils/toast.js";

const bookingView = {
    state: {
        canchaId: null,
        complejoId: null,
        canchaInfo: null,
        complejoInfo: null,
        currentDate: new Date(),
        selectedSlots: new Set(),
        slotsData: [],
        paymentMethods: [],
        isProcessing: false
    },

    render: async (params) => {
        bookingView.state.canchaId = params.id;
        const user = api.getUser();
        
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
                <!-- CONTENIDO REAL -->
                <div id="bookingContent">
                    <!-- HERO (Igual que antes) -->
                    <div class="booking-hero" id="heroBg">
                        <div class="hero-overlay"></div>
                        <div class="container hero-inner">
                            <button id="btnBackBook" class="btn-back-hero">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Volver
                            </button>
                            <div class="hero-info">
                                <span class="badge-sport" id="sportBadge">Deporte</span>
                                <h1 id="courtNameDisplay">Cargando...</h1>
                                <p id="complexNameDisplay">...</p>
                            </div>
                        </div>
                    </div>

                    <div class="container page-content">
                        <!-- CONTROL FECHA -->
                        <div class="date-control-bar">
                            <h3 class="section-title mb-0">Selecciona Horario</h3>
                            <div class="date-picker-wrapper">
                                <button id="prevDay" class="btn-circle">&lt;</button>
                                <div class="input-date-box">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    <input type="text" id="datePicker" readonly>
                                </div>
                                <button id="nextDay" class="btn-circle">&gt;</button>
                            </div>
                        </div>

                        <div class="legend">
                            <div class="legend-item"><span class="dot available"></span>Libre</div>
                            <div class="legend-item"><span class="dot selected"></span>Tu Selección</div>
                            <div class="legend-item"><span class="dot booked"></span>Ocupado</div>
                        </div>

                        <div id="slotsGrid" class="slots-grid"></div>
                    </div>

                    <div class="booking-footer" id="bookingFooter">
                        <div class="total-info">
                            <span class="label">Total a Pagar</span>
                            <span class="amount" id="totalAmount">S/ 0.00</span>
                        </div>
                        <button id="btnOpenPayment" class="btn-confirm" disabled>
                            Continuar Reserva
                        </button>
                    </div>
                </div>

                <!-- ✅ MODAL DE PAGO INTEGRADO -->
                <div id="paymentModal" class="modal" style="display:none;">
                    <div class="modal-overlay"></div>
                    <div class="modal-content card-modal">
                        <div class="modal-header">
                            <h3>Confirmar Pago</h3>
                            <p>Completa tu reserva ahora</p>
                        </div>
                        <div class="modal-body">
                            <div class="summary-box">
                                <span>Total a pagar:</span>
                                <span id="modalTotalAmount" class="summary-total">S/ 0.00</span>
                            </div>

                            <div class="field-group">
                                <label>Método de Pago</label>
                                <select id="paymentMethodSelect" class="input-select">
                                    <option value="">Cargando métodos...</option>
                                </select>
                            </div>

                            <div class="modal-actions">
                                <button id="btnCancelPayment" class="btn-cancel">Cancelar</button>
                                <button id="btnProcessPayment" class="btn-pay">Pagar Ahora</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                /* Estilos Modal */
                .modal { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(5px); }
                .modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); }
                .modal-content { position: relative; z-index: 10; width: 90%; max-width: 400px; background: white; border-radius: 16px; overflow: hidden; animation: slideUp 0.3s ease-out; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
                
                .modal-header { background: #0f172a; padding: 20px; color: white; text-align: center; }
                .modal-header h3 { margin: 0; font-size: 1.4rem; }
                .modal-header p { color: #94a3b8; margin: 5px 0 0; font-size: 0.9rem; }
                
                .modal-body { padding: 25px; }
                .summary-box { background: #f8fafc; padding: 15px; border-radius: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e2e8f0; }
                .summary-total { font-size: 1.5rem; color: #0f172a; font-weight: 800; }
                
                .field-group { margin-bottom: 25px; }
                .field-group label { display: block; color: #475569; font-weight: 700; margin-bottom: 8px; font-size: 0.9rem; }
                .input-select { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; font-size: 1rem; outline: none; }
                
                .modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .btn-cancel { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 12px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .btn-cancel:hover { background: #f1f5f9; }
                .btn-pay { background: #2563eb; border: none; color: white; padding: 12px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); }
                .btn-pay:hover { background: #1d4ed8; transform: translateY(-1px); }
                
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            </style>
        `;
    },

    attachEventListeners: async () => {
        try {
            const infoCancha = await bookingService.getCanchaInfo(bookingView.state.canchaId);
            bookingView.state.canchaInfo = infoCancha;
            bookingView.state.complejoId = infoCancha.complejo_id;
            
            if (infoCancha.complejo_id) {
                const publicDetails = await api.getPublicDetails(infoCancha.complejo_id);
                bookingView.state.complejoInfo = publicDetails.complex;
            }
            bookingView.updateUI();

            // ✅ Cargar métodos de pago al inicio
            const methods = await bookingService.getPaymentMethods();
            const select = document.getElementById('paymentMethodSelect');
            if (methods.length) {
                select.innerHTML = '<option value="">Selecciona...</option>' + 
                    methods.map(m => `<option value="${m.metodo_pago_id}">${m.nombre}</option>`).join('');
            } else {
                select.innerHTML = '<option value="">No hay métodos disponibles</option>';
            }

        } catch (e) { console.error(e); }

        const initCalendar = () => {
            if (typeof flatpickr === 'undefined') { setTimeout(initCalendar, 100); return; }
            const fp = flatpickr("#datePicker", {
                locale: { firstDayOfWeek: 1 }, dateFormat: "D d, M", defaultDate: bookingView.state.currentDate, minDate: "today", disableMobile: true,
                onChange: (selectedDates) => { bookingView.state.currentDate = selectedDates[0]; bookingView.loadSlots(); }
            });
            document.getElementById('prevDay').addEventListener('click', () => { const d = new Date(bookingView.state.currentDate); d.setDate(d.getDate() - 1); if (d >= new Date().setHours(0,0,0,0)) { bookingView.state.currentDate = d; fp.setDate(d); bookingView.loadSlots(); } });
            document.getElementById('nextDay').addEventListener('click', () => { const d = new Date(bookingView.state.currentDate); d.setDate(d.getDate() + 1); bookingView.state.currentDate = d; fp.setDate(d); bookingView.loadSlots(); });
        };
        initCalendar();
        await bookingView.loadSlots();
        document.getElementById('btnBackBook')?.addEventListener('click', () => window.history.back());

        // --- LÓGICA MODAL ---
        const modal = document.getElementById('paymentModal');
        
        document.getElementById('btnOpenPayment').addEventListener('click', () => {
            document.getElementById('modalTotalAmount').textContent = document.getElementById('totalAmount').textContent;
            modal.style.display = 'flex';
        });

        document.getElementById('btnCancelPayment').addEventListener('click', () => modal.style.display = 'none');

        document.getElementById('btnProcessPayment').addEventListener('click', async () => {
            const methodId = document.getElementById('paymentMethodSelect').value;
            if (!methodId) { toast.warning("Selecciona un método de pago"); return; }
            
            if (bookingView.state.isProcessing) return;
            bookingView.state.isProcessing = true;
            
            const btn = document.getElementById('btnProcessPayment');
            const originalText = btn.textContent;
            btn.textContent = "Procesando..."; btn.disabled = true;

            await bookingView.processBooking(methodId);
            
            // Restaurar botón en caso de error
            setTimeout(() => { 
               if(document.body.contains(btn)) { btn.textContent = originalText; btn.disabled = false; bookingView.state.isProcessing = false; }
            }, 3000);
        });
    },

    // ... (updateUI, loadSlots, renderSlots, toggleSlot, updateFooter IGUALES) ...
    updateUI: () => {
        const { canchaInfo, complejoInfo } = bookingView.state;
        document.getElementById('courtNameDisplay').textContent = canchaInfo.nombre || 'Cancha';
        document.getElementById('complexNameDisplay').textContent = complejoInfo?.nombre || 'Complejo';
        document.getElementById('sportBadge').textContent = canchaInfo.tipo_deporte_nombre || 'Deporte';
        if (complejoInfo?.url_imagen) {
            const imgUrl = getAbsoluteImageUrl(complejoInfo.url_imagen);
            document.getElementById('heroBg').style.backgroundImage = `linear-gradient(to bottom, rgba(15,23,42,0.3), rgba(15,23,42,0.9)), url('${imgUrl}')`;
        }
    },
    loadSlots: async () => {
        const grid = document.getElementById('slotsGrid');
        grid.innerHTML = '<div class="loading-slots"><div class="spinner"></div></div>';
        bookingView.state.selectedSlots.clear();
        bookingView.updateFooter();
        const d = bookingView.state.currentDate;
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const slots = await bookingService.getAvailability(bookingView.state.canchaId, dateStr);
        bookingView.state.slotsData = slots;
        bookingView.renderSlots(slots);
    },
    renderSlots: (slots) => {
        const grid = document.getElementById('slotsGrid');
        grid.innerHTML = '';
        if (!slots.length) { grid.innerHTML = '<div class="empty-msg">No hay horarios disponibles.</div>'; return; }
        slots.forEach((slot, index) => {
            const div = document.createElement('div');
            div.className = `time-slot ${slot.status}`;
            div.innerHTML = `<span class="time-range">${slot.displayTime}</span>`;
            if (slot.status === 'available') {
                div.innerHTML += `<span class="price">S/ ${slot.price}</span>`;
                div.onclick = () => bookingView.toggleSlot(index);
            } else if (slot.status === 'booked') { div.innerHTML += `<span class="status-label">Ocupado</span>`; } 
            else { div.innerHTML += `<span class="status-label">Cerrado</span>`; }
            grid.appendChild(div);
        });
    },
    toggleSlot: (index) => {
        if (bookingView.state.selectedSlots.has(index)) bookingView.state.selectedSlots.delete(index);
        else bookingView.state.selectedSlots.add(index);
        document.querySelectorAll('.time-slot')[index].classList.toggle('selected');
        bookingView.updateFooter();
    },
    updateFooter: () => {
        const total = Array.from(bookingView.state.selectedSlots).reduce((acc, idx) => acc + bookingView.state.slotsData[idx].price, 0);
        const count = bookingView.state.selectedSlots.size;
        const btn = document.getElementById('btnOpenPayment');
        document.getElementById('totalAmount').textContent = `S/ ${total.toFixed(2)}`;
        if (count > 0) { btn.disabled = false; document.getElementById('bookingFooter').classList.add('visible'); } 
        else { btn.disabled = true; document.getElementById('bookingFooter').classList.remove('visible'); }
    },

    // ✅ PROCESO FINAL
    processBooking: async (paymentMethodId) => {
        const selectedIndexes = Array.from(bookingView.state.selectedSlots).sort((a,b)=>a-b);
        const slots = selectedIndexes.map(i => bookingView.state.slotsData[i]);
        
        const d = bookingView.state.currentDate;
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const total = parseFloat(document.getElementById('totalAmount').textContent.replace('S/ ', ''));

        try {
            await bookingService.createReservation({
                canchaId: bookingView.state.canchaId,
                date: dateStr,
                total: total,
                slots: slots,
                paymentMethodId: paymentMethodId
            });

            document.getElementById('paymentModal').style.display = 'none';
            toast.success("¡Pago exitoso! Redirigiendo...");
            
            setTimeout(() => {
                navigate('/reservations'); // Redirección final
            }, 1500);

        } catch (error) {
            console.error(error);
            toast.error("Error en la reserva.");
            throw error; 
        }
    }
};

export default bookingView;