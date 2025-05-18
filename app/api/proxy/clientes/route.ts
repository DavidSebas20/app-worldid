import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet");

    let url = "https://car-auction-api.onrender.com/api/clientes";
    if (wallet) {
      url += `?wallet=${encodeURIComponent(wallet)}`;
    }

    console.log("Proxy: Fetching clients from API", url);
    const response = await fetch(url, {
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
    console.log(
      "Proxy: Clients fetched successfully",
      Array.isArray(data) ? data.length : "object"
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error fetching clients:", error);
    return NextResponse.json(
      { error: "Error al obtener los clientes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Proxy: Creating new client", body);

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
      "https://car-auction-api.onrender.com/api/clientes",
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
    console.log("Proxy: Client created successfully", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error creating client:", error);
    return NextResponse.json(
      { error: "Error al crear el cliente" },
      { status: 500 }
    );
  }
}
