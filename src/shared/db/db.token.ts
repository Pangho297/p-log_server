/** NextJS DI(의존성 주입)용 식별자(Token)
 * 
 * #### 왜 필요한가?
 * - 타입/클래스가 아닌 값(Symbol, string)으로도 provider를 안전하게 구분할 수 있음
 * - 하드코딩 문자열을 여기로 모아 오타/중복을 줄임
 * - 테스트에서 mock provider 교체가 쉬워짐 (`provider: DRIZZLE_DB, useValue: mockDb`)
 * - 구현체 교체 시 (다른 DB 클라이언트로 교체 등) 모듈 결합도를 낮출 수 있음
 */

export const DRIZZLE_DB = Symbol('DRIZZLE_DB');
export const PG_POOL = Symbol('PG_POOL');
