import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clienteId = searchParams.get("clienteId");
    const carroId = searchParams.get("carroId");

    let url = "https://car-auction-api.onrender.com/api/pujas";
    const params = [];

    if (clienteId) {
      params.push(`clienteId=${clienteId}`);
    }

    if (carroId) {
      params.push(`carroId=${carroId}`);
    }

    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    console.log("Proxy: Fetching bids from API", url);
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
    console.log("Proxy: Bids fetched successfully", data.length);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error fetching bids:", error);
    return NextResponse.json(
      { error: "Error al obtener las pujas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Proxy: Creating new bid", body);

    // Asegurarse de que los datos tienen el formato correcto
    if (!body.clienteId) {
      return NextResponse.json(
        { error: "clienteId es obligatorio" },
        { status: 400 }
      );
    }
    if (!body.carroId) {
      return NextResponse.json(
        { error: "carroId es obligatorio" },
        { status: 400 }
      );
    }
    if (!body.monto || isNaN(body.monto)) {
      return NextResponse.json(
        { error: "monto debe ser un número válido" },
        { status: 400 }
      );
    }

    // Enviar los datos en el formato correcto
    const bidData = {
      clienteId: body.clienteId,
      carroId: body.carroId,
      monto: body.monto,
    };

    const response = await fetch(
      "https://car-auction-api.onrender.com/api/pujas",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bidData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Proxy: Bid created successfully", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error creating bid:", error);
    return NextResponse.json(
      { error: "Error al crear la puja" },
      { status: 500 }
    );
  }
}
