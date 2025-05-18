import { type NextRequest, NextResponse } from "next/server";

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

    // Usar la URL directa que funciona en Postman
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
