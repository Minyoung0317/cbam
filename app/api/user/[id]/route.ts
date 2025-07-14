import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('users');

    const user = await collection.findOne({ id: params.id });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 제외하고 사용자 정보 반환
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('사용자 데이터 조회 에러:', error);
    return NextResponse.json(
      { error: '사용자 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 