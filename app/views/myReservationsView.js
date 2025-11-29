// app/views/myReservationsView.js
import { navigate } from "../router.js";
import api from "../services/api.js";

const myReservationsView = {
  render: async () => {
    // 1. Verificar Login
    if (!api.isLoggedIn()) {
      alert("Debes iniciar sesión para ver tus reservas.");
      navigate("/");
      return "";
    }

    const user = api.getUser();

    return `
      <div class="container">
        <header style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2>Mis Reservas</h2>
            <p class="small" style="color: var(--text-muted);">Historial de tus partidos</p>
          </div>
          <button class="btn" onclick="window.history.back()" style="background: transparent; border: 1px solid var(--border-light);">
            ← Volver
          </button>
        </header>

        <div id="reservationsList">
            <div class="placeholder" style="height: 200px;">
                Cargando tus reservas...
            </div>
        </div>
      </div>
    `;
  },

  attachEventListeners: async () => {
    const listContainer = document.getElementById("reservationsList");

    try {
      // 1. OBTENER DATOS DEL BACKEND
      // Simulamos la respuesta basada en tu Base de Datos para que veas cómo queda
      // En producción usarías: const reservations = await api.get('/reservas/mis-reservas');
      
      const reservations = await simulateBackendResponse(); // Función fake abajo

      // 2. RENDERIZAR
      if (reservations.length === 0) {
        listContainer.innerHTML = `
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
            <p>Aún no tienes reservas registradas.</p>
            <button class="btn" id="btnExplore" style="margin-top: 16px;">Buscar canchas</button>
          </div>
        `;
        document.getElementById("btnExplore")?.addEventListener("click", () => navigate("/home"));
        return;
      }

      // Generar HTML de las tarjetas
      listContainer.innerHTML = `<div style="display: grid; gap: 16px;">${reservations.map(res => createReservationCard(res)).join('')}</div>`;

    } catch (error) {
      listContainer.innerHTML = `<div style="color: #ef4444; text-align: center;">Error al cargar: ${error.message}</div>`;
    }
    
    console.log("MyReservationsView: Renderizado completo.");
  }
};

// --- HELPER: Crear Tarjeta HTML ---
const createReservationCard = (res) => {
  // Mapeo de colores según estado de la DB
  const statusColors = {
    'pendiente_pago': 'background: rgba(255, 193, 7, 0.15); color: #ffc107;',
    'confirmada': 'background: rgba(0, 183, 125, 0.15); color: #00b77d;',
    'cancelado': 'background: rgba(239, 68, 68, 0.15); color: #ef4444;'
  };
  
  const statusLabel = {
    'pendiente_pago': 'Pendiente de Pago',
    'confirmada': 'Confirmada',
    'cancelado': 'Cancelada'
  };

  const styleStatus = statusColors[res.estado] || statusColors['pendiente_pago'];

  return `
    <div class="card" style="display: flex; flex-direction: column; gap: 12px; border-left: 4px solid var(--accent);">
      
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
            <h3 style="font-size: 1.1rem; margin-bottom: 4px;">${res.complejo_nombre}</h3>
            <div class="small" style="color: var(--text-muted);">${res.cancha_nombre} (${res.deporte})</div>
        </div>
        <span class="status" style="${styleStatus}">
            ${statusLabel[res.estado] || res.estado}
        </span>
      </div>

      <div style="display: flex; gap: 24px; border-top: 1px solid var(--border-light); padding-top: 12px; margin-top: 4px;">
        <div>
            <div class="small" style="color: var(--text-muted);">Fecha</div>
            <div style="font-weight: 600;">${formatDate(res.fecha)}</div>
        </div>
        <div>
            <div class="small" style="color: var(--text-muted);">Horario</div>
            <div style="font-weight: 600;">${res.hora_inicio.slice(0,5)} - ${res.hora_fin.slice(0,5)}</div>
        </div>
        <div>
            <div class="small" style="color: var(--text-muted);">Precio</div>
            <div style="font-weight: 600; color: var(--accent);">S/ ${res.precio}</div>
        </div>
      </div>
    </div>
  `;
};

// --- UTILIDADES ---
const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-PE', options);
};

// --- SIMULACIÓN DE DATOS (MOCK) ---
// Esto emula lo que tu Backend PHP debería devolver con un Query JOIN
const simulateBackendResponse = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    reserva_id: 101,
                    estado: 'confirmada',
                    complejo_nombre: 'Complejo "El Golazo"',
                    cancha_nombre: 'Cancha Sintética 1',
                    deporte: 'Fútbol 7',
                    fecha: '2023-11-25',
                    hora_inicio: '19:00:00',
                    hora_fin: '20:00:00',
                    precio: '80.00'
                },
                {
                    reserva_id: 102,
                    estado: 'pendiente_pago',
                    complejo_nombre: 'Club Tenis Tacna',
                    cancha_nombre: 'Cancha Arcilla A',
                    deporte: 'Tenis',
                    fecha: '2023-11-28',
                    hora_inicio: '08:00:00',
                    hora_fin: '10:00:00',
                    precio: '60.00'
                }
            ]);
        }, 800);
    });
};

export default myReservationsView;