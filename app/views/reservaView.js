// app/views/reservaView.js

const reservaView = {
  render: () => {
    return `
    <header>
  <div class="brand">
    <!-- Logo (ruta local: backend servirá) -->
    <img src="/mnt/data/dc2cf1f5-30a9-4c3c-9177-524b92468584.jpg" alt="logo">
    <div>
      <h3>ReserSport <small style="display:block;color:#9fbfb1;font-weight:500">Elige tu cancha</small></h3>
    </div>
  </div>

  <div style="display:flex;align-items:center;gap:12px">
    <div style="color:var(--muted);font-size:14px">Inicio</div>
    <div style="color:var(--muted);font-size:14px">Software para Clubes</div>
    <div style="color:var(--muted);font-size:14px">Mis Reservas</div>
    <img src="assets/images/favorito.png" alt="Mis Favoritos">
  </div>
</header>

<div class="wrap">
  <h1>Complejo: Lawn Tennis Sport</h1>
  <div class="location">Prolongación Alcázar S/N — Las Lomas, Rímac, Lima</div>

  <div class="panel">
    <!-- IZQUIERDA: timeline -->
    <div class="left">
      <div class="header-row">
        <div>
          <div class="title">Elige tu turno</div>
          <div style="color:var(--muted);font-size:13px">Selecciona uno o varios bloques según disponibilidad</div>
        </div>
        <div style="color:var(--muted);font-size:13px">Intervalos desde 30 minutos</div>
      </div>

      <div class="timeline" role="region" aria-label="Tabla de horarios">
        <table class="schedule" role="grid" aria-label="Horario canchas">
          <thead>
            <tr>
              <th style="text-align:left;padding-left:18px">Cancha</th>
              <!-- encabezado de horas dinámico -->
               <th id="thead-hours" colspan="18"></th>
              </tr>
            </thead>
          <tbody id="tablaCanchas"></tbody>
        </table>
      </div>

      <div class="legend">
        <div class="item"><span class="sw" style="background:var(--estado-disponible)"></span> Disponible</div>
        <div class="item"><span class="sw" style="background:var(--estado-ocupado)"></span> Ocupado</div>
        <div class="item"><span class="sw" style="background:var(--estado-mante)"></span> Mantenimiento</div>
        <div class="item" style="margin-left:auto;color:var(--muted)">*Selecciona varios bloques; cada bloque suma al total</div>
      </div>
    </div>

    <!-- DERECHA: imagen, mapa, ubicacion, servicios y resumen -->
    <aside class="right" aria-label="Panel derecho">
      <div class="complex-image" title="Imagen del complejo (subida por admin)">
        <!-- Imagen del complejo: el backend debe servir esta ruta -->
        <img src="/mnt/data/2dddd4ba-499b-4cfd-baf9-304325c00b6c.png" alt="Imagen del complejo">
      </div>

      <!-- Ubicación desplegable -->
      <details class="collapse" open>
        <summary>Ubicación</summary>
        <div class="content">
          <strong>Lawn Tennis Sport (Sede principal)</strong><br>
          Prolongación Alcázar S/N — Las Lomas, Rímac, Lima.<br>
          Horario: Lun-Dom 06:00 - 23:00 (varía por cancha).
        </div>
      </details>

      <!-- Servicios desplegable -->
      <details class="collapse">
        <summary>Servicios del complejo</summary>
        <div class="content">
          • Vestuarios<br>
          • Estacionamiento<br>
          • Quincho<br>
          • Torneos<br>
          • Escuela deportiva<br>
          • Iluminación nocturna (obligatoria después de las 19:00)
        </div>
      </details>

      <!-- Mapa incrustado Google Maps (iframe simple con coords) -->
      <div style="margin-top:10px">
        <iframe class="map-frame"
          src="https://www.google.com/maps?q=-12.016,-77.042&z=15&output=embed"
          allowfullscreen="" loading="lazy"></iframe>
      </div>

      <!-- RESUMEN RESERVA -->
      <div class="reserve-box" role="region" aria-label="Resumen de reserva">
        <div class="line"><div style="color:var(--muted)">Precio por hora</div><div style="font-weight:700">S/ <span id="precioHoraDisplay">35.00</span></div></div>
        <div class="line"><div style="color:var(--muted)">Horas seleccionadas</div><div><strong id="count">0</strong></div></div>
        <div class="line" style="margin-top:6px"><div style="color:var(--muted)">Detalles</div><div style="text-align:right"><small id="detalle" style="color:#d0fbe0">—</small></div></div>
        <div style="margin-top:10px">
          <button id="reservarBtn" class="reserve-btn">Reservar ahora</button>
        </div>
      </div>
    </aside>
  </div>
</div>
    `;
  },

  attachEventListeners: () => {
     // Aquí va toda la lógica JS
     // Selección de bloques, cálculo de horas, total, botón reservar, etc.
  }
};

export default reservaView;
