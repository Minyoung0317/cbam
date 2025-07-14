"use client"

import { useRef, useState,useEffect } from "react";
import Image from "next/image";
import ChatbotWidget from "@/components/ChatbotWidget";
import Link from "next/link";

const tabs = [
  { key: "concept", label: "CBAM 개념" },
  { key: "purpose", label: "배출량 산정 목적 및 절차" },
  { key: "method", label: "배출량 산정 방법" },
  { key: "issue", label: "꼭 알아야 할 CBAM 이슈" },
];

export default function CbamPage() {
  const [activeTab, setActiveTab] = useState(0);
  const sectionRefs = [
    useRef<HTMLElement | null>(null),
    useRef<HTMLElement | null>(null),
    useRef<HTMLElement | null>(null),
    useRef<HTMLElement | null>(null),
  ];

  const [chatbotOpen, setChatbotOpen] = useState(false); // 챗봇 열기/닫기 상태
  const [hovered, setHovered] = useState(false);
  // 챗봇 열기 핸들러
  const handleOpenChatbot = () => setChatbotOpen(true);
  // 챗봇 닫기 핸들러 (챗봇 내 X 버튼에서 실행)
  const handleCloseChatbot = () => setChatbotOpen(false);
  
  useEffect(() => {
  if (chatbotOpen) {
    setHovered(false); // 챗봇 열릴 때 호버 해제
  }
}, [chatbotOpen]);

  const handleTabClick = (idx: number) => {
    setActiveTab(idx);
    sectionRefs[idx].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      {/* 헤더 */}
      <header className="flex justify-between items-center bg-white border-b border-gray-200 px-6 py-2">
        <nav className="flex space-x-2 text-sm">
          <span className="font-bold">CBAM 소개</span>
          <span>|</span>
          <Link href="/guide" className="hover:text-blue-600">이용 안내</Link>
          <span>|</span>
          <Link href="/cbam-calculator" className="hover:text-blue-600">CBAM 계산기</Link>
          <span>|</span>
          <Link href="/mypage" className="hover:text-blue-600">My page</Link>
        </nav>
        <div className="space-x-2">
          <Link href="/" className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Main</Link>
          <Link href="/login" className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Logout</Link>
        </div>
      </header>

      {/* 메인 타이틀 */}
      <div className="bg-[#00235B] text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">CBAM 소개</h1>
        </div>
      </div>

      {/* 탭 UI */}
      <div className="bg-[#00235B]">
        <div className="container mx-auto px-0">
          <div className="flex border-b border-[#00235B]">
            {tabs.map((tab, idx) => (
              <button
                key={tab.key}
                className={`flex-1 px-4 py-3 text-base font-bold border-r border-gray-200 focus:outline-none flex items-center justify-center gap-2 ${
                  activeTab === idx
                    ? "bg-blue-700 text-white"
                    : "bg-white text-[#00235B] hover:bg-blue-50"
                }`}
                onClick={() => handleTabClick(idx)}
               
              >
                {tab.label}
                <span className="ml-1 text-xs">▼</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 섹션별 컨텐츠 */}
      <div className="container mx-auto px-4 py-8 space-y-16">
        {/* 1. CBAM 개념 */}
        <section ref={sectionRefs[0]} className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">CBAM이란?</h2>
          <h3 className="text-xl font-bold mb-2">EU CBAM 도입 배경 및 목적</h3>
          <p className="mb-4 text-base">
            CBAM은 탄소국경제도(CBAM, Carbon Border Adjustment Mechanism)를 말하는 것으로, 탄소배출량 감축규제가 강한 국가에서 상대적으로 규제가 약한 국가로 탄소배출이 이전되는 탄소누출 문제 해결을 위하여 제안된 제도입니다. EU 집행위가 2021년 7월 Fit for 55 패키지의 일환으로 EU가 역내 환경규제를 강화할수록 규제가 낮은 지역으로 생산공장을 이전하거나, 저탄소 제품 생산을 위한 투자로 생산 원가가 상승하여 역외국 대비 자국의 제조업이 불공정한 상황에 노출된다는 문제의식에서 출발한 제도입니다.
          </p>
          <h3 className="text-xl font-bold mb-2">EU CBAM 운영 방법</h3>
          <p className="mb-4 text-base">
            CBAM은 연 1회 수출기업이 제품 생산 과정에서 발생한 탄소 배출량을 산정하여 그 결과를 EU 수입업자에게 제공하고, 수입업자는 배출량을 포함한 CBAM 보고서와 함께 CBAM 인증서를 구매 및 제출합니다. 만약, 제품 생산 과정에서 이미 탄소 가격을 지불했다면, 기지불한 탄소 가격만큼 인증서 구매 비용에서 차감합니다.
          </p>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1 bg-[#00235B] text-white rounded-lg p-4">
              <h4 className="font-bold mb-2">EU CBAM</h4>
              <p className="text-sm">EU 내로 수입되는 역외 생산 제품에 대하여 EU 내에서 생산될 때 지불하는 탄소 비용과 동등하도록 추가적인 탄소 가격을 부과 및 징수하는 제도입니다</p>
            </div>
            <div className="flex-1 bg-[#00235B] text-white rounded-lg p-4">
              <h4 className="font-bold mb-2">CBAM Goals</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>2030년까지 유럽연합의 온실가스 배출량을 최소 55% 감축, 탄소 가격이 낮거나 없는 국가로의 산업 이전 방지</li>
                <li>EU와 제3국 생산자 간의 공평한 경쟁을 통한 EU 생산자와 수입업자 간의 평등 도모</li>
              </ul>
            </div>
            <div className="flex-1 bg-[#00235B] text-white rounded-lg p-4">
              <h4 className="font-bold mb-2">탄소 누출</h4>
              <p className="text-sm">한 국가에서의 기후 정책으로 인한 비용 상승 때문에 기업들이 온실가스 관련 규제 또는 조치가 약한 국가로 생산 시설을 이전하거나, 온실가스 배출량 원단위가 높은 수입 제품이 증가하여 궁극적으로 지구 온실가스량이 증가하는 현상을 말합니다</p>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">CBAM 적용 메커니즘</h3>
          <img src="/cbam1.png" alt="CBAM 적용 메커니즘" className="w-full max-w-3xl mx-auto mb-4" />
          <p className="mb-4 text-base">
            CBAM은 형식적으로는 EU 수입자가 인증서를 구매 및 제출하는 구조지만, 실제 배출량 데이터를 제공해야 하는 주체는 수출국의 제조기업이라고 할 수 있습니다. 따라서 수입업자가 요구하는 제품당 온실가스 배출량 등과 같은 데이터를 적시에 제공하지 못할 경우 수입자에게 페널티가 발생하고, 그 피해는 결국 수출기업에게 전가되는 형태로 진행되고 있기 때문에 유의가 필요합니다.
          </p>
          <h3 className="text-xl font-bold mb-2">CBAM 적용 대상</h3>
          <p className="mb-4 text-base">
            CBAM은 탄소 누출이 큰 철강, 시멘트, 비료, 알루미늄, 전력, 수소 부문에 대하여 우선 적용됩니다. 현재는 6대 부문에 대해서만 CBAM을 우선 적용하지만, 석유화학, 정제산업 등으로 확대될 가능성이 있으므로, CBAM과 관련하여 EU 동향을 주의 깊게 관찰할 필요가 있습니다.
          </p>
          <img src="/cbam2.png" alt="CBAM 적용 대상" className="w-full max-w-3xl mx-auto mb-4" />
          <p className="mb-4 text-base">
            우리 기업의 수출 제품 중 실제 EU CBAM 적용 여부를 파악하기 위해서는, 먼저 EU로 수출하는 상품의 CN코드가 CBAM 대상 제품 목록에 있는지 확인하여야 합니다. CN코드란 화물을 수출입할 때 사용하는 품목 분류 번호로, 세계 공통으로 사용되는 HS코드(6자리)에 EU의 독자적인 하위 분류를 더한 8자리 번호로, 수출신고필증 내 35. 세번부호(=HS코드)를 확인하여 품목의 CBAM 대상 여부를 판단할 수 있습니다.
          </p>
          <img src="/cbam3.png" alt="CBAM CN코드" className="w-full max-w-3xl mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">CBAM 주요 일정과 주요 이슈</h3>
          <p className="mb-4 text-base">
            EU 집행위원회에서는 CBAM 본격 시행 전, 여러 이해관계자가 CBAM 제도에 적응할 수 있도록 2년 3개월간의 전환기간을 우선 도입하였습니다. 전환기간 동안은 이행규정을 비교적 간단히 실시하도록 하고 있으나, 우리 기업들은 제품당 온실가스 배출량을 산정하는 과정이 매우 복잡하고 당장 2026년부터 확정기간이 시작되면서 보고 의무를 준수하지 못하거나 부정확한 자료를 제출할 경우 과징금이 전가될 수 있다는 점을 고려하여, 사전적으로 CBAM에 대해 이해하고 제품당 탄소배출량 산정 및 관리 시스템을 도입할 필요가 있습니다.
          </p>
          <img src="/cbam4.png" alt="CBAM 주요 일정과 이슈" className="w-full max-w-3xl mx-auto mb-4" />
        </section>

        {/* 2. 배출량 산정 목적 및 절차 */}
        <section ref={sectionRefs[1]} className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">CBAM 배출량의 필요성</h2>
          <p className="mb-4 text-base">
            CBAM 확정기간부터는 EU 수입업자에게 인증서 제출 의무가 부여됩니다. 이때, 인증서 수량은 수입품의 배출량과 EU-ETS(유럽연합 배출권거래제)의 무상할당량을 비교한 차이값에 총 제품 수입량을 곱하여 결정됩니다. 따라서, 수입업자는 EU CBAM 이행을 위한 인증서 수량 결정 시, 수출업자에게 제품당 배출량 산정과 관련된 데이터를 요구하게 되고, 우리 기업들은 이에 대응하여야만 합니다.
          </p>
          <img src="/cbam5.png" alt="CBAM 배출량의 필요성" className="w-full max-w-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">CBAM 배출량의 개념</h2>
          <p className="mb-4 text-base">
            CBAM 제도하에서 산정하는 배출량은 <b>제품당 배출량</b>으로, '제품 생산량 1 ton당 발생하는 온실가스 배출량의 원단위' 개념입니다. 여기에는 제품 생산에 필요한 원료뿐만 아니라 생산공정의 에너지원으로 사용되는 연료 및 전기, 공정 후단의 대기오염방지시설까지도 배출량 산정 대상에 포함됩니다.
          </p>
          <img src="/cbam6.png" alt="CBAM 배출량의 개념" className="w-full max-w-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">CBAM 배출량 산정 절차</h2>
          <p className="mb-4 text-base">
            CBAM 제품당 배출량 산정은 CBAM 대상 제품의 수출 여부 확인부터 출발하여, 제품 확인을 완료했다면 제품당 배출량 산정을 위한 경계를 설정하는 것입니다. 이후 산정 경계 내 온실가스 배출원을 확인하고, 제품 생산공정별 데이터 할당, 배출량 산정 방법론 선택, 제품당 배출량 산정 순으로 진행합니다.
          </p>
          <img src="/cbam7.jpg" alt="CBAM 배출량 산정 절차" className="w-full max-w-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">CBAM 제품당 배출량 보고기간</h2>
          <p className="mb-4 text-base">
            CBAM 배출량 보고기간(=산정기간)은 사업장의 운영 특성 및 계절의 변동성을 반영할 수 있도록 12개월로 설정해야 합니다. 이때 기본적으로 역년(1/1~12/31)을 사용하지만, 기업에서 자체적인 회계연도를 특정 원로 고정하여 관리 중이거나, 더 높은 품질의 데이터를 얻을 수 있는 경우라면 회계연도를 보고기간으로 설정할 수 있습니다. (국내 온실가스 목표관리제 및 배출권거래제 모두 보고기간은 1/1~12/31을 기준으로 하고 있습니다)
          </p>
          <img src="/cbam9.png" alt="CBAM 제품당 배출량 보고기간" className="w-full max-w-3xl mx-auto mb-4" />
        </section>

        {/* 3. 배출량 산정 방법 */}
        <section ref={sectionRefs[2]} className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">CBAM 배출량 산정을 위한 기초 개념</h2>
          <p className="mb-4 text-base">
            CBAM 배출량을 산정하기에 앞서, 사업장/ 시설군/ 제품 생산공정/ 제품 생산경로/ 배출원/ 소스 스트림에 대한 이해가 필요합니다. 사업장은 시설군을 포함하고, 시설군은 제품 생산공정을, 제품 생산공정은 제품 생산경로를, 생산경로는 배출원을, 배출원은 소스 스트림을 포함합니다.
          </p>
          <img src="/cbam10.png" alt="CBAM 배출량 산정 기초 개념" className="w-full max-w-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">CBAM 배출량 산정/보고 대상과 범위</h2>
          <p className="mb-4 text-base">
            제품당 배출량 산정을 위해서는 산정 경계 설정 후, 경계 내 CO2, N2O, PFCs 온실가스를 발생시키는 소스 스트림을 확인하여야 합니다. (철강부문은 CO2만 고려) 제품당 배출량은 생산공정에서 연료, 원료 등 사용에 따라 제품에 내재된 배출량과 생산공정에 투입되는 전구물질에 내재된 배출량을 고려하여야 합니다. 생산공정 및 전구물질의 내재배출량은 직접배출과 간접배출로 구분할 수 있습니다. 직접배출은 연료 및 원료 사용, 열 및 폐가스의 유입/유출에 따른 온실가스 배출을 포함하며, 간접배출은 전력사용에 따른 온실가스 배출을 포함합니다.
          </p>
          <img src="/cbam11.png" alt="CBAM 배출량 산정/보고 대상과 범위" className="w-full max-w-3xl mx-auto mb-2" />
          <div className="text-xs text-gray-700 mb-4">
            ✓ 직접배출: 기업이 소유 및 관리하고 있는 설비 등에서 발생하는 온실가스 배출을 의미<br />
            ✓ 간접배출: 전력사용에 따른 배출량을 의미(소비하기 위한 전기를 생산하는 과정에서 온실가스가 배출되므로, 소비활동에 의하여 간접적으로 온실가스가 발생한다는 의미)<br />
            ✓ 전구물질: 석탄 등 자연물질에서 가공을 거쳐 생산된 물질(소결광 등)을 의미. 단, 가공을 거친 원료가 무조건 전구물질이 되는 것은 아니며, CBAM에서 규정한 물질만 전구물질에 해당됨
          </div>
          <h2 className="text-2xl font-bold mb-4">제품당 배출량의 기초 개념</h2>
          <p className="mb-4 text-base">
            기본적으로 CBAM 제품당 배출량은 <b>제품 단위 생산량(ton) 당 제품 생산 과정에서 발생하는 배출량(tCO2e)</b>를 말합니다. 따라서, 앞서 제시한 것처럼 단순제품 또는 복합제품 여부에 따라 배출량을 산정하고, 이에 제품 생산량을 나누어 계산하게 됩니다.
          </p>
          <img src="/cbam12.png" alt="제품당 배출량의 기초 개념" className="w-full max-w-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">제품당 배출량의 산정 방법</h2>
          <p className="mb-4 text-base">
            제품당 배출량 산정 방법은 크게 계산 또는 측정 기반 방법으로 구분되고, 계산 기반 방법은 표준 방법과 물질수지법으로 구분됩니다. 우리 시스템의 경우, CBAM 대응이 어려운 중소/중견기업들이 별도의 측정설비가 준비되지 않더라도 빠르고 편리하게 데이터를 관리할 수 있도록 하기 위해 표준 방법을 기준으로 설계되었습니다.
          </p>
          <img src="/cbam13.png" alt="제품당 배출량의 산정 방법" className="w-full max-w-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">표준 방법을 사용한 직접배출량 산정 방법</h2>
          <p className="mb-4 text-base">
            표준 방법은 [활동자료* 배출계수]로 산정하며, 연료/연소배출활동의 활동자료는 [연료사용량], 공정배출활동의 활동자료는 [원료사용량]이 고려됩니다. 연소활동에 대한 직접배출량은 연료소비량(ton 또는㎥) 또는 투입열량(TJ)을 기반으로 산정할 수 있습니다. 기업에 따라 연소활동자료가 다르게 관리되고 있을 수 있어, 우리 시스템의 경우 연료명을 입력하면 자동으로 단위를 환산할 수 있도록 하여 연료투입량만 입력하면 자동으로 계산이 진행되도록 설계하였습니다.
          </p>
          <img src="/cbam14.png" alt="표준 방법을 사용한 직접배출량 산정 방법" className="w-full max-w-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">표준 방법 중 공정배출 산정 방법</h2>
          <p className="mb-4 text-base">
            표준 방법 중 공정 배출 산정 방법의 경우, 공정에 투입되는 물질의 탄산염 여부에 따라 배출량 산정 방법이 달라집니다. 탄산염을 제외한 모든 공정배출은 방법 A(투입기준)을 기준으로 산정하여야 하며, 탄산염분해공정의 경우 방법 A(투입기준)과 방법 B(산출기준) 중 배출량 정확성이 높은 방법을 선택하여 적용하여야 합니다. 우리 시스템의 경우 원료명을 입력하면 자동으로 단위를 환산할 수 있도록 하여 원료투입량만 입력하면 자동으로 계산이 진행되도록 설계하였습니다.
          </p>
          <img src="/cbam15.png" alt="표준 방법 중 공정배출 산정 방법" className="w-full max-w-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">물질수지법을 사용한 직접배출량 산정 방법</h2>
          <p className="mb-4 text-base">
            물질수지법은 일관제철소와 같이 투입물질별로 배출량을 산정하기 어려운 복잡한 공정의 직접배출량을 구하기 위한 방법으로, 연료와 공정투입물을 구분하지 않습니다. 물질수지법은 생산공정에 유입된 모든 탄소는 1, 2차 제품 또는 공정 중 CO2로 전환되어 대기로 배출된다는 가정에 기초합니다. 따라서 생산공정에 유입되는 물질에 포함된 탄소함량과 제품 또는 부산물로 생산공정에서 산출되는 물질에 포함된 탄소함량의 차이만큼을 생산공정의 CO2 배출량으로 산정합니다.
          </p>
          <img src="/cbam16.png" alt="물질수지법을 사용한 직접배출량 산정 방법" className="w-full max-w-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">측정 기반 산정 방법</h2>
          <p className="mb-4 text-base">
            측정기반방법은 적절한 측정지점에서 연속 배출 측정 시스템(CEMS, 국내의 경우 TMS)을 사용하여 온실가스 온도와 연도가스(배기가스) 유량을 측정하고 이를 활용하여 온실가스 배출량을 결정하는 방법입니다. 아산화질소(N2O) 배출량 모니터링의 경우 측정기반방법론의 사용이 필수이지만, 이산화탄소(CO2)의 경우 계산기반방법보다 더 정확한 데이터를 얻을 수 있는 경우에만 측정방법을 사용할 수 있습니다. * 국내 온실가스 목표관리제 및 배출권거래제에서는 측정기반산정방법을 통한 배출량을 산정하고 있지 않으며, 모두 계산기반산정방법을 적용하고 있습니다.
          </p>
          <img src="/cbam17.png" alt="측정 기반 산정 방법" className="w-full max-w-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">활동자료의 모니터링 방법</h2>
          <p className="mb-4 text-base">
            활동자료의 모니터링은 계측기를 통하여 직접 측정하거나, 재고량 기반으로 추정할 수 있습니다. 활동자료 모니터링 시 이중산정 방지를 위하여 동일한 생산공정에 재사용되는 제품은 고려하지 않습니다. 따라서, 우리 시스템에서도 이를 고려하여 생산공정에 연속적으로 반영되는 경우에는 연산에서 제외되도록 설정하고 있습니다.
          </p>
          <img src="/cbam18.png" alt="활동자료의 모니터링 방법" className="w-full max-w-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">활동자료의 모니터링 예외사항</h2>
          <img src="/cbam19.png" alt="활동자료의 모니터링 예외사항" className="w-full max-w-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">간접배출량 산정 방법</h2>
          <p className="mb-4 text-base">
            EU CBAM 간접배출량은 전력사용량에 배출계수를 곱하여 산정합니다. 만약, 우리 생산공정에서 전력을 생산하여 직접 사용하고 있다고 하더라도, 연료/연소에 따른 직접배출량이 아닌 간접배출량으로 산정 및 보고해야합니다. 우리 시스템에서는 전력배출계수를 국내 전력 CO2 배출계수(2014~2016년 평균)인 0.4567 tCO2/MWh을 사용하고 있으며, 만약 발전소에서 생산한 전기가 생산공정과 직접적으로 연결되어 있거나 전력구매계약(PPA) 체결을 통하여 특정 전력배출계수를 가지는 전력을 사용할 경우에는 전력배출계수를 직접 개발하여 적용하여야 합니다.
          </p>
          <img src="/cbam20.png" alt="간접배출량 산정 방법" className="w-full max-w-3xl mx-auto mb-4" />
        </section>

        {/* 4. 꼭 알아야 할 CBAM 이슈 */}
        <section ref={sectionRefs[3]} className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">CBAM 배출량 산정 시 유의사항</h2>
          <p className="mb-4 text-base">
            우리 기업들은 CBAM 배출량 산정 시 EU 수입업자의 정보 요청에 적극적으로 대응하여야 하며, 배출량 산정 대상 및 범위를 완전하고 정확하게 고려하여야 합니다. 또한 배출량 산정 시 기본값을 활용하거나 국내 배출량 산정방법론을 활용하는 경우, 24년 12월 31일 이후 폐지된 내용이므로 표준방법을 활용하여 산정할 수 있도록 하여야 합니다(우리 시스템의 경우 표준방법을 활용하여 온실가스 배출량을 산정하고 있습니다). 우리 기업들은 이행 시점에 적절한 가장 최신의 CBAM 기준으로 제도를 이행할 수 있도록 유의하며 CBAM에 대응하여야 합니다.
          </p>
          <img src="/cbam21.png" alt="CBAM 배출량 산정 시 유의사항" className="w-full max-w-3xl mx-auto mb-4" />
        </section>
    </div>

   <div
  className={`
    fixed bottom-8 right-8 z-50 transition-all duration-300 ease-in-out 
    bg-transparent
  `}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
>
  <button
    onClick={handleOpenChatbot}
    className={`
      flex items-center justify-between
      bg-[#00235B] rounded-full shadow-lg overflow-hidden
      transition-all duration-300 text-white
      h-[65px]
      ${hovered ? 'w-[220px]' : 'w-[65px]'}
    `}
    style={{ transitionProperty: 'width, background-color' }}
    aria-label="챗봇 열기"
  >
    {/* ✅ 텍스트는 호버 시에만 보이도록 */}
    {hovered && (
      <span className="text-sm font-bold text-white whitespace-nowrap ml-6">
        궁금한 게 있나요?
      </span>
    )}
    
    {/* ✅ 로고 영역은 항상 고정된 원형 */}
    <div className="w-[65px] h-[65px] rounded-full flex items-center justify-center bg-[#00235B]">
      <Image
        src="/cbot_logo.png"
        alt="챗봇 열기"
        width={65}
        height={65}
        style={{ objectFit: "contain" }}
        priority
      />
    </div>
  </button>

  {/* ✅ 챗봇 위젯 */}
  {chatbotOpen && (
    <ChatbotWidget onClose={handleCloseChatbot} />
  )}
</div>
    </div>
  );
} 
