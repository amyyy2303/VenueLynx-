import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {

    const venues = await db.venue.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: "asc"
      }
    });

    return NextResponse.json({ venues });

  } catch (error) {

    console.error("Get venues error:", error);

    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    );
  }
}