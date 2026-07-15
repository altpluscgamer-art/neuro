import { NextResponse } from "next/server";
import { getAllSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getAllSettings();
  return NextResponse.json(settings);
}
