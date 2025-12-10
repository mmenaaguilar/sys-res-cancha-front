import { navigate } from "../router.js";
import api from "../services/api.js";
import { bookingService } from "../services/booking.service.js";
import { UserTopNav } from "../components/UserTopNav.js";
import { getAbsoluteImageUrl } from "../utils/helpers.js";
import { toast } from "../utils/toast.js";

// --- ICONOS SVG REFINADOS ---
const ICONS = {
    back: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
    calendar: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    prev: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>`,
    next: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>`,
    wallet: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 12V8H6a2 2 0 0 1 0-4h14v4" /><path d="M4 6v12a2 2 0 0 0 2 2h14v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>`,
    ticket: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>`,
    card: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>`,
    check: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>`,
    trash: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>`,
    chevronDown: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>`
};

const bookingView = {
    state: {
        canchaId: null,
        complejoId: null,
        canchaInfo: null,
        complejoInfo: null,
        currentDate: new Date(),
        selectedSlots: new Set(),
        slotsData: [],
        availableCredits: [], 
        selectedCredit: null,
        isProcessing: false
    },

    resetState: () => {
        bookingView.state.selectedSlots = new Set();
        bookingView.state.slotsData = [];
        bookingView.state.selectedCredit = null;
        bookingView.state.isProcessing = false;
        bookingView.state.currentDate = new Date();
        bookingView.state.complejoId = null;
    },

    render: async (params) => {
        bookingView.state.isProcessing = false; 
        bookingView.resetState(); 
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
                
                <div class="top-nav-bar">
                    <div class="container">
                        <button id="btnBackToComplex" class="btn-back-nav">
                            ${ICONS.back} <span>Volver al Complejo</span>
                        </button>
                    </div>
                </div>

                <div id="bookingContent">
                    <div class="booking-hero" id="heroBg">
                        <div class="hero-overlay"></div>
                        <div class="container hero-inner">
                            <div class="hero-info">
                                <span class="badge-sport" id="sportBadge">Deporte</span>
                                <h1 id="courtNameDisplay">Cargando...</h1>
                                <p id="complexNameDisplay">...</p>
                            </div>
                        </div>
                    </div>

                    <div class="container page-content">
                        <div class="date-control-bar">
                            <div class="date-label">
                                ${ICONS.calendar} <span>Selecciona tu horario</span>
                            </div>
                            <div class="date-picker-wrapper">
                                <button id="prevDay" class="btn-circle">${ICONS.prev}</button>
                                <div class="input-date-box">
                                    <input type="text" id="datePicker" readonly>
                                </div>
                                <button id="nextDay" class="btn-circle">${ICONS.next}</button>
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
                        <div class="footer-container">
                            <div class="total-info">
                                <span class="label">Total a pagar</span>
                                <span class="amount" id="totalAmount">S/ 0.00</span>
                            </div>
                            <button id="btnOpenPayment" class="btn-confirm-footer" disabled>
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>

                <div id="paymentModal" class="modal" style="display:none;">
                    <div class="modal-overlay"></div>
                    <div class="modal-content card-modal">
                        <div class="modal-header">
                            <div>
                                <h3>Confirmar Reserva</h3>
                                <p class="modal-subtitle">Resumen de tu pedido</p>
                            </div>
                            <button class="modal-close" id="btnCancelPayment">${ICONS.trash}</button>
                        </div>
                        
                        <div class="modal-body">
                            
                            <div class="ticket-summary">
                                <div class="ticket-row">
                                    <span>Subtotal</span>
                                    <span id="modalSubTotal" class="ticket-price">S/ 0.00</span>
                                </div>
                                
                                <div class="ticket-row discount" id="discountRow" style="display:none;">
                                    <span class="discount-label">
                                        ${ICONS.ticket} Crédito Aplicado
                                    </span>
                                    <span id="modalDiscount" class="discount-value">- S/ 0.00</span>
                                </div>
                                
                                <div class="ticket-divider"></div>
                                
                                <div class="ticket-total-row">
                                    <span>Total Final</span>
                                    <div class="total-wrapper">
                                        <span id="strikethroughPrice" class="strike-price" style="display:none;"></span>
                                        <span id="modalFinalTotal" class="final-price-display">S/ 0.00</span>
                                    </div>
                                </div>
                            </div>

                            <div class="section-group" id="creditsSection" style="display:none;">
                                <label class="section-label">${ICONS.wallet} Mis Créditos</label>
                                
                                <button id="btnOpenCreditsList" class="btn-select-coupon">
                                    <div class="coupon-left">
                                        <span class="coupon-icon-box">%</span>
                                        <span>Seleccionar cupón o saldo</span>
                                    </div>
                                    <span class="coupon-arrow">${ICONS.next}</span>
                                </button>

                                <div id="selectedCreditDisplay" class="selected-coupon-card" style="display:none;">
                                    <div class="coupon-active-info">
                                        <div class="check-icon-circle">${ICONS.check}</div>
                                        <div class="coupon-text-group">
                                            <span class="coupon-title">Crédito Aplicado</span>
                                            <span id="creditText" class="coupon-desc"></span>
                                        </div>
                                    </div>
                                    <button id="removeCredit" class="btn-remove-link">Quitar</button>
                                </div>
                            </div>

                            <div class="section-group">
                                <label class="section-label">${ICONS.card} Método de Pago</label>
                                <div class="select-wrapper">
                                    <select id="paymentMethodSelect" class="input-select-styled">
                                        <option value="">Cargando métodos...</option>
                                    </select>
                                    <div class="select-arrow">${ICONS.chevronDown}</div>
                                </div>
                            </div>

                            <button id="btnProcessPayment" class="btn-pay-now-large">
                                <span class="btn-text">Confirmar y Pagar</span>
                                <span class="btn-total-badge" id="btnTotalBadge">S/ 0.00</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div id="creditsListModal" class="modal" style="display:none; z-index:2100;">
                    <div class="modal-overlay" id="creditsOverlay"></div>
                    <div class="modal-content card-modal compact">
                        <div class="modal-header bg-gradient">
                            <h3 class="text-white">Mis Créditos</h3>
                            <button class="modal-close white" id="closeCreditsModal">${ICONS.trash}</button>
                        </div>
                        <div class="modal-body scrollable bg-gray">
                            <div id="creditsListContainer" class="credits-list"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                /* --- GENERAL & VARIABLES --- */
                :root {
                    --primary: #0f172a;
                    --primary-light: #334155;
                    --accent: #2563eb;
                    --success: #10b981;
                    --danger: #ef4444;
                    --bg-gray: #f8fafc;
                    --border: #e2e8f0;
                }
                
                /* --- NAVEGACIÓN --- */
                .top-nav-bar { background: white; border-bottom: 1px solid var(--border); padding: 12px 0; position: sticky; top: 0; z-index: 90; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .btn-back-nav { border: 1px solid var(--border); background: white; display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--primary-light); cursor: pointer; font-size: 0.9rem; transition: all 0.2s; padding: 6px 14px; border-radius: 99px; }
                .btn-back-nav:hover { background: var(--bg-gray); color: var(--primary); border-color: #cbd5e1; }

                /* --- HERO --- */
                .booking-hero { position: relative; height: 180px; background-size: cover; background-position: center; display: flex; align-items: flex-end; border-radius: 0 0 24px 24px; overflow: hidden; margin-bottom: 20px; }
                .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.9), rgba(15,23,42,0)); }
                .hero-inner { position: relative; z-index: 2; padding-bottom: 24px; width: 100%; }
                .hero-info h1 { margin: 4px 0; font-size: 2rem; color: white; letter-spacing: -0.5px; }
                .hero-info p { margin: 0; color: #cbd5e1; font-size: 1rem; }
                .badge-sport { background: var(--accent); color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

                /* --- MODAL ESTILO PREMIUM --- */
                .modal { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                
                /* Glassmorphism Overlay */
                .modal-overlay { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); animation: fadeIn 0.3s ease; }
                
                .modal-content { position: relative; z-index: 10; width: 100%; max-width: 450px; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .modal-content.compact { max-width: 380px; }

                .modal-header { padding: 24px 24px 10px; display: flex; justify-content: space-between; align-items: flex-start; }
                .modal-header h3 { margin: 0; font-size: 1.4rem; color: var(--primary); letter-spacing: -0.5px; }
                .modal-subtitle { margin: 4px 0 0; color: #64748b; font-size: 0.9rem; }
                .modal-header.bg-gradient { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); padding: 20px 24px; }
                .text-white { color: white !important; }

                .modal-close { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: all 0.2s; }
                .modal-close:hover { background: #fee2e2; color: var(--danger); transform: rotate(90deg); }
                .modal-close.white { background: rgba(255,255,255,0.2); color: white; }
                .modal-close.white:hover { background: rgba(255,255,255,0.3); }

                .modal-body { padding: 24px; }
                
                /* --- TICKET DE RESUMEN --- */
                .ticket-summary { background: #f8fafc; border: 1px solid var(--border); border-radius: 16px; padding: 20px; margin-bottom: 24px; position: relative; }
                .ticket-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.95rem; color: #64748b; }
                .ticket-price { font-weight: 600; color: var(--primary); }
                .ticket-row.discount { color: var(--success); }
                .discount-label { display: flex; align-items: center; gap: 6px; font-weight: 600; }
                .ticket-divider { height: 1px; background: #e2e8f0; border-bottom: 1px dashed #cbd5e1; margin: 15px 0; }
                
                .ticket-total-row { display: flex; justify-content: space-between; align-items: center; }
                .ticket-total-row span:first-child { font-weight: 700; font-size: 1.1rem; color: var(--primary); }
                .final-price-display { font-size: 1.6rem; font-weight: 800; color: var(--primary); letter-spacing: -1px; }
                .strike-price { text-decoration: line-through; color: #94a3b8; font-size: 0.9rem; margin-right: 8px; }

                /* --- SECCIONES INPUT --- */
                .section-group { margin-bottom: 20px; }
                .section-label { display: block; font-size: 0.85rem; font-weight: 700; color: #334155; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

                /* Botón Cupón */
                .btn-select-coupon { width: 100%; background: white; border: 1px solid var(--border); padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .btn-select-coupon:hover { border-color: var(--accent); box-shadow: 0 4px 10px rgba(37, 99, 235, 0.1); transform: translateY(-1px); }
                .coupon-left { display: flex; align-items: center; gap: 12px; font-weight: 500; color: #475569; }
                .coupon-icon-box { width: 32px; height: 32px; background: #eff6ff; color: var(--accent); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
                
                /* Cupón Seleccionado */
                .selected-coupon-card { background: #ecfdf5; border: 1px solid var(--success); border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
                .coupon-active-info { display: flex; align-items: center; gap: 12px; }
                .check-icon-circle { width: 28px; height: 28px; background: var(--success); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .coupon-text-group { display: flex; flex-direction: column; }
                .coupon-title { font-weight: 700; color: #064e3b; font-size: 0.9rem; }
                .coupon-desc { font-size: 0.8rem; color: #059669; }
                .btn-remove-link { background: none; border: none; color: var(--danger); font-weight: 600; font-size: 0.85rem; cursor: pointer; text-decoration: underline; }

                /* Select Input Styled */
                .select-wrapper { position: relative; }
                .input-select-styled { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--border); background: white; font-size: 1rem; color: var(--primary); appearance: none; cursor: pointer; transition: border 0.2s; }
                .input-select-styled:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                .select-arrow { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #64748b; }

                /* --- BOTÓN DE PAGO FINAL --- */
                .btn-pay-now-large { width: 100%; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; border: none; padding: 16px; border-radius: 16px; font-weight: 700; font-size: 1.1rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-top: 24px; box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.3); transition: all 0.3s; }
                .btn-pay-now-large:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(15, 23, 42, 0.4); }
                .btn-pay-now-large:active { transform: scale(0.98); }
                .btn-pay-now-large:disabled { background: #cbd5e1; cursor: not-allowed; transform: none; box-shadow: none; }
                .btn-total-badge { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 8px; font-size: 0.95rem; }

                /* --- LISTA DE CRÉDITOS --- */
                .bg-gray { background: #f8fafc; }
                .credit-item { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
                .credit-item:hover:not(.disabled) { border-color: var(--accent); box-shadow: 0 8px 16px -4px rgba(0,0,0,0.05); transform: translateY(-2px); }
                .credit-item.disabled { opacity: 0.6; cursor: not-allowed; background: #f1f5f9; filter: grayscale(1); }
                .credit-left { display: flex; align-items: center; gap: 16px; }
                .credit-icon-container { width: 42px; height: 42px; background: #eff6ff; color: var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
                .credit-info h4 { margin: 0; font-size: 1rem; color: var(--primary); font-weight: 700; }
                .credit-info p { margin: 2px 0 0; font-size: 0.8rem; color: #64748b; }
                .credit-value { font-size: 1.1rem; font-weight: 800; color: var(--success); }

                /* --- GRILLA Y FOOTER --- */
                .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 12px; margin-top: 20px; padding-bottom: 100px; }
                .time-slot { background: white; border: 1px solid var(--border); border-radius: 12px; height: 80px; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s; user-select: none; }
                .time-slot:hover { border-color: var(--accent); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1); }
                .time-slot.selected { background: var(--primary); color: white; border-color: var(--primary); transform: scale(1.05); box-shadow: 0 8px 16px rgba(15, 23, 42, 0.2); }
                .time-slot.selected .price { color: #93c5fd; }
                .time-slot.booked { background: #fef2f2; border-color: #fca5a5; opacity: 0.6; cursor: not-allowed; }
                
                .booking-footer { 
                    position: fixed; 
                    bottom: 20px; 
                    left: 50%; 
                    transform: translate(-50%, 150%); 
                    width: 90%; 
                    max-width: 500px; /* Un poco más compacto */
                    background: white; 
                    padding: 10px 10px 10px 25px; /* Más padding a la izquierda para el texto */
                    border-radius: 50px; /* Bordes totalmente redondos */
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15); 
                    z-index: 100; 
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    
                    /* Flex directo para alinear */
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                }

                .booking-footer.visible { 
                    transform: translate(-50%, 0); 
                }

                /* Eliminamos el contenedor intermedio o lo hacemos transparente */
                .footer-container { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    width: 100%;
                }

                .total-info {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    line-height: 1.1;
                }

                .total-info .label { 
                    display: block; 
                    font-size: 0.75rem; 
                    color: #64748b; 
                    text-transform: uppercase; 
                    font-weight: 700; 
                    margin-bottom: 2px;
                }

                .total-info .amount { 
                    font-size: 1.35rem; /* Un poco más pequeño para que no desborde */
                    font-weight: 800; 
                    color: var(--primary); 
                    letter-spacing: -0.5px; 
                }

                .btn-confirm-footer { 
                    background: var(--primary); 
                    color: white; 
                    border: none; 
                    padding: 14px 28px; /* Botón más gordito */
                    border-radius: 40px; 
                    font-weight: 700; 
                    cursor: pointer; 
                    font-size: 1rem; 
                    box-shadow: 0 4px 15px rgba(15, 23, 42, 0.3); 
                    transition: all 0.2s; 
                    flex-shrink: 0; /* Evita que el botón se aplaste */
                    margin-left: 15px; /* Separación segura del texto */
                }

                .btn-confirm-footer:hover { 
                    transform: scale(1.05); 
                }
                @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
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

            const methods = await bookingService.getPaymentMethods();
            const select = document.getElementById('paymentMethodSelect');
            if (methods.length) {
                select.innerHTML = '<option value="">Selecciona método de pago...</option>' + 
                    methods.map(m => `<option value="${m.metodo_pago_id}">${m.nombre}</option>`).join('');
            } else {
                select.innerHTML = '<option value="">No hay métodos</option>';
            }

            const credits = await bookingService.getUserCredits();
            bookingView.state.availableCredits = credits;
            if (credits.length > 0) {
                document.getElementById('creditsSection').style.display = 'block';
            }

        } catch (e) { console.error(e); }

        document.getElementById('btnBackToComplex').addEventListener('click', () => {
            if (bookingView.state.complejoId) {
                navigate(`/complejo/${bookingView.state.complejoId}`);
            } else {
                window.history.back();
            }
        });

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

        // --- LÓGICA MODAL PAGO ---
        const payModal = document.getElementById('paymentModal');
        const creditsModal = document.getElementById('creditsListModal');
        
        document.getElementById('btnOpenPayment').addEventListener('click', () => {
            bookingView.state.selectedCredit = null;
            document.getElementById('selectedCreditDisplay').style.display = 'none';
            document.getElementById('btnOpenCreditsList').style.display = 'flex'; 
            bookingView.updateModalTotals();
            payModal.style.display = 'flex';
        });

        document.getElementById('btnCancelPayment').addEventListener('click', () => payModal.style.display = 'none');

        document.getElementById('btnOpenCreditsList').addEventListener('click', () => {
            bookingView.renderCreditsList();
            creditsModal.style.display = 'flex';
        });
        
        document.getElementById('closeCreditsModal').addEventListener('click', () => creditsModal.style.display = 'none');
        document.getElementById('creditsOverlay').addEventListener('click', () => creditsModal.style.display = 'none');

        document.getElementById('removeCredit').addEventListener('click', () => {
            bookingView.state.selectedCredit = null;
            document.getElementById('selectedCreditDisplay').style.display = 'none';
            document.getElementById('btnOpenCreditsList').style.display = 'flex';
            bookingView.updateModalTotals();
        });

        document.getElementById('btnProcessPayment').addEventListener('click', async () => {
            const methodId = document.getElementById('paymentMethodSelect').value;
            if (!methodId) { toast.warning("Selecciona un método de pago"); return; }
            
            if (bookingView.state.isProcessing) return;
            bookingView.state.isProcessing = true;
            
            const btn = document.getElementById('btnProcessPayment');
            // Cambiar texto del botón grande
            const btnText = btn.querySelector('.btn-text');
            const originalText = btnText.innerText;
            btnText.innerText = "Procesando..."; btn.disabled = true;

            try {
                await bookingView.processBooking(methodId);
            } catch(e) {
                 btnText.innerText = originalText; btn.disabled = false; bookingView.state.isProcessing = false;
            }
        });
    },

    updateUI: () => {
        const { canchaInfo, complejoInfo } = bookingView.state;
        document.getElementById('courtNameDisplay').textContent = canchaInfo.nombre || 'Cancha';
        document.getElementById('complexNameDisplay').textContent = complejoInfo?.nombre || 'Complejo';
        document.getElementById('sportBadge').textContent = canchaInfo.tipo_deporte_nombre || 'Deporte';
        if (complejoInfo?.url_imagen) document.getElementById('heroBg').style.backgroundImage = `linear-gradient(to bottom, rgba(15,23,42,0.3), rgba(15,23,42,0.9)), url('${getAbsoluteImageUrl(complejoInfo.url_imagen)}')`;
    },
    loadSlots: async () => {
        document.getElementById('slotsGrid').innerHTML = '<div class="loading-slots"><div class="spinner"></div></div>';
        bookingView.state.selectedSlots.clear(); bookingView.updateFooter();
        const d = bookingView.state.currentDate;
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const slots = await bookingService.getAvailability(bookingView.state.canchaId, dateStr);
        bookingView.state.slotsData = slots; bookingView.renderSlots(slots);
    },
    renderSlots: (slots) => {
        const grid = document.getElementById('slotsGrid'); grid.innerHTML = '';
        if (!slots.length) { grid.innerHTML = '<div class="empty-msg">No hay horarios.</div>'; return; }
        slots.forEach((slot, index) => {
            const div = document.createElement('div'); div.className = `time-slot ${slot.status}`;
            div.innerHTML = `<span class="time-range">${slot.displayTime}</span>`;
            if (slot.status === 'available') {
                div.innerHTML += `<span class="price">S/ ${slot.price}</span>`;
                div.onclick = () => bookingView.toggleSlot(index);
            } else if (slot.status === 'booked') { div.title = "Ocupado"; } 
            
            grid.appendChild(div);
        });
    },
    toggleSlot: (index) => {
        if (bookingView.state.selectedSlots.has(index)) bookingView.state.selectedSlots.delete(index); else bookingView.state.selectedSlots.add(index);
        document.querySelectorAll('.time-slot')[index].classList.toggle('selected'); bookingView.updateFooter();
    },
    updateFooter: () => {
        const total = Array.from(bookingView.state.selectedSlots).reduce((acc, idx) => acc + bookingView.state.slotsData[idx].price, 0);
        const count = bookingView.state.selectedSlots.size;
        const btn = document.getElementById('btnOpenPayment');
        document.getElementById('totalAmount').textContent = `S/ ${total.toFixed(2)}`;
        if (count > 0) { btn.disabled = false; document.getElementById('bookingFooter').classList.add('visible'); } 
        else { btn.disabled = true; document.getElementById('bookingFooter').classList.remove('visible'); }
    },

    updateModalTotals: () => {
        const subtotal = Array.from(bookingView.state.selectedSlots).reduce((acc, idx) => acc + bookingView.state.slotsData[idx].price, 0);
        let discount = 0;
        
        if (bookingView.state.selectedCredit) {
            const creditAmount = parseFloat(bookingView.state.selectedCredit.monto);
            discount = Math.min(subtotal, creditAmount);
        }
        
        const totalFinal = subtotal - discount;

        document.getElementById('modalSubTotal').textContent = `S/ ${subtotal.toFixed(2)}`;
        document.getElementById('modalFinalTotal').textContent = `S/ ${totalFinal.toFixed(2)}`;
        document.getElementById('btnTotalBadge').textContent = `S/ ${totalFinal.toFixed(2)}`; // Badge en el botón grande
        
        const strikePrice = document.getElementById('strikethroughPrice');
        const discountRow = document.getElementById('discountRow');

        if(discount > 0) {
            strikePrice.style.display = 'inline';
            strikePrice.textContent = `S/ ${subtotal.toFixed(2)}`;
            discountRow.style.display = 'flex';
            document.getElementById('modalDiscount').textContent = `- S/ ${discount.toFixed(2)}`;
            document.getElementById('modalFinalTotal').style.color = '#10b981';
        } else {
            strikePrice.style.display = 'none';
            discountRow.style.display = 'none';
            document.getElementById('modalFinalTotal').style.color = '#0f172a';
        }
    },

    renderCreditsList: () => {
        const container = document.getElementById('creditsListContainer');
        const subtotal = Array.from(bookingView.state.selectedSlots).reduce((acc, idx) => acc + bookingView.state.slotsData[idx].price, 0);
        
        const validCredits = bookingView.state.availableCredits.filter(c => !c.estado || c.estado === 'disponible' || c.estado === 'activo');

        if (validCredits.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:40px 20px; color:#64748b;">
                                    <div style="font-size:2rem; margin-bottom:10px;">😢</div>
                                    No tienes cupones disponibles.</div>`;
            return;
        }

        container.innerHTML = validCredits.map(c => {
            const amount = parseFloat(c.monto);
            const date = c.fecha_expiracion ? new Date(c.fecha_expiracion).toLocaleDateString() : 'Sin caducidad';
            
            const isTooBig = amount > subtotal;
            const disabledClass = isTooBig ? 'disabled' : '';
            const clickEvent = isTooBig ? '' : `onclick="window.selectCreditItem(${c.credito_id})"`;
            
            const msg = isTooBig 
                ? '<span style="color:#ef4444; font-size:0.7rem; font-weight:700; background:#fef2f2; padding:2px 8px; border-radius:4px;">Excede el total</span>' 
                : '';

            return `
                <div class="credit-item ${disabledClass}" ${clickEvent}>
                    <div class="credit-left">
                        <div class="credit-icon-container">
                            ${ICONS.ticket}
                        </div>
                        <div class="credit-info">
                            <h4>Bono Promocional</h4>
                            <p>Vence: ${date}</p>
                            ${msg}
                        </div>
                    </div>
                    <div class="credit-value">S/ ${amount.toFixed(2)}</div>
                </div>
            `;
        }).join('');

        window.selectCreditItem = (id) => {
            const credit = bookingView.state.availableCredits.find(c => c.credito_id == id);
            bookingView.state.selectedCredit = credit;
            bookingView.updateModalTotals();
            
            document.getElementById('btnOpenCreditsList').style.display = 'none';
            document.getElementById('selectedCreditDisplay').style.display = 'flex';
            document.getElementById('creditText').textContent = `Ahorras S/ ${Math.min(subtotal, parseFloat(credit.monto)).toFixed(2)}`;
            
            document.getElementById('creditsListModal').style.display = 'none';
        };
    },

    processBooking: async (paymentMethodId) => {
        const selectedIndexes = Array.from(bookingView.state.selectedSlots).sort((a,b)=>a-b);
        const slots = selectedIndexes.map(i => bookingView.state.slotsData[i]);
        
        const d = bookingView.state.currentDate;
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        
        const subtotal = slots.reduce((acc, slot) => acc + slot.price, 0);
        let montoCreditoUsado = 0;
        
        if (bookingView.state.selectedCredit) {
            const creditoDisponible = parseFloat(bookingView.state.selectedCredit.monto);
            montoCreditoUsado = Math.min(subtotal, creditoDisponible);
        }
        
        const totalFinal = Math.max(0, subtotal - montoCreditoUsado);

        try {
            await bookingService.createReservation({
                canchaId: bookingView.state.canchaId,
                date: dateStr,
                total: totalFinal, 
                slots: slots,
                paymentMethodId: paymentMethodId,
                creditoId: bookingView.state.selectedCredit?.credito_id,
                montoCredito: montoCreditoUsado
            });

            document.getElementById('paymentModal').style.display = 'none';
            toast.success("¡Pago exitoso! Reserva confirmada.");
            setTimeout(() => navigate('/reservations'), 1500);

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al procesar el pago.");
            throw error; 
        }
    }
};

export default bookingView;