import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ESG");
    
    const ketsData = await db.collection("Kets").findOne({});
    
    if (!ketsData) {
      return NextResponse.json({ error: "K-ETS data not found" }, { status: 404 });
    }

    return NextResponse.json({ yearlyAverage: ketsData["k-ets연간 평균값"] });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
