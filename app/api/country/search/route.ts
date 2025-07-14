import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { name_kr } = await request.json();
    if (!name_kr) {
      return NextResponse.json({ error: '국가명을 입력하세요.' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('ESG');
    const collection = db.collection('Country_Code');
    // '한국이름' 필드 기준 부분 일치 검색 (대소문자 구분 없이)
    const results = await collection.find({ "한국이름": { $regex: name_kr, $options: 'i' } }).toArray();
    if (!results.length) {
      return NextResponse.json({ result: [] }, { status: 200 });
    }
    // 영문명: country name, UNLOCODE: code, 한글명: 한국이름
    const mapped = results.map(item => ({
      name_en: item["country name"],
      unlocode: item.code,
      name_kr: item["한국이름"]
    }));
    return NextResponse.json({ result: mapped }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 