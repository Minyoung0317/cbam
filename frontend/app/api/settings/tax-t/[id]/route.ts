import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("ESG");
    
    const id = new ObjectId(params.id);
    const taxData = await db.collection("Tax_T").findOne({ _id: id });
    
    if (!taxData) {
      return NextResponse.json({ error: "Tax_T data not found" }, { status: 404 });
    }

    return NextResponse.json({
      gasoline: taxData["휘발유"],
      diesel: taxData["경유"]
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
