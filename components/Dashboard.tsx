"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import CarList from "@/components/CarList";
import BottomNavigation from "@/components/BottomNavigation";
import MyBids from "@/components/MyBids";
import Profile from "@/components/Profile";
import AddCar from "@/components/AddCar";
import type { Car, Client } from "@/types";
import { generateRandomName, generateRandomWallet } from "@/utils/wallet";

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: false,
    onUnauthenticated() {
      // No hacemos nada, permitimos el uso de wallet aleatoria
      console.log("No autenticado con NextAuth, usando wallet aleatoria");
    },
  });
  const [activeTab, setActiveTab] = useState("cars");
  const [cars, setCars] = useState<Car[]>([]);
  const [myBids, setMyBids] = useState([]);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [randomWallet, setRandomWallet] = useState<string | null>(null);
  const [isLoggedInWithRandom, setIsLoggedInWithRandom] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está usando una wallet aleatoria
    const storedWallet = localStorage.getItem("randomWallet");
    const loggedInWithRandom =
      localStorage.getItem("isLoggedInWithRandom") === "true";

    if (storedWallet) {
      setRandomWallet(storedWallet);
    } else {
      const newWallet = generateRandomWallet();
      localStorage.setItem("randomWallet", newWallet);
      setRandomWallet(newWallet);
    }

    setIsLoggedInWithRandom(loggedInWithRandom);
  }, []);

  // Actualizar la función fetchCars para usar nuestro proxy
  const fetchCars = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching cars...");

      const response = await fetch("/api/proxy/carros", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Cars fetched:", data.length);
      setCars(data);
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

  useEffect(() => {
    // Detectar errores de autenticación
    if (status === "unauthenticated" && !isLoggedInWithRandom) {
      // Verificar si hubo un intento de inicio de sesión
      const errorParam = new URLSearchParams(window.location.search).get(
        "error"
      );
      if (errorParam) {
        console.error("Error de autenticación detectado:", errorParam);
        setAuthError(true);
      }
    }
  }, [status, isLoggedInWithRandom]);

  useEffect(() => {
    // Determinar qué wallet usar
    let walletToUse = null;

    try {
      // Intentar usar la wallet de la sesión si está disponible
      if (session?.user?.name) {
        walletToUse = session.user.name;
        console.log("Usando wallet de sesión:", walletToUse);
      } else if (isLoggedInWithRandom && randomWallet) {
        // Si no hay sesión pero está logueado con wallet aleatoria
        walletToUse = randomWallet;
        console.log("Usando wallet aleatoria:", walletToUse);
      }
    } catch (err) {
      console.error("Error al acceder a la sesión:", err);
      // Si hay error al acceder a la sesión, intentar usar wallet aleatoria
      if (isLoggedInWithRandom && randomWallet) {
        walletToUse = randomWallet;
        console.log("Error en sesión, usando wallet aleatoria:", walletToUse);
      }
    }

    // Solo intentamos crear/obtener el cliente cuando tenemos una wallet
    if (walletToUse) {
      const fetchOrCreateClient = async () => {
        try {
          setLoading(true);
          setError("");
          console.log("Fetching or creating client for wallet:", walletToUse);

          // First try to find if client exists
          const response = await fetch(
            `/api/proxy/clientes?wallet=${encodeURIComponent(
              walletToUse || ""
            )}`
          );

          if (!response.ok) {
            throw new Error(`Error HTTP al buscar cliente: ${response.status}`);
          }

          const clients = await response.json();
          console.log("Clients response:", clients);

          if (Array.isArray(clients) && clients.length > 0) {
            console.log("Client found:", clients[0]);
            setClient(clients[0]);
            fetchMyBids(clients[0]._id);
          } else {
            // Create new client with a random name
            const randomName = generateRandomName();
            const walletShort = walletToUse?.slice(0, 6) || "";
            const newClient = {
              wallet: walletToUse,
              nombre: randomName,
              correo: `${randomName
                .toLowerCase()
                .replace(" ", ".")}@ejemplo.com`,
            };

            console.log("Creating new client:", newClient);

            // Usar la nueva ruta de registro
            const createResponse = await fetch("/api/proxy/clientes/registro", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newClient),
            });

            if (!createResponse.ok) {
              const errorText = await createResponse.text();
              console.error("Error response:", errorText);
              throw new Error(
                `Error HTTP al crear cliente: ${createResponse.status}`
              );
            }

            const createdClient = await createResponse.json();
            console.log("Client created successfully:", createdClient);
            setClient(createdClient);
          }
        } catch (error) {
          console.error("Error with client:", error);
          setError(
            "Error al cargar o crear el perfil de cliente. Por favor, intente de nuevo."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchOrCreateClient();
    } else if (status === "unauthenticated" && !isLoggedInWithRandom) {
      // Si el usuario no está autenticado y no está usando wallet aleatoria, limpiamos el cliente
      setClient(null);
      setLoading(false);
    }
  }, [session, status, randomWallet, isLoggedInWithRandom]);

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

  const refreshData = () => {
    fetchCars();
    if (client?._id) {
      fetchMyBids(client._id);
    }
  };

  // Determinar si el usuario está autenticado (ya sea con Worldcoin o con wallet aleatoria)
  const isAuthenticated = !!session || isLoggedInWithRandom;

  return (
    <main className="flex min-h-screen flex-col">
      {authError && (
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative m-4"
          role="alert"
        >
          <span className="block sm:inline">
            Hubo un problema con la autenticación de Worldcoin. Puedes usar la
            wallet aleatoria para probar la aplicación.
          </span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setAuthError(false)}
          >
            <span className="sr-only">Cerrar</span>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

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
            loading={status === "loading"}
            randomWallet={randomWallet}
            isLoggedInWithRandom={isLoggedInWithRandom}
            setIsLoggedInWithRandom={setIsLoggedInWithRandom}
            authError={authError}
          />
        )}
        {activeTab === "addcar" && (
          <AddCar client={client} refreshData={refreshData} />
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
