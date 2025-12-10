// ✅ Utilidad para corregir URLs de imágenes del Backend
export function getAbsoluteImageUrl(relativePath) {
    if (!relativePath) return 'assets/images/default-stadium.jpg'; // Imagen por defecto
    
    // Si ya es absoluta, devolver tal cual
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }
    
    let cleanPath = relativePath;
    
    // Limpieza de rutas que vienen de PHP (public/...)
    if (cleanPath.startsWith('public/')) cleanPath = cleanPath.substring(7);
    else if (cleanPath.startsWith('public\\')) cleanPath = cleanPath.substring(7);
    
    cleanPath = cleanPath.replace(/\\/g, '/');
    cleanPath = cleanPath.replace(/^\//, '');
    
    // ⚠️ Ajusta este puerto si tu backend no corre en el 8000
    const baseUrl = "https://sys-res-cancha-back.onrender.com"; 
    return `${baseUrl}/${cleanPath}`;
}

// ✅ Utilidad para cargar Leaflet dinámicamente
export function loadLeaflet() {
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link'); link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
        const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; document.head.appendChild(script);
    }
}

// ✅ Extraer lat/lng de una URL de Google Maps
export function parseCoordsFromUrl(url) {
    if (!url) return null;
    let match = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    match = url.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    return null;
}