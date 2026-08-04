import { NextResponse } from "next/server";
import { fetchServeurs } from "@/lib/serveurs";

export async function GET() {
  try {
    const serveurs = await fetchServeurs();
    return NextResponse.json(serveurs);
  } catch (err) {
    return NextResponse.json({ error: "Impossible de récupérer les statuts" }, { status: 502 });
  }
}
