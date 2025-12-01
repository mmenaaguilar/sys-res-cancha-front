import http from "./httpClient.js";
import { toast } from "../utils/toast.js"; // Importado para evitar el uso de alert()

// Variable para guardar el temporizador del cierre de sesión automático
let logoutTimer;

export const authService = {
    
    // ==========================================================
    // LOGIN
    // ==========================================================
    login: async (credentials) => {
        // 1. Petición al Backend
        const data = await http.request('/api/login', 'POST', credentials);
        
        if (data.token) {
            const expiresInDuration = (data.expires_in || 3600) * 1000;
            const expirationDate = new Date().getTime() + expiresInDuration;

            // 2. Guardar Token y Usuario
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            // 3. Guardar ROLES
            const roles = data.roles || []; 
            localStorage.setItem("roles", JSON.stringify(roles));
            
            localStorage.setItem("expirationDate", expirationDate);

            // 4. Iniciar temporizador
            authService.autoLogout(expiresInDuration);

            return data.user;
        }
        
        throw new Error("Error: El servidor no devolvió un token de acceso.");
    },

    // ==========================================================
    // REGISTRO
    // ==========================================================
    register: async (userData) => {
        return await http.request('/api/register', 'POST', userData);
    },

    // ==========================================================
    // LOGOUT
    // ==========================================================
    logout: () => {
        // Lógica de limpieza crucial
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("roles");
        localStorage.removeItem("expirationDate");
        
        if (logoutTimer) clearTimeout(logoutTimer);
        
        // Redirección para forzar la recarga de la vista Home (ya sin datos de usuario)
        window.location.href = "/"; 
    },

    // ==========================================================
    // AUTO LOGOUT
    // ==========================================================
    autoLogout: (expirationDuration) => {
        if (logoutTimer) clearTimeout(logoutTimer);
        
        logoutTimer = setTimeout(() => {
            // CORRECCIÓN: Usar toast.error() en lugar de alert()
            toast.error("Tu sesión ha expirado por seguridad.");
            authService.logout();
        }, expirationDuration);
    },

    // ==========================================================
    // RESTAURAR SESIÓN
    // ==========================================================
    tryAutoLogin: () => {
        const token = localStorage.getItem("token");
        if (!token) return false;

        const expirationDateStr = localStorage.getItem("expirationDate");
        if (!expirationDateStr) return false;

        const expirationDate = new Date(parseInt(expirationDateStr));
        const now = new Date();

        if (now > expirationDate) {
            console.warn("🚫 Token expirado detectado al inicio.");
            authService.logout();
            return false;
        } else {
            const user = authService.getUser();
            // Verificación extra: si hay token pero no hay objeto de usuario, forzamos logout.
            if (!user) {
                console.warn("🚫 Token presente pero objeto de usuario faltante.");
                authService.logout();
                return false;
            }
            
            const timeLeft = expirationDate.getTime() - now.getTime();
            authService.autoLogout(timeLeft);
            return true;
        }
    },

    // ==========================================================
    // GETTERS
    // ==========================================================
    getUser: () => {
        const u = localStorage.getItem("user");
        return u ? JSON.parse(u) : null;
    },
    
    isLoggedIn: () => {
        return !!localStorage.getItem("token"); 
    },

    // Verifica si tiene rol 1 (Admin/Dueño) o 2 (Gestor)
    isStaff: () => {
        const rolesStr = localStorage.getItem("roles");
        if (!rolesStr) return false;
        try { 
            const roles = JSON.parse(rolesStr);
            // Verifica si tiene rol 1 o 2
            return roles.some(r => [1, 2].includes(Number(r))); 
        } catch (e) { 
            return false; 
        }
    },

    // ==========================================================
    // CONVERTIRSE EN GESTOR
    // ==========================================================
    becomePartner: async () => {
        const user = authService.getUser();
        if (!user || !user.usuario_id) throw new Error("Usuario no identificado");

        const ROL_A_ASIGNAR = 1; // 1 = Super Admin de Sede

        try {
            // 1. Llamada al Backend
            await http.request('/api/usuario-roles', 'POST', {
                usuario_id: user.usuario_id,
                rol_id: ROL_A_ASIGNAR, 
                complejo_id: null
            });
        } catch (e) {
            const msg = e.message || "";
            if (!msg.includes("clave única") && !msg.includes("Duplicate") && !msg.includes("ya tiene este rol")) {
                throw e; 
            }
        }

        // 2. Actualizar LocalStorage "en caliente"
        let currentRoles = [];
        try { 
            currentRoles = JSON.parse(localStorage.getItem("roles") || "[]"); 
            currentRoles = currentRoles.map(Number);
        } catch(e){}
        
        if (!currentRoles.includes(ROL_A_ASIGNAR)) {
            currentRoles.push(ROL_A_ASIGNAR);
            localStorage.setItem("roles", JSON.stringify(currentRoles));
        }

        return true;
    }
};