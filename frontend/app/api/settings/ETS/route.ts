import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; // 환경 변수는 이미 처리되어 있다고 가정

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB); // 환경변수에 DB 이름이 있다면
    const collection = db.collection('ETS');

    const today = new Date();

    const docs = await collection
      .find({}, { projection: { date: 1, 'auction_price_€/tco2': 1 } })
      .toArray();

    if (docs.length === 0) {
      return NextResponse.json({ error: 'No ETS data found' }, { status: 404 });
    }

    const closest = docs.reduce((prev, curr) => {
      const prevDate = new Date(prev.date);
      const currDate = new Date(curr.date);
      return Math.abs(currDate.getTime() - today.getTime()) < Math.abs(prevDate.getTime() - today.getTime())
        ? curr
        : prev;
    });

    return NextResponse.json({
      price: closest['auction_price_€/tco2'],
      date: closest.date,
    });
  } catch (error) {
    console.error('[ETS PRICE API ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
