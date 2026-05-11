import { NextResponse } from "next/server"; import { getCategories } from "@/services/category-service"; export async function GET() { return NextResponse.json(await getCategories()); }
