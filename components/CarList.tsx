"use client";
import { useState } from "react";
import type { Car, Client } from "@/types";
import CarCard from "@/components/CarCard";
import BidModal from "@/components/BidModal";

interface CarListProps {
  cars: Car[];
  client: Client | null;
  refreshData: () => void;
  loading: boolean;
}

export default function CarList({
  cars,
  client,
  refreshData,
  loading,
}: CarListProps) {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const handleBidClick = (car: Car) => {
    setSelectedCar(car);
    setIsBidModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Autos Disponibles para Subasta</h1>

      {loading ? (
        <div className="text-center py-10">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-500 mt-4">Cargando autos...</p>
          </div>
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">
            No hay autos disponibles en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <CarCard
              key={car._id}
              car={car}
              onBidClick={() => handleBidClick(car)}
              client={client}
              refreshData={refreshData}
            />
          ))}
        </div>
      )}

      {selectedCar && (
        <BidModal
          car={selectedCar}
          isOpen={isBidModalOpen}
          onClose={() => setIsBidModalOpen(false)}
          client={client}
          refreshData={refreshData}
        />
      )}
    </div>
  );
}
