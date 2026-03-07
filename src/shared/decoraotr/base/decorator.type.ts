import { IsNumberOptions, ValidationOptions } from 'class-validator';

export interface BaseDecoratorOptions extends ValidationOptions {
  // Swagger 옵션
  description?: string;
  example?: string | number;
  deprecated?: boolean; // 속성이 deprecated되었는지 여부

  // 일반 옵션
  optional?: boolean; // 속성이 선택적인지 여부
  nullable?: boolean; // 속성이 null일 수 있는지 여부

  // 변환 옵션
  transform?: boolean | ((value: unknown) => any); // 속성을 변환해야 하는지 여부

  // 커스텀 옵션
  errorKey?: string; // 유효성 검사 메시지를 위한 커스텀 에러 키
}

export interface StringDecoratorOptions extends BaseDecoratorOptions {
  minLength?: number; // 문자열의 최소 길이
  maxLength?: number; // 문자열의 최대 길이
  pattern?: RegExp; // 문자열이 일치해야 하는 정규식 패턴
  trim?: boolean; // 문자열의 양 끝 공백을 제거할지 여부
  lowercase?: boolean; // 문자열을 소문자로 변환할지 여부
  uppercase?: boolean; // 문자열을 대문자로 변환할지 여부
}

export interface NumberDecoratorOptions
  extends BaseDecoratorOptions, IsNumberOptions {
  min?: number; // 숫자의 최솟값
  max?: number; // 숫자의 최댓값
  integer?: boolean; // 숫자가 정수여야 하는지 여부
  positive?: boolean; // 숫자가 양수여야 하는지 여부
  negative?: boolean; // 숫자가 음수여야 하는지 여부
}

export interface BooleanDecoratorOptions extends BaseDecoratorOptions {
  strict?: boolean; // 엄격한 불리언 검사 여부
}

export interface ArrayDecoratorOptions<T> extends BaseDecoratorOptions {
  type: () => new (...args: unknown[]) => T; // 배열 요소의 타입
  minSize?: number; // 배열의 최소 요소 수
  maxSize?: number; // 배열의 최대 요소 수
  unique?: boolean; // 배열이 고유한 요소만 포함해야 하는지 여부
  itemTransform?: (items: unknown) => T; // 각 배열 항목을 변환하는 함수
  validationOptions?: Record<string, any>; // 추가적인 유효성 검사 옵션
}

export interface NestedDecoratorOptions<T> extends BaseDecoratorOptions {
  type: () => new (...args: unknown[]) => T; // 중첩된 객체의 타입
  validationOptions?: Record<string, any>; // 중첩된 객체를 위한 추가적인 유효성 검사 옵션
}
