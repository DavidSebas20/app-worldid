import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Proxy: Registrando nuevo cliente", body);

    // Asegurarse de que los datos del cliente son válidos
    if (!body.wallet) {
      return NextResponse.json(
        { error: "La wallet es obligatoria" },
        { status: 400 }
      );
    }

    // Asegurarse de que el nombre y correo tienen valores por defecto si no se proporcionan
    const clientData = {
      wallet: body.wallet,
      nombre: body.nombre || `Usuario-${body.wallet.slice(0, 6)}`,
      correo: body.correo || `usuario-${body.wallet.slice(0, 6)}@ejemplo.com`,
    };

    const response = await fetch(
      "https://car-auction-api.onrender.com/api/clientes/registro",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Proxy: Cliente registrado exitosamente", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error registrando cliente:", error);
    return NextResponse.json(
      { error: "Error al registrar el cliente" },
      { status: 500 }
    );
  }
}
