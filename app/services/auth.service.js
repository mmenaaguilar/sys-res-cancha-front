// app/services/auth.service.js
import http from "./httpClient.js";

// Variable para guardar el temporizador del cierre de sesión automático
let logoutTimer;

export const authService = {
    
    // ==========================================================
    // LOGIN
    // ==========================================================
    login: async (credentials) => {
        // 1. Petición al Backend (POST /api/login)
        // El httpClient ya se encarga de extraer 'data' del JSON: { user, token, expires_in }
        const data = await http.request('/api/login', 'POST', credentials);
        
        if (data.token) {
            // 2. Calcular tiempo de expiración (viene en segundos, pasamos a ms)
            // Si el back no manda expires_in, asumimos 1 hora (3600s) por defecto.
            const expiresInDuration = (data.expires_in || 3600) * 1000;
            const expirationDate = new Date().getTime() + expiresInDuration;

            // 3. Guardar en LocalStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            // NOTA: Tu backend PHP actual no devuelve 'roles' en el login.
            // Guardamos un array vacío para evitar errores en isStaff()
            const roles = data.roles || []; 
            localStorage.setItem("roles", JSON.stringify(roles));
            
            localStorage.setItem("expirationDate", expirationDate);

            // 4. Iniciar el temporizador de seguridad
            authService.autoLogout(expiresInDuration);

            return data.user;
        }
        
        throw new Error("Error: El servidor no devolvió un token de acceso.");
    },

    // ==========================================================
    // REGISTRO
    // ==========================================================
    register: async (userData) => {
        // Petición al Backend (POST /api/register)
        // userData debe tener: { nombre, correo, telefono, contrasena }
        return await http.request('/api/register', 'POST', userData);
    },

    // ==========================================================
    // LOGOUT
    // ==========================================================
    logout: () => {
        // 1. Limpiar almacenamiento
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("roles");
        localStorage.removeItem("expirationDate");
        
        // 2. Limpiar temporizador si existe
        if (logoutTimer) {
            clearTimeout(logoutTimer);
        }
        
        // 3. Redirigir al inicio y recargar para limpiar estados de memoria
        window.location.href = "/"; 
    },

    // ==========================================================
    // AUTO LOGOUT (Timer)
    // ==========================================================
    autoLogout: (expirationDuration) => {
        if (logoutTimer) clearTimeout(logoutTimer);
        
        // Configura el cierre de sesión automático
        logoutTimer = setTimeout(() => {
            alert("Tu sesión ha expirado por seguridad.");
            authService.logout();
        }, expirationDuration);
    },

    // ==========================================================
    // RESTAURAR SESIÓN (Al recargar F5)
    // ==========================================================
    tryAutoLogin: () => {
        const token = localStorage.getItem("token");
        if (!token) return false;

        const expirationDateStr = localStorage.getItem("expirationDate");
        if (!expirationDateStr) return false;

        const expirationDate = new Date(parseInt(expirationDateStr));
        const now = new Date();

        // Si la fecha actual es mayor a la de expiración, el token venció
        if (now > expirationDate) {
            console.warn("🚫 Token expirado detectado al inicio.");
            authService.logout();
            return false;
        } else {
            // Si aún es válido, reiniciamos el temporizador con el tiempo restante
            const timeLeft = expirationDate.getTime() - now.getTime();
            authService.autoLogout(timeLeft);
            return true;
        }
    },

    // ==========================================================
    // GETTERS Y UTILIDADES
    // ==========================================================
    
    // Obtener objeto usuario
    getUser: () => {
        const u = localStorage.getItem("user");
        return u ? JSON.parse(u) : null;
    },
    
    // Saber si está logueado (solo check de existencia de token)
    isLoggedIn: () => {
        return !!localStorage.getItem("token"); 
    },

    // Saber si es Staff (Admin/Dueño)
    isStaff: () => {
        const rolesStr = localStorage.getItem("roles");
        if (!rolesStr) return false;
        try { 
            // IDs asumidos: 1=Admin, 2=Dueño. Ajusta según tu DB.
            const roles = JSON.parse(rolesStr);
            return roles.some(r => [1, 2].includes(Number(r))); 
        } catch (e) { 
            return false; 
        }
    },

    becomePartner: async () => {
        const user = authService.getUser();
        if (!user || !user.usuario_id) throw new Error("Usuario no identificado");

        // 1. Llamada al Backend (Ruta que me mostraste: /api/usuario-roles)
        // Asignamos Rol 2 (Gestor) para que administre su complejo. 
        // Si prefieres Rol 1 (Super Admin), cambia el 2 por 1.
        await http.request('/api/usuario-roles', 'POST', {
            usuario_id: user.usuario_id,
            rol_id: 2 // <--- ASIGNAMOS ROL GESTOR
        });

        // 2. Actualizar LocalStorage "en caliente" para no tener que reloguear
        let currentRoles = [];
        try { currentRoles = JSON.parse(localStorage.getItem("roles") || "[]"); } catch(e){}
        
        if (!currentRoles.includes(2)) {
            currentRoles.push(2);
            localStorage.setItem("roles", JSON.stringify(currentRoles));
        }

        return true;
    }
};