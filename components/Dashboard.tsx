"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import CarList from "@/components/CarList";
import BottomNavigation from "@/components/BottomNavigation";
import MyBids from "@/components/MyBids";
import Profile from "@/components/Profile";
import AddCar from "@/components/AddCar";
import Header from "@/components/Header";
import type { Car, Client } from "@/types";
import { generateRandomWallet } from "@/utils/wallet";
import { clearImageCache } from "@/utils/imageCache";

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: false,
  });
  const [activeTab, setActiveTab] = useState("cars");
  const [cars, setCars] = useState<Car[]>([]);
  const [myBids, setMyBids] = useState([]);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Obtener el título según la pestaña activa
  const getTitle = () => {
    switch (activeTab) {
      case "cars":
        return "Autos Disponibles";
      case "mybids":
        return "Mis Pujas";
      case "addcar":
        return "Añadir Auto";
      case "profile":
        return "Mi Perfil";
      default:
        return "Subasta de Autos";
    }
  };

  // Generar o recuperar una wallet para el usuario
  useEffect(() => {
    // Si el usuario está autenticado, usar su wallet
    if (status === "authenticated" && session?.user?.name) {
      setUserWallet(session.user.name);
    } else if (status === "unauthenticated") {
      // Si no está autenticado, generar una wallet aleatoria
      const storedWallet = localStorage.getItem("userWallet");
      if (storedWallet) {
        setUserWallet(storedWallet);
      } else {
        const newWallet = generateRandomWallet();
        localStorage.setItem("userWallet", newWallet);
        setUserWallet(newWallet);
      }
    }
  }, [session, status]);

  // Actualizar la función fetchCars para usar nuestro proxy
  const fetchCars = async (force = false) => {
    // Si no es forzado y ha pasado menos de 5 minutos desde la última carga, no recargar
    const now = Date.now();
    if (!force && lastFetchTime > 0 && now - lastFetchTime < 5 * 60 * 1000) {
      console.log(
        "Usando datos en caché, última carga hace",
        Math.round((now - lastFetchTime) / 1000),
        "segundos"
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("Fetching cars...");

      const response = await fetch("/api/proxy/carros", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Cars fetched:", data.length);
      setCars(data);
      setLastFetchTime(now);
    } catch (error) {
      console.error("Error fetching cars:", error);
      setError("Error al cargar los autos. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Actualizar la función fetchMyBids para usar nuestro proxy
  const fetchMyBids = async (clientId: string) => {
    try {
      console.log("Fetching bids for client:", clientId);
      const response = await fetch(`/api/proxy/pujas?clienteId=${clientId}`);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Bids fetched:", data.length);
      setMyBids(data);
    } catch (error) {
      console.error("Error fetching bids:", error);
    }
  };

  const refreshData = (forceRefresh = false) => {
    // Si se fuerza el refresco, limpiar el caché de imágenes
    if (forceRefresh) {
      clearImageCache();
    }
    fetchCars(forceRefresh);
    if (client?._id) {
      fetchMyBids(client._id);
    }
  };

  // Manejar el registro de un nuevo cliente
  const handleClientRegistered = (newClient: Client) => {
    setClient(newClient);
    fetchMyBids(newClient._id);
  };

  // Manejar el cierre de sesión
  const handleLogout = () => {
    setClient(null);
    localStorage.removeItem("userWallet");
    setUserWallet(null);
    // Generar una nueva wallet aleatoria
    const newWallet = generateRandomWallet();
    localStorage.setItem("userWallet", newWallet);
    setUserWallet(newWallet);
  };

  // Determinar si el usuario está autenticado (tiene un cliente registrado)
  const isAuthenticated = !!client;

  return (
    <main className="flex min-h-screen flex-col">
      <Header title={getTitle()} />

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError("")}
          >
            <span className="sr-only">Cerrar</span>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      <div className="flex-1 p-4 pb-20">
        {activeTab === "cars" && (
          <CarList
            cars={cars}
            client={client}
            refreshData={refreshData}
            loading={loading}
          />
        )}
        {activeTab === "mybids" && (
          <MyBids bids={myBids} refreshData={refreshData} />
        )}
        {activeTab === "profile" && (
          <Profile
            client={client}
            loading={loading}
            onClientRegistered={handleClientRegistered}
            onLogout={handleLogout}
            userWallet={userWallet}
          />
        )}
        {activeTab === "addcar" && (
          <AddCar client={client} refreshData={() => refreshData(true)} />
        )}
      </div>
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAuthenticated={isAuthenticated}
      />
    </main>
  );
}
