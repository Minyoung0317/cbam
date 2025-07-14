import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const etsCol = db.collection('ETS');

    // 최신 날짜의 데이터를 가져오기 위해 date 필드를 기준으로 정렬
    const etsData = await etsCol.find().sort({ date: -1 }).limit(1).toArray();
    await client.close();

    const cbamCertificatePrice = etsData.length > 0 ? etsData[0]['auction_price_€/tco2'] : 0;

    return NextResponse.json({ price: cbamCertificatePrice });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 