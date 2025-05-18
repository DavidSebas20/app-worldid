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
