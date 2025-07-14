import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ESG');
    const collection = db.collection('users');

    const user = await collection.findOne({ id: userId });
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 제외하고 반환
    const { password: _, ...userInfo } = user;

    // 누락 필드 보완: 값이 없으면 빈 문자열로 반환
    const safeUserInfo = {
      ...userInfo,
      managerName: userInfo.managerName || '',
      managerContact: userInfo.managerContact || '',
      managerEmail: userInfo.managerEmail || '',
      economicActivity: userInfo.economicActivity || '',
    };

    return NextResponse.json(safeUserInfo);
  } catch (error) {
    console.error('사용자 정보 조회 에러:', error);
    return NextResponse.json(
      { error: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 