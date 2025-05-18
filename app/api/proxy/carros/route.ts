import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log("Proxy: Fetching cars from API");
    const response = await fetch(
      "https://car-auction-api.onrender.com/api/carros",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Proxy: Cars fetched successfully", data.length);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error fetching cars:", error);
    return NextResponse.json(
      { error: "Error al obtener los autos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Proxy: Creating new car", body);

    const response = await fetch(
      "https://car-auction-api.onrender.com/api/carros",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Proxy: Car created successfully", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error creating car:", error);
    return NextResponse.json(
      { error: "Error al crear el auto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log("Proxy: Eliminando carro con ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "ID del carro es requerido" },
        { status: 400 }
      );
    }

    const url = `https://car-auction-api.onrender.com/api/carros/${id}`;
    console.log("Enviando solicitud DELETE a:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Proxy: Carro eliminado exitosamente", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error eliminando carro:", error);
    return NextResponse.json(
      { error: "Error al eliminar el carro" },
      { status: 500 }
    );
  }
}
