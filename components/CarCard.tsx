"use client";
import { useState, useEffect } from "react";
import type { Car, Client } from "@/types";
import { getRandomCarImage, getRandomDefaultImage } from "@/utils/carImages";
import { getImageFromCache, saveImageToCache } from "@/utils/imageCache";

interface CarCardProps {
  car: Car;
  onBidClick: () => void;
  client: Client | null;
  refreshData: () => void;
}

export default function CarCard({
  car,
  onBidClick,
  client,
  refreshData,
}: CarCardProps) {
  const [carImage, setCarImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Obtener la imagen del auto cuando el componente se monta
  useEffect(() => {
    const getCarImage = () => {
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

        // Si no está en caché, obtener una imagen aleatoria según la marca
        const imageUrl = getRandomCarImage(car.marca);

        // Guardar en caché y establecer la imagen
        saveImageToCache(car._id, imageUrl);
        setCarImage(imageUrl);
      } catch (error) {
        console.error("Error al obtener imagen:", error);
        setImageError(true);

        // En caso de error, usar una imagen genérica
        const defaultImage = getRandomDefaultImage();
        setCarImage(defaultImage);
      } finally {
        setIsLoadingImage(false);
      }
    };

    getCarImage();
  }, [car._id, car.marca, car.modelo]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
        {isLoadingImage ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-500 mt-2">Cargando imagen...</p>
          </div>
        ) : carImage && !imageError ? (
          <div className="w-full h-full">
            <img
              src={carImage || "/placeholder.svg"}
              alt={`${car.marca} ${car.modelo}`}
              className="object-cover h-full w-full"
              onError={() => {
                console.log(
                  "Error al cargar la imagen, usando imagen de respaldo"
                );
                setImageError(true);
                // En caso de error, usar una imagen genérica
                setCarImage(getRandomDefaultImage());
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
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
