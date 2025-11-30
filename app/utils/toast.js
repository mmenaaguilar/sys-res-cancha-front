// Crea el contenedor en el DOM si no existe
const getContainer = () => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
};

export const toast = {
    /**
     * Muestra una notificación
     * @param {string} message - Mensaje detallado
     * @param {string} type - 'success', 'error', 'info'
     * @param {string} title - Título (opcional)
     */
    show: (message, type = 'info', title = '') => {
        const container = getContainer();
        const toastEl = document.createElement('div');
        toastEl.className = `toast ${type}`;
        
        // Iconos SVG según el tipo
        let icon = '';
        if (type === 'success') icon = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        else if (type === 'error') icon = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
        else icon = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

        // Título por defecto si no se provee
        if (!title) {
            if (type === 'success') title = '¡Éxito!';
            else if (type === 'error') title = 'Error';
            else title = 'Información';
        }

        toastEl.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;

        // Cerrar al hacer clic
        toastEl.addEventListener('click', () => removeToast(toastEl));

        container.appendChild(toastEl);

        // Auto-cerrar después de 4 segundos
        setTimeout(() => removeToast(toastEl), 4000);
    },
    
    success: (msg, title) => toast.show(msg, 'success', title),
    error: (msg, title) => toast.show(msg, 'error', title),
    info: (msg, title) => toast.show(msg, 'info', title)
};

function removeToast(el) {
    el.classList.add('hiding');
    el.addEventListener('animationend', () => {
        if (el.parentNode) el.parentNode.removeChild(el);
    });
}