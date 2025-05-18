"use client"
import type { Car } from "@/types"

interface CarCardProps {
  car: Car
  onBidClick: () => void
}

export default function CarCard({ car, onBidClick }: CarCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <img
          src={`/placeholder.svg?height=200&width=300&text=${car.marca}+${car.modelo}`}
          alt={`${car.marca} ${car.modelo}`}
          className="object-cover h-full w-full"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold">
          {car.marca} {car.modelo}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">Año: {car.año}</p>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Precio Inicial: <span className="font-semibold">${car.precioInicial.toLocaleString()}</span>
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
  )
}
