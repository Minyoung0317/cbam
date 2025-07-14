import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ESG");
    
    const taxData = await db.collection("Tax").findOne({});
    
    if (!taxData) {
      return NextResponse.json({ error: "Tax data not found" }, { status: 404 });
    }

    return NextResponse.json({
      kerosene: taxData["등유"],
      butane: taxData["부탄"],
      naturalGas: taxData["천연가스"],
      propane: taxData["프로판"],
      heavyOil: taxData["중유"]
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
