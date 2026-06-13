// 온보딩 1단계 — 이메일 가입
// 데모: 비밀번호 없이 이메일만 수집 (앱은 실제 인증 없음)

import { useState } from "react";
import StepLayout from "./StepLayout";

type Props = {
  step: number;
  total: number;
  initial: string;
  onBack: () => void;
  onNext: (email: string) => void;
};

const EMAIL_REGEX = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;

export default function EmailScreen({
  step,
  total,
  initial,
  onBack,
  onNext,
}: Props) {
  const [email, setEmail] = useState(initial);
  const valid = EMAIL_REGEX.test(email);

  return (
    <StepLayout
      step={step}
      total={total}
      onBack={onBack}
      ctaDisabled={!valid}
      onCta={() => onNext(email)}
    >
      <h1 className="text-ink text-[22px] font-extrabold leading-snug">
        이메일로 가입할게요
      </h1>
      <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
        나의 여정과 미션 기록이 이 계정에 저장돼요.
      </p>

      <div className="mt-8">
        <label className="text-ink-soft text-[12px] font-bold" htmlFor="email">
          이메일
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="mt-2 w-full px-4 py-3.5 rounded-2xl border border-cream-200
                     bg-white text-ink text-[15px] focus:outline-none
                     focus:border-primary placeholder:text-ink-mute"
        />
        {/* 받는 용도 한 줄 — 거부감 줄이는 reason copy */}
        <p className="mt-2 text-[12px] text-primary font-bold">
          📮 내일 미션이랑 마당 소식 보내드릴게요
        </p>
        <p className="mt-1 text-[11px] text-ink-mute">
          데모 환경에서는 인증 메일을 발송하지 않아요.
        </p>
      </div>
    </StepLayout>
  );
}
