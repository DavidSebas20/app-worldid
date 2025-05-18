import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log("Proxy: Eliminando puja con ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "ID de la puja es requerido" },
        { status: 400 }
      );
    }

    // Usar la URL directa a la API
    const url = `https://car-auction-api.onrender.com/api/pujas/${id}`;
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
    console.log("Proxy: Puja eliminada exitosamente", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error eliminando puja:", error);
    return NextResponse.json(
      { error: "Error al eliminar la puja" },
      { status: 500 }
    );
  }
}
