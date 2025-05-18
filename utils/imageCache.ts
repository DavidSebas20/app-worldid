// Servicio para manejar el caché de imágenes de autos

// Clave para el almacenamiento en localStorage
const CAR_IMAGES_CACHE_KEY = "car_images_cache";

// Interfaz para el objeto de caché
interface ImageCache {
  [carId: string]: string; // carId -> imageUrl
}

// Obtener el caché actual
export function getImageCache(): ImageCache {
  if (typeof window === "undefined") return {};

  try {
    const cache = localStorage.getItem(CAR_IMAGES_CACHE_KEY);
    return cache ? JSON.parse(cache) : {};
  } catch (error) {
    console.error("Error al leer el caché de imágenes:", error);
    return {};
  }
}

// Guardar una imagen en el caché
export function saveImageToCache(carId: string, imageUrl: string): void {
  if (typeof window === "undefined") return;

  try {
    const cache = getImageCache();
    cache[carId] = imageUrl;
    localStorage.setItem(CAR_IMAGES_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error al guardar imagen en caché:", error);
  }
}

// Obtener una imagen del caché
export function getImageFromCache(carId: string): string | null {
  const cache = getImageCache();
  return cache[carId] || null;
}

// Limpiar el caché completo
export function clearImageCache(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CAR_IMAGES_CACHE_KEY);
  } catch (error) {
    console.error("Error al limpiar el caché de imágenes:", error);
  }
}

// Limpiar una entrada específica del caché
export function removeFromCache(carId: string): void {
  if (typeof window === "undefined") return;

  try {
    const cache = getImageCache();
    if (cache[carId]) {
      delete cache[carId];
      localStorage.setItem(CAR_IMAGES_CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    console.error("Error al eliminar imagen del caché:", error);
  }
}
