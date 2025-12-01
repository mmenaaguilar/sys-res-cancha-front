// app/services/api.js
import { authService } from "./auth.service.js";
import { complexService } from "./complex.service.js";
import { ubigeoService } from "./ubigeo.service.js";
import { fieldService } from "./field.service.js";
import { scheduleService } from "./schedule.service.js";
import { contactService } from "./contact.service.js";
import { serviceService } from "./service.service.js";
import { serviceScheduleService } from "./serviceSchedule.service.js";
import { policyService } from "./policy.service.js";
import { bookingService } from "./booking.service.js";
import { managerService } from "./manager.service.js";
import { userService } from "./user.service.js";
import { favoriteService } from "./favorite.service.js";


const api = {
    // --- AUTH (Funcionando con PHP) ---
    login: authService.login,
    register: authService.register,
    logout: authService.logout,
    isLoggedIn: authService.isLoggedIn,
    getUser: authService.getUser,
    isStaff: authService.isStaff,
    tryAutoLogin: authService.tryAutoLogin, // Agregado útil para el router
    becomePartner: authService.becomePartner,
    searchComplejos: complexService.search,
    getSports: complexService.getSports,

    getMyComplejos: complexService.getMyComplejos,
    createComplejo: complexService.create,
    updateComplejo: complexService.update,
    toggleComplejoStatus: complexService.toggleStatus,
    deleteComplejo: complexService.delete,

    getDepartamentos: ubigeoService.getDepartamentos,
    getProvincias: ubigeoService.getProvincias,
    getDistritos: ubigeoService.getDistritos,
    getLocationName: ubigeoService.getLocationName,

    getCanchasPaginated: fieldService.list,
    getCanchasByComplejo: fieldService.getByComplejo,
    createCancha: fieldService.create,
    updateCancha: fieldService.update,
    toggleCanchaStatus: fieldService.toggleStatus,
    deleteCancha: fieldService.delete,

    getHorariosBase: scheduleService.getBase,
    createHorarioBase: scheduleService.createBase,
    deleteHorarioBase: scheduleService.deleteBase,
    cloneHorarioBase: scheduleService.cloneDay,
    updateHorarioBase: scheduleService.updateBase,       // <--- NUEVO
    toggleStatusBase: scheduleService.toggleStatusBase,

    getHorariosSpecial: scheduleService.getSpecial,
    createHorarioSpecial: scheduleService.createSpecial,
    updateHorarioSpecial: scheduleService.updateSpecial,
    toggleStatusSpecial: scheduleService.toggleStatusSpecial,
    deleteHorarioSpecial: scheduleService.deleteSpecial,

    getContactos: contactService.list,
    createContacto: contactService.create,
    updateContacto: contactService.update,
    toggleStatusContacto: contactService.toggleStatus,
    deleteContacto: contactService.delete,

    getServicios: serviceService.list,
    createServicio: serviceService.create,
    updateServicio: serviceService.update,
    toggleStatusServicio: serviceService.toggleStatus,
    deleteServicio: serviceService.delete,

    getServicioHorarios: serviceScheduleService.list,
    createServicioHorario: serviceScheduleService.create,
    updateServicioHorario: serviceScheduleService.update,
    toggleStatusServicioHorario: serviceScheduleService.toggleStatus,
    deleteServicioHorario: serviceScheduleService.delete,

    getPoliticas: policyService.list,
    createPolitica: policyService.create,
    updatePolitica: policyService.update,
    toggleStatusPolitica: policyService.toggleStatus,
    deletePolitica: policyService.delete,

    getReservas: bookingService.list,
    getReservaDetalles: bookingService.getDetails,
    confirmarReserva: bookingService.confirmPayment,
    cancelarReserva: bookingService.cancel,
    getBookingAvailability: bookingService.getAvailability,
    getCanchaInfo: bookingService.getCanchaInfo,


    getGestores: managerService.list,
    inviteGestor: managerService.invite,
    deleteGestor: managerService.delete,
    isOwnerOf: managerService.isOwnerOf, 
    getUser: managerService.getUser,

    getUserCredits: userService.getCreditos,
    updateUserProfile: userService.updateProfile,
    changeUserPassword: userService.cambiarContrasena,

    getPublicDetails: complexService.getPublicDetails, 
    getActiveLocations: complexService.getActiveLocations,

    getMyFavorites: favoriteService.getUserFavoritesMap,
    addFavorite: favoriteService.add,
    removeFavorite: favoriteService.remove,
    getFavoritesList: favoriteService.getList,

};

export default api;