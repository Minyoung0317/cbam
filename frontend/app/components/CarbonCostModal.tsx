import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface CarbonCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  productEmission: number;
  totalEmission: number;
  electricityUsage: number;
  fuelsData: Array<{ name: string; amount: number }>;
  totalExportAmount: number;
  onFinalPrepaidCarbonChange: (value: number) => void;
}

const CarbonCostModal: React.FC<CarbonCostModalProps> = ({
  isOpen,
  onClose,
  productEmission,
  totalEmission,
  electricityUsage,
  fuelsData,
  totalExportAmount,
  onFinalPrepaidCarbonChange,
}) => {
  const [ketsPrice, setKetsPrice] = useState<number>(0);
  const [climateCharge, setClimateCharge] = useState<number>(0);
  const [transportTax, setTransportTax] = useState<number>(0);
  const [individualTax, setIndividualTax] = useState<number>(0);
  const [carbonPrice, setCarbonPrice] = useState<number>(0);
  const [prepaidCarbonPrice, setPrepaidCarbonPrice] = useState<number>(0);
  const [finalPrepaidCarbonPrice, setFinalPrepaidCarbonPrice] = useState<number>(0);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [tooltipTitle, setTooltipTitle] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings/kets').then(res => res.json()).then(data => setKetsPrice(data.yearlyAverage));
  }, []);

  const calculateClimateCharge = async () => {
    const res = await fetch('/api/settings/tax-e');
    const data = await res.json();
    setClimateCharge(electricityUsage * data.total);
  };

  const calculateTransportTax = async () => {
    const now = new Date();
    const id = now <= new Date('2025-06-30') ? "682d95c426e21740f1ce846c" : "682d95c426e21740f1ce846d";
    const res = await fetch(`/api/settings/tax-t/${id}`);
    const data = await res.json();
    let tax = 0;
    fuelsData.forEach(f => {
      if (f.name === "Motor gasoline") tax += f.amount * data.gasoline;
      else if (f.name === "가스/디젤유") tax += f.amount * data.diesel;
    });
    setTransportTax(tax);
  };

  const calculateIndividualTax = async () => {
    const res = await fetch('/api/settings/tax');
    const data = await res.json();
    let tax = 0;
    fuelsData.forEach(f => {
      switch (f.name) {
        case "등유 (제트 등유 외)": tax += f.amount * data.kerosene; break;
        case "기타 석유제품": tax += f.amount * data.butane; break;
        case "액성 천연가스": tax += f.amount * data.naturalGas; break;
        case "천연가스": tax += f.amount * data.naturalGas; break;
        case "액화석유가스": tax += f.amount * data.propane; break;
        case "잔류 연료유": tax += f.amount * data.heavyOil; break;
      }
    });
    setIndividualTax(tax);
  };

  const calculateCarbonPrice = () => {
    setCarbonPrice((totalEmission * ketsPrice + climateCharge + transportTax + individualTax)/totalEmission);
  };

  useEffect(() => {
    setPrepaidCarbonPrice(productEmission * carbonPrice);
  }, [productEmission, carbonPrice]);

  const calculateFinalPrepaidCarbonPrice = () => {
    const final = prepaidCarbonPrice * totalExportAmount;
    setFinalPrepaidCarbonPrice(final);
    onFinalPrepaidCarbonChange(final);
  };

  const showTooltip = (title: string, content: string) => {
    setTooltipTitle(title);
    setTooltip(content);
  };

  const InfoButton = ({ title, content }: { title: string; content: string }) => (
    <button
      className="text-xs text-white bg-blue-600 w-5 h-5 rounded-full text-center ml-2"
      onClick={() => showTooltip(title, content)}>
      ?
    </button>
  );

  if (!isOpen) return null;

  // 그룹 카드 스타일
  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[#f8fafc] rounded-xl shadow p-4 space-y-3 border mb-2">{children}</div>
  );

  const Field = ({ label, value, unit, infoTitle, infoContent, button, isInput = false, onClick }: any) => (
    <div className="flex items-center gap-2">
      <div className="text-sm font-medium text-[#00235B]">{label}
        {infoTitle && infoContent && <InfoButton title={infoTitle} content={infoContent} />}
      </div>
      <div className="flex-1"></div>
      {isInput ? (
        <input
          type="number"
          value={value}
          onChange={e => onClick(parseFloat(e.target.value))}
          className="border rounded-sm px-2 py-1 text-sm text-right w-28"
        />
      ) : (
        <div className="border rounded-sm px-2 py-1 bg-gray-100 text-right text-sm min-w-[70px]">{value}</div>
      )}
      <span className="text-xs text-gray-500 ml-1">{unit}</span>
      {button}
    </div>
  );

 return (
  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
    <div className="bg-white rounded-md shadow-xl w-full max-w-2xl p-6 space-y-4">
      <div className="text-xl font-semibold text-white text-center bg-[#00235B] rounded-t p-3">
        기지불 탄소 가격 계산기
      </div>

      {tooltip && (
        <div className="border border-blue-300 bg-blue-50 p-3 rounded text-sm text-gray-800">
          <div className="font-semibold text-blue-800 mb-1">{tooltipTitle}</div>
          {tooltip}
          {tooltipTitle?.includes('교통/환경/에너지세') && (
            <div className="text-xs text-gray-500 mt-2">
              ※ 휘발유,경유에 대해 교통/환경/에너지세 산정 시 개별소비세 제외
            </div>
          )}
        </div>
      )}

      {/* 1. 제품당 배출량/비율 */}
      <Card>
        <Field
          label="제품당 배출량"
          value={productEmission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          unit="tCO2e / t제품"
        />
        <Field
          label="배출량 비율"
          value={Number(100).toLocaleString()}
          unit="%"
          infoTitle="배출량 비율이 100%인 이유"
          infoContent="탄소가격제 下 CBAM은 CO2 등 일부 온실가스를 보고하는 것과 달리, 우리나라 배출권거래제는 6대 온실가스를 모두 규제하고 있습니다. 따라서, 탄소가격제의 CBAM 배출량 비율은 우리나라 배출 범위보다 작기 때문에, 우리나라 기준으로 배출량 비율을 100%으로 산정할 수 있습니다."
        />
      </Card>

      {/* 2. 내재배출량/비율/세금/가격 */}
      <Card>
        <Field
          label="제품별 내재배출량"
          value={totalEmission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          unit="tCO2e"
        />
        <Field
          label="배출량 비율"
          value={Number(100).toLocaleString()}
          unit="%"
          infoTitle="배출량 비율이 100%인 이유"
          infoContent="탄소가격제 下 CBAM은 CO2 등 일부 온실가스를 보고하는 것과 달리, 우리나라 배출권거래제는 6대 온실가스를 모두 규제하고 있습니다. 따라서, 탄소가격제의 CBAM 배출량 비율은 우리나라 배출 범위보다 작기 때문에, 우리나라 기준으로 배출량 비율을 100%으로 산정할 수 있습니다."
        />
        <Field
          label="K-ETS 가격"
          value={ketsPrice.toLocaleString()}
          unit="원 / tCO2e"
          infoTitle="K-ETS 가격 산정 원리"
          infoContent="CBAM은 EU-ETS 금액과 제품 원산지 국가 배출권 거래제의 차액만큼을 추가적으로 지불하도록 하는 개념입니다. ..."
        />
        <Field
          label="전력 중 기후요금"
          value={climateCharge.toLocaleString()}
          unit="원"
          infoTitle="전력 중 기후 요금 산정 원리"
          infoContent="기후 요금이란 기후 변화 대응 및 환경 보호 목적의 전력 부과금을 말합니다. ..."
          button={
            <Button
              onClick={calculateClimateCharge}
              className="ml-2 px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white"
            >
              계산
            </Button>
          }
        />
        <Field
          label="교통/환경/에너지세"
          value={transportTax.toLocaleString()}
          unit="원"
          infoTitle="교통/환경/에너지세 산정 원리"
          infoContent="교통 인프라 구축, 에너지 수요 관리, 환경 보호 목적의 종합 목적세로 ..."
          button={
            <Button
              onClick={calculateTransportTax}
              className="ml-2 px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white"
            >
              계산
            </Button>
          }
        />
        <Field
          label="개별 소비세"
          value={individualTax.toLocaleString()}
          unit="원"
          infoTitle="개별 소비세 산정 원리"
          infoContent="개별 소비세란 일반 소비세와는 별도로 사치성 또는 특정 목적 물품에 부과되는 세금을 말합니다. ..."
          button={
            <Button
              onClick={calculateIndividualTax}
              className="ml-2 px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white"
            >
              계산
            </Button>
          }
        />
        <Field
          label="탄소 가격"
          value={carbonPrice.toLocaleString()}
          unit="원 / tCO2e"
          button={
            <Button
              onClick={calculateCarbonPrice}
              className="ml-2 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              계산
            </Button>
          }
        />
      </Card>

      {/* 3. 최종 가격 그룹 */}
      <Card>
        <Field
          label="기지불 탄소 가격"
          value={prepaidCarbonPrice.toLocaleString()}
          unit="원 / t제품"
        />
        <Field
          label="총 제품 수출량"
          value={totalExportAmount.toLocaleString()}
          unit="t 제품"
        />
        <Field
          label="최종 기지불 탄소 가격"
          value={finalPrepaidCarbonPrice.toLocaleString()}
          unit="원"
          button={
            <Button
              onClick={calculateFinalPrepaidCarbonPrice}
              className="ml-2 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              계산
            </Button>
          }
        />
      </Card>

      <div className="flex justify-center pt-6">
        <button
          onClick={onClose}
          className="bg-[#2d3748] hover:bg-[#1a202c] text-white px-6 py-2 rounded-md text-sm"
        >
          저장하고 나가기
        </button>
      </div>
    </div>
  </div>
);
}
export default CarbonCostModal;
