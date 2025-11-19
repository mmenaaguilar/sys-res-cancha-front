// js/views/adminView.js

const adminView = {
  render: () => {
    return `
      <div class="admin-layout">
        <!-- BARRA LATERAL DE NAVEGACIÓN -->
        <aside class="admin-sidebar">
          <div class="sidebar-header">
            <img src="assets/images/logo.png" alt="Logo">
            <strong>ReserSport</strong>
            <span>Admin Panel</span>
          </div>
          <nav class="sidebar-nav">
            <!-- Usamos data-section para identificar cada enlace -->
            <a href="#" class="active" data-section="canchas">Gestión de Canchas</a>
            <a href="#" data-section="reservas">Gestión de Reservas</a>
            <a href="#" data-section="servicios">Gestión de Servicios</a>
            <a href="#" data-section="contactos">Contactos</a>
          </nav>
        </aside>

        <!-- CONTENIDO PRINCIPAL (Ahora más genérico) -->
        <main class="admin-content">
          <div class="content-header">
            <h1 id="admin-title"></h1> <!-- El título se insertará aquí -->
            <div id="header-actions"></div> <!-- Los botones se insertarán aquí -->
          </div>
          <div id="admin-main-content">
            <!-- La tabla u otro contenido se insertará aquí -->
          </div>
        </main>
      </div>

      <!-- MODAL PARA CREAR/EDITAR CANCHA -->
      <div id="canchaModal" class="modal" style="display:none">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <button class="modal-close">&times;</button>
          <h3 id="modalTitle">Crear Nueva Cancha</h3>
          <form id="canchaForm" novalidate>
            <div class="field">
              <label for="canchaNombre" class="small">Nombre de la Cancha</label>
              <input type="text" id="canchaNombre" class="input" required />
            </div>
            <div class="field">
              <label for="canchaDeporte" class="small">Tipo de Deporte</label>
              <select id="canchaDeporte" class="select" required>
                <option value="Fútbol">Fútbol</option>
                <option value="Pádel">Pádel</option>
                <option value="Tenis">Tenis</option>
                <option value="Básquet">Básquet</option>
              </select>
            </div>
            <div class="field">
              <label for="canchaPrecio" class="small">Precio por Hora (S/)</label>
              <input type="number" id="canchaPrecio" class="input" required min="0" />
            </div>
            <button type="submit" class="btn" style="width:100%; margin-top:16px;">Guardar Cancha</button>
          </form>
        </div>
      </div>
    `;
  },

  attachEventListeners: () => {
    const sidebarNav = document.querySelector('.sidebar-nav');
    const adminTitle = document.getElementById('admin-title');
    const headerActions = document.getElementById('header-actions');
    const adminMainContent = document.getElementById('admin-main-content');

    // --- Definimos el contenido para cada sección ---
    const sections = {
      canchas: {
        title: 'Gestión de Canchas',
        actions: `<button id="addCanchaBtn" class="btn"><span class="plus-icon">+</span> Crear Cancha</button>`,
        content: `
          <div class="table-container">
            <table>
              <thead><tr><th>Nombre</th><th>Deporte</th><th>Precio/Hora</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody id="canchasTableBody">
                <tr><td>Cancha Principal</td><td>Fútbol</td><td>S/ 150.00</td><td><span class="status active">Activa</span></td><td><button class="btn-action btn-edit">Editar</button><button class="btn-action btn-delete">Eliminar</button></td></tr>
                <tr><td>Pádel Cristal A</td><td>Pádel</td><td>S/ 80.00</td><td><span class="status active">Activa</span></td><td><button class="btn-action btn-edit">Editar</button><button class="btn-action btn-delete">Eliminar</button></td></tr>
                <tr><td>Tenis Arcilla B</td><td>Tenis</td><td>S/ 90.00</td><td><span class="status inactive">Inactiva</span></td><td><button class="btn-action btn-edit">Editar</button><button class="btn-action btn-delete">Eliminar</button></td></tr>
              </tbody>
            </table>
          </div>`
      },
      reservas: {
        title: 'Gestión de Reservas',
        actions: '', // Sin botón por ahora
        content: `<div class="placeholder">Aquí se mostrará la tabla de reservas.</div>`
      },
      servicios: {
        title: 'Gestión de Servicios',
        actions: '', // Sin botón por ahora
        content: `<div class="placeholder">Aquí se mostrará la tabla de servicios adicionales (bebidas, alquiler de equipos, etc.).</div>`
      },
      contactos: {
        title: 'Contactos',
        actions: '', // Sin botón por ahora
        content: `<div class="placeholder">Aquí se mostrará la lista de contactos o mensajes recibidos.</div>`
      }
    };

    // --- Función para renderizar una sección ---
    const renderSection = (sectionName) => {
      const section = sections[sectionName];
      if (!section) return;

      adminTitle.textContent = section.title;
      headerActions.innerHTML = section.actions;
      adminMainContent.innerHTML = section.content;

      // Volver a adjuntar los listeners que dependen del contenido dinámico
      if (sectionName === 'canchas') {
        attachCanchaListeners();
      }
    };

    // --- Lógica de la barra lateral ---
    sidebarNav.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      e.preventDefault();
      const sectionName = link.dataset.section;

      // Actualizar clase activa
      sidebarNav.querySelector('.active').classList.remove('active');
      link.classList.add('active');

      // Renderizar el contenido de la sección
      renderSection(sectionName);
    });
    
    // --- Lógica específica para CANCHAS (modal y tabla) ---
    const attachCanchaListeners = () => {
      const addCanchaBtn = document.getElementById('addCanchaBtn');
      const modal = document.getElementById('canchaModal');
      const tableBody = document.getElementById('canchasTableBody');

      if (!addCanchaBtn || !modal || !tableBody) return;

      const overlay = modal.querySelector('.modal-overlay');
      const closeModalBtn = modal.querySelector('.modal-close');
      const canchaForm = document.getElementById('canchaForm');
      
      const openModal = () => modal.style.display = 'flex';
      const closeModal = () => {
        modal.style.display = 'none';
        canchaForm.reset();
      };
      
      addCanchaBtn.addEventListener('click', openModal);
      closeModalBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', closeModal);

      canchaForm.onsubmit = (e) => { // Usamos .onsubmit para evitar listeners duplicados
        e.preventDefault();
        const nombre = document.getElementById('canchaNombre').value;
        const deporte = document.getElementById('canchaDeporte').value;
        const precio = parseFloat(document.getElementById('canchaPrecio').value).toFixed(2);
        
        const newRowHTML = `<tr><td>${nombre}</td><td>${deporte}</td><td>S/ ${precio}</td><td><span class="status active">Activa</span></td><td><button class="btn-action btn-edit">Editar</button><button class="btn-action btn-delete">Eliminar</button></td></tr>`;
        tableBody.insertAdjacentHTML('beforeend', newRowHTML);
        closeModal();
      };

      tableBody.onclick = (e) => { // Usamos .onclick para delegación de eventos
        const target = e.target;
        if (target.classList.contains('btn-edit')) {
          alert('Funcionalidad "Editar" por implementar.');
        }
        if (target.classList.contains('btn-delete')) {
          if (confirm('¿Estás seguro de que quieres eliminar esta cancha?')) {
            target.closest('tr').remove();
          }
        }
      };
    };

    // --- Renderizado Inicial ---
    renderSection('canchas');

    console.log("AdminView: Event Listeners adjuntados.");
  },
};

export default adminView;