"use client";
import { useState, useEffect } from "react";
import type { Car } from "@/types";
import { getImageFromCache, saveImageToCache } from "@/utils/imageCache";

interface CarCardProps {
  car: Car;
  onBidClick: () => void;
}

export default function CarCard({ car, onBidClick }: CarCardProps) {
  const [carImage, setCarImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Buscar la imagen del auto cuando el componente se monta
  useEffect(() => {
    const fetchCarImage = async () => {
      try {
        setIsLoadingImage(true);
        setImageError(false);

        // Primero verificar si la imagen ya está en caché
        const cachedImage = getImageFromCache(car._id);
        if (cachedImage) {
          console.log("Usando imagen en caché para", car.marca, car.modelo);
          setCarImage(cachedImage);
          setIsLoadingImage(false);
          return;
        }

        // Si no está en caché, intentar obtener una imagen de la API principal
        try {
          const response = await fetch(
            `/api/proxy/car-image?marca=${encodeURIComponent(
              car.marca
            )}&modelo=${encodeURIComponent(car.modelo)}&año=${car.año}`,
            { cache: "no-store" } // Evitar caché para obtener resultados frescos
          );

          if (response.ok) {
            const data = await response.json();

            if (data.imageUrl) {
              console.log(
                "Imagen encontrada para",
                car.marca,
                car.modelo,
                ":",
                data.imageUrl
              );
              setCarImage(data.imageUrl);
              // Guardar en caché
              saveImageToCache(car._id, data.imageUrl);
              setIsLoadingImage(false);
              return; // Importante: salir de la función si encontramos una imagen
            }
          } else {
            console.error(
              `Error en la respuesta de la API: ${response.status}`
            );
          }
        } catch (error) {
          console.error("Error al buscar imagen principal:", error);
          // No hacemos throw aquí, simplemente continuamos con el fallback
        }

        // Solo llegamos aquí si no se encontró una imagen o hubo un error
        console.log("No se encontró imagen, usando respaldo para", car.marca);

        try {
          const fallbackResponse = await fetch(
            `/api/proxy/car-image-fallback?marca=${encodeURIComponent(
              car.marca
            )}`
          );

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();

            if (fallbackData.imageUrl) {
              console.log(
                "Usando imagen de respaldo para",
                car.marca,
                ":",
                fallbackData.imageUrl
              );
              setCarImage(fallbackData.imageUrl);
              // Guardar en caché
              saveImageToCache(car._id, fallbackData.imageUrl);
            } else {
              setImageError(true);
            }
          } else {
            console.error(
              `Error en la respuesta de fallback: ${fallbackResponse.status}`
            );
            setImageError(true);
          }
        } catch (fallbackError) {
          console.error("Error al obtener imagen de respaldo:", fallbackError);
          setImageError(true);
        }
      } catch (error) {
        console.error("Error general al obtener imagen:", error);
        setImageError(true);
      } finally {
        setIsLoadingImage(false);
      }
    };

    fetchCarImage();
  }, [car._id, car.marca, car.modelo, car.año]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
        {isLoadingImage ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-500 mt-2">Cargando imagen...</p>
          </div>
        ) : carImage && !imageError ? (
          <img
            src={carImage || "/placeholder.svg"}
            alt={`${car.marca} ${car.modelo}`}
            className="object-cover h-full w-full"
            onError={() => {
              console.error("Error al cargar la imagen:", carImage);
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <img
              src={`/placeholder.svg?height=200&width=300&text=${car.marca}+${car.modelo}`}
              alt={`${car.marca} ${car.modelo}`}
              className="object-cover h-full w-full"
            />
            {imageError && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                No se pudo cargar la imagen
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold">
          {car.marca} {car.modelo}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">Año: {car.año}</p>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Precio Inicial:{" "}
          <span className="font-semibold">
            ${car.precioInicial.toLocaleString()}
          </span>
        </p>

        <div className="mt-4">
          <button
            onClick={onBidClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Hacer Puja
          </button>
        </div>
      </div>
    </div>
  );
}
