import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PUBLIC_RUNS_FILE = path.join(process.cwd(), "public", "data", "simulation.json");

export async function GET(_request: NextRequest) {
  try {
    const data = await fs.readFile(PUBLIC_RUNS_FILE, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Failed to load runs", error);
    return NextResponse.json({ runs: [] });
  }
}
