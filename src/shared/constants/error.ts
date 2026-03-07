export const ERROR_MESSAGE: Record<
  string,
  { message: string; description: string }
> = {
  // 기본 유효성
  'string.invalid': {
    message: '문자열이여야 합니다',
    description: '문자열(string) 값',
  },
  'number.invalid': {
    message: '숫자여야 합니다',
    description: '숫자(number) 값',
  },
  'boolean.invalid': {
    message: '불리언이어야 합니다',
    description: '참/거짓(boolean) 값',
  },
  'array.invalid': {
    message: '배열이어야 합니다',
    description: '배열(array) 값',
  },
  'enum.invalid': {
    message: '허용된 값 중 하나여야 합니다',
    description: '열거형 값',
  },
  timestamp: {
    message: '유효한 타임스탬프가 아닙니다',
    description: '유닉스 타임스탬프 (밀리초)',
  },

  // 특정 형식
  'email.invalid': {
    message: '유효한 이메일 주소가 아닙니다',
    description: '이메일 주소',
  },
  'datetime.invalid': {
    message: '날짜와 시간은 ISO 8601 형식이어야 합니다',
    description: '날짜와 시간 (YYYY-MM-DDTHH:mm:ssZ)',
  },
  'date.invalid': {
    message: '날짜는 YYYY-MM-DD 형식이어야 합니다',
    description: '날짜 (YYYY-MM-DD)',
  },
  'time.invalid': {
    message: '시간은 HH:mm:ss 형식이어야 합니다',
    description: '시간 (HH:mm:ss)',
  },
  'id.invalid': {
    message: '유효한 ID 형식이 아닙니다',
    description: 'UUID 형식의 고유 식별자',
  },

  // 페이지네이션
  'pagination.page': {
    message: '페이지 번호는 1 이상이어야 합니다',
    description: '페이지 번호',
  },
  'pagination.limit': {
    message: '페이지당 항목 수는 1 이상이어야 합니다',
    description: '페이지당 항목 수',
  },
};
