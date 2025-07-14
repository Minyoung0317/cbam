import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ESG");
    
    const taxData = await db.collection("Tax_E").findOne({});
    
    if (!taxData) {
      return NextResponse.json({ error: "Tax_E data not found" }, { status: 404 });
    }

    return NextResponse.json({ total: taxData["합계"] });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
