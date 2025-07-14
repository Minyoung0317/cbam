import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import clientPromise from '@/lib/mongodb'

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const companyInfo = await request.json()

    // 필수 필드 검증
    const requiredFields = [
      'businessName',
      'businessNameEng',
      'address',
      'industry',
      'postalCode',
      'city',
      'country',
      'unlocode',
      'latitude',
      'longitude',
      'representativeName',
      'phoneNumber'
    ]

    for (const field of requiredFields) {
      if (!companyInfo[field]) {
        return NextResponse.json(
          { error: `${field} 필드는 필수입니다.` },
          { status: 400 }
        )
      }
    }

    const client = await clientPromise
    const db = client.db('ESG')
    const collection = db.collection('users')

    // 사용자 존재 여부 확인
    const user = await collection.findOne({ id: userId.value })
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 회사 정보 업데이트
    const result = await collection.updateOne(
      { id: userId.value },
      {
        $set: {
          businessName: companyInfo.businessName,
          businessNameEng: companyInfo.businessNameEng,
          address: companyInfo.address,
          industry: companyInfo.industry,
          postalCode: companyInfo.postalCode,
          postBox: companyInfo.postBox,
          city: companyInfo.city,
          country: companyInfo.country,
          unlocode: companyInfo.unlocode,
          latitude: companyInfo.latitude,
          longitude: companyInfo.longitude,
          representativeName: companyInfo.representativeName,
          phoneNumber: companyInfo.phoneNumber,
          updatedAt: new Date()
        }
      }
    )

    if (!result.acknowledged) {
      throw new Error('회사 정보 업데이트에 실패했습니다.')
    }

    // 업데이트된 사용자 정보 조회
    const updatedUser = await collection.findOne(
      { id: userId.value },
      { projection: { password: 0 } }
    )

    return NextResponse.json({
      message: '회사 정보가 성공적으로 업데이트되었습니다.',
      user: updatedUser
    })
  } catch (error) {
    console.error('회사 정보 업데이트 중 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 