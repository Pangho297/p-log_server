# Markdown 에디터 이미지 업로드 정책 변경 방향

이 문서는 프론트엔드 게시글 작성 UX를 유지하면서 이미지 업로드 정책과 백엔드 구조를 변경하기 위한 방향을 정리합니다.

## 목표

- 게시글은 작성 완료 후 submit 시점에만 생성 또는 수정한다.
- draft 게시글은 도입하지 않는다.
- Markdown 에디터에서는 게시글 생성 전에도 이미지를 자유롭게 삽입할 수 있어야 한다.
- 프론트엔드는 submit 시 최종 `content`만 서버에 보내고, 이미지 연결과 삭제 판단은 서버가 처리한다.
- 이미지 업로드 URL 발급 API의 `postId`는 수정 화면 등 기존 흐름 호환을 위해 선택값으로 유지한다.
- Cloudflare delivery variant는 초기 정책으로 `public`만 허용한다.
- submit되지 않은 `temp` 이미지는 24시간 TTL 이후 삭제 대상으로 본다.
- 업로드 완료 추적은 초기 구현에서는 생략한다.
- 게시글 삭제 시 연결된 이미지는 `delete_pending`으로 전환한다.

## 현재 구조의 문제

현재 이미지 업로드 URL 발급 API는 `postId`를 요구합니다.

```json
{
  "postId": "게시글 id"
}
```

하지만 게시글 작성 화면의 목표 UX는 다음 흐름입니다.

```text
작성 화면 진입
  -> Markdown 본문 작성
  -> 이미지 삽입
  -> 이미지 URL이 본문에 들어감
  -> submit
  -> 게시글 생성 또는 수정
```

게시글 생성 전에는 `postId`가 없기 때문에, 이미지 업로드 URL 발급 단계에서 `postId`를 필수로 요구하면 현재 UX를 구현할 수 없습니다.

코드 기준으로도 다음 지점들이 `postId` 선확정 구조에 묶여 있습니다.

- `src/images/dto/create-direct-url-input.dto.ts`: `postId` 필수 입력
- `src/images/images.controller.ts`: `body.postId`를 서비스로 전달
- `src/images/images.service.ts`: Cloudflare metadata와 DB 이미지 레코드에 `postId` 저장
- `src/shared/db/schema/image-assets.ts`: `postId`가 `notNull`
- `src/images/images.repository.ts`: 이미지 publish 처리가 `ownerUserId + postId` 기준
- `src/post/post.service.ts`: 게시글 생성 후 `post.id` 기준으로 이미지 상태 갱신

따라서 단순히 프론트에서 `postId`를 생략하는 것만으로는 해결되지 않고, 이미지 레코드의 임시 소유 기준을 바꿔야 합니다.

## 변경 방향

이미지 업로드 정책을 `postId 기준 선연결`에서 `ownerUserId 기준 임시 이미지` 방식으로 변경합니다.

핵심 원칙은 다음과 같습니다.

1. `POST /images/direct-upload-url` 요청에서 `postId`를 선택값으로 받는다.
2. 서버는 업로드 예정 이미지를 `ownerUserId` 기준의 `temp` 상태로 저장한다.
3. 프론트엔드는 발급받은 `uploadURL`로 Cloudflare에 직접 업로드한다.
4. Cloudflare 업로드가 성공한 뒤에만 `deliveryURL`을 Markdown 본문에 삽입한다.
5. 게시글 생성 또는 수정 submit 시 서버가 최종 `content`에서 Cloudflare 이미지 ID를 추출한다.
6. 서버는 현재 사용자가 소유한 이미지 중 최종 `content`에 남은 이미지만 게시글에 연결한다.
7. 최종 `content`에서 빠진 기존 이미지는 `delete_pending`으로 전환한다.
8. submit되지 않은 `temp` 이미지는 24시간 TTL 이후 Cron으로 삭제한다.
9. 게시글이 삭제되면 해당 게시글에 연결된 이미지도 `delete_pending`으로 전환한다.

## 변경 후 흐름

```text
이미지 버튼 클릭
  -> 파일 선택
  -> POST /images/direct-upload-url
  -> 서버가 ownerUserId 기준 temp 이미지 생성
  -> imageId, uploadURL, deliveryURL 반환
  -> 프론트엔드가 uploadURL로 Cloudflare에 직접 업로드
  -> 업로드 성공 시 deliveryURL을 Markdown 본문에 삽입
  -> 사용자가 게시글 submit
  -> POST /post 또는 PATCH /post/:slug
  -> 서버가 최종 content에서 Cloudflare imageId 추출
  -> content에 남은 temp 이미지를 현재 postId에 attached
  -> content에서 제거된 기존 attached 이미지를 delete_pending
  -> 오래된 temp/delete_pending 이미지는 Cron으로 삭제
```

## API 계약 변경안

### 이미지 업로드 URL 발급

`postId`는 선택값으로 변경합니다. 생성 화면에서는 `postId`를 보내지 않고, 이미 게시글이 존재하는 수정 화면에서는 필요하면 `postId`를 보낼 수 있습니다.

```http
POST /images/direct-upload-url
```

생성 화면 요청 body:

```json
{
  "purpose": "post-content"
}
```

수정 화면에서 `postId`를 알고 있는 경우의 요청 body:

```json
{
  "purpose": "post-content",
  "postId": "게시글 id"
}
```

응답은 기존 구조를 유지합니다.

```json
{
  "imageId": "cloudflare-image-id",
  "uploadURL": "https://upload.imagedelivery.net/...",
  "deliveryURL": "https://imagedelivery.net/accountHash/cloudflare-image-id/public"
}
```

서버는 이 시점에 이미지 레코드를 다음 의미로 저장합니다.

```text
imageId
ownerUserId
postId: null
status: temp
deliveryURL 또는 deliveryURL 생성 가능 정보
createdAt
updatedAt
lastSeenAt
deleteAfter: null
```

Cloudflare metadata도 `postId`에 의존하지 않도록 변경합니다.

```ts
metadata: {
  ownerUserId,
  purpose: "post-content",
  postId: postId ?? null
}
```

### Cloudflare 파일 업로드

프론트엔드는 백엔드 API가 아니라 Cloudflare Direct Upload URL로 파일을 업로드합니다.

```ts
const formData = new FormData();
formData.append('file', file);

await fetch(uploadURL, {
  method: 'POST',
  body: formData,
});
```

업로드 실패 시 `deliveryURL`을 본문에 삽입하지 않습니다.

### 게시글 생성

게시글 생성 요청은 최종 본문만 포함합니다.

```http
POST /post
```

```json
{
  "title": "게시글 제목",
  "content": "본문\n\n![image](https://imagedelivery.net/accountHash/image-id/public)",
  "tags": ["tag"]
}
```

서버 처리:

1. 게시글을 생성한다.
2. 생성된 `post.id`를 확보한다.
3. 최종 `content`에서 Cloudflare `imageId` 목록을 추출한다.
4. `ownerUserId`가 현재 사용자이고, `status = temp`이며, `imageId`가 본문에 포함된 이미지의 `postId`를 생성된 게시글 ID로 갱신하고 `attached`로 변경한다.
5. 본문에 포함되지 않은 같은 사용자의 오래된 `temp` 이미지는 즉시 건드리지 않고 TTL 정리에 맡긴다.

### 게시글 수정

수정 요청도 최종 본문만 전달합니다.

```http
PATCH /post/:slug
```

```json
{
  "title": "수정된 제목",
  "content": "수정된 최종 본문",
  "tags": ["tag"]
}
```

서버 처리:

```text
수정 후 content에 남아있는 기존 attached 이미지
  -> attached 유지, lastSeenAt 갱신

수정 후 content에서 제거된 기존 attached 이미지
  -> delete_pending

수정 중 새로 업로드되어 content에 들어온 temp 이미지
  -> 현재 postId에 attached

수정 중 업로드했지만 content에서 제거된 temp 이미지
  -> temp 유지 후 TTL Cron 삭제
```

수정 API에서 `content`가 전달되지 않은 경우에는 이미지 상태를 변경하지 않습니다.

### 게시글 삭제

게시글 삭제 시 해당 게시글에 연결된 이미지는 함께 `delete_pending`으로 전환합니다.

```text
DELETE /post/:slug
  -> 게시글 soft delete
  -> postId에 연결된 attached 이미지 delete_pending 처리
  -> Cron이 deleteAfter 이후 Cloudflare 이미지 삭제
  -> status = deleted
```

게시글 삭제 직후 Cloudflare 이미지를 즉시 삭제하지 않는 이유는 기존 `delete_pending` 정책과 동일하게 지연 삭제를 통해 복구 가능성이나 실패 재시도 여지를 남기기 위함입니다.

## DB 및 Repository 변경 방향

### image_assets 스키마

`postId`는 생성 전 이미지에 대해 비어 있을 수 있어야 하므로 nullable로 변경합니다.

```ts
postId: uuid('post_id');
```

인덱스는 기존 `ownerUserId + postId` 외에 temp 정리와 attach 조회를 고려해 보강합니다.

```text
idx_image_assets_owner_status
  -> ownerUserId, status

idx_image_assets_owner_post
  -> ownerUserId, postId

idx_image_assets_status_delete_after
  -> status, deleteAfter
```

마이그레이션에서는 기존 데이터의 `post_id`는 유지하고, 컬럼의 `NOT NULL` 제약만 제거합니다.

### 이미지 생성 Repository

이미지 생성 입력에서 `postId`를 선택값으로 변경합니다.

```ts
interface CreateImagesInput {
  imageId: string;
  ownerUserId: string;
  postId?: string | null;
}
```

생성 화면에서 발급된 이미지는 다음 상태로 저장합니다.

```text
ownerUserId = 현재 사용자
postId = null
status = temp
```

### 이미지 publish 처리

현재 `markImageStatusByPublish`는 `ownerUserId + postId`가 이미 일치하는 이미지 안에서만 상태를 바꿉니다. 생성 전 업로드 구조에서는 새 이미지의 `postId`가 `null`이므로 attach 대상 조건을 분리해야 합니다.

권장 처리:

1. `usedIds`에 포함된 현재 사용자의 `temp` 이미지 중 `postId is null` 또는 현재 `postId`인 이미지를 현재 게시글에 `attached`한다.
2. 현재 게시글에 이미 연결된 `attached` 이미지 중 `usedIds`에 없는 이미지는 `delete_pending`으로 변경한다.
3. 다른 사용자의 이미지, 다른 게시글에 연결된 이미지는 변경하지 않는다.

의미상 함수명을 더 명확히 바꾸는 것도 좋습니다.

```ts
syncPostImages({
  ownerUserId,
  postId,
  usedIds,
});
```

## 이미지 상태 모델

```text
temp
attached
delete_pending
deleted
```

### temp

업로드 URL은 발급됐지만 아직 게시글에 연결되지 않은 상태입니다. 게시글 생성 전 이미지와 수정 중 새로 업로드했지만 저장되지 않은 이미지가 여기에 해당합니다.

### attached

게시글 본문에 포함되어 있고 특정 `postId`와 연결된 상태입니다.

### delete_pending

게시글 수정 후 본문에서 제거되었거나, 게시글 삭제로 더 이상 참조되지 않아 삭제 대기 중인 상태입니다. 즉시 Cloudflare에서 삭제하지 않고 Cron이 삭제합니다.

### deleted

Cloudflare 삭제까지 완료된 상태입니다.

## 프론트엔드 구현 방향

프론트엔드는 이미지 업로드 시 `postId`를 관리하지 않습니다.

```ts
async function handleImageUpload(file: File) {
  const { data } = await getDirectUploadUrl({
    purpose: 'post-content',
  });

  await uploadFileToCloudflare(data.uploadURL, file);

  insertMarkdownImage(data.deliveryURL);
}
```

본문에는 다음 Markdown을 삽입합니다.

```md
![image](https://imagedelivery.net/accountHash/image-id/public)
```

submit 시에는 게시글 작성/수정 API에 최종 `content`만 전달합니다.

```ts
await createPost({
  title,
  content,
  tags,
});
```

```ts
await updatePost({
  slug,
  title,
  content,
  tags,
});
```

프론트엔드는 삭제된 이미지 목록을 별도로 계산하지 않습니다.

```ts
// 더 이상 필수 상태가 아님
const [uploadImages, setUploadImages] = useState<string[]>([]);

// submit 시 별도 전송하지 않음
const deletedUrlList = uploadImages.filter(
  (url) => !extractImageUrls(data.content).includes(url),
);
```

이미지 연결과 삭제 판단은 서버가 최종 `content` 기준으로 수행하는 편이 더 안전합니다.

## 보안 및 검증 조건

서버는 본문에 포함된 Cloudflare URL을 무조건 신뢰하면 안 됩니다.

필수 검증:

- URL이 서비스에서 사용하는 Cloudflare Images delivery 도메인인지 확인한다.
- URL의 account hash가 서비스 설정값과 일치하는지 확인한다.
- URL에서 추출한 `imageId`가 DB에 존재하는지 확인한다.
- `ownerUserId`가 현재 요청 사용자와 일치하는지 확인한다.
- 다른 사용자의 `temp` 이미지를 현재 게시글에 연결하지 않는다.
- 다른 게시글에 이미 `attached`된 이미지를 임의로 훔쳐 연결하지 않는다.
- 허용된 variant만 본문 이미지로 인정한다. 초기 정책은 `public`만 허용한다.

`extractCloudflareImageIds`와 `extractCloudflareImageUrls`는 설정 기반 account hash와 허용 variant를 함께 검증해야 합니다. 초기 구현에서는 `AppConfigService.cloudflare.accountHash`와 `public` variant만 허용합니다.

## submit되지 않은 이미지 정리

사용자가 이미지를 업로드한 뒤 게시글을 submit하지 않고 이탈할 수 있습니다. 이 경우 게시글은 생성하지 않고, 이미지 레코드만 `temp` 상태로 남깁니다.

Cron은 24시간 TTL이 지난 `temp` 이미지를 삭제해야 합니다.

```text
status = temp
createdAt < now - 24 hours
  -> Cloudflare 이미지 삭제
  -> status = deleted
```

기존 Cron은 `delete_pending` 이미지만 조회합니다. 변경 후에는 오래된 `temp` 이미지도 정리 대상에 포함해야 합니다.

`temp` 이미지 TTL은 24시간으로 확정합니다.

## 업로드 성공 여부 추적

Direct Upload URL을 발급받은 뒤 실제 Cloudflare 업로드가 실패할 수 있습니다.

업로드 완료 추적은 초기 구현에서 생략합니다. 대신 다음 원칙으로 단순화합니다.

- 프론트엔드는 Cloudflare 업로드 성공 후에만 `deliveryURL`을 본문에 삽입한다.
- 서버는 submit 시 본문에 포함된 `imageId`만 attach 대상으로 삼는다.
- 업로드 실패로 남은 `temp` 레코드는 TTL Cron이 정리한다.

추후 더 엄격한 추적이 필요해지면 다음 중 하나를 추가합니다.

1. Cloudflare webhook으로 업로드 완료 처리
2. 프론트엔드가 업로드 성공 후 서버에 완료 API 호출
3. submit 시점에 서버가 Cloudflare 이미지 상태 확인

## 구현 순서 제안

1. `image_assets.post_id`를 nullable로 변경하는 마이그레이션을 작성한다.
2. `CreateDirectUrlInputDto`에서 `postId` 필수를 제거하고 `purpose?: "post-content"`를 추가한다.
3. `ImagesController`와 `ImagesService`에서 `postId` 없이 direct upload URL을 발급할 수 있게 변경한다.
4. 이미지 생성 repository 입력의 `postId`를 nullable로 변경한다.
5. 게시글 생성/수정 후 호출되는 이미지 동기화 로직을 `content`의 `usedIds` 기준으로 재작성한다.
6. Cloudflare URL 검증을 account hash와 variant 기준으로 강화한다.
7. Cron이 오래된 `temp` 이미지와 만료된 `delete_pending` 이미지를 모두 삭제하도록 확장한다.
8. 게시글 삭제 시 연결된 이미지를 `delete_pending`으로 전환한다.
9. 생성/수정/삭제 케이스별 테스트를 추가한다.

## 테스트 케이스

- 게시글 생성 전 `postId` 없이 direct upload URL을 발급할 수 있다.
- direct upload URL 발급 시 이미지 레코드가 `ownerUserId`, `postId = null`, `status = temp`로 생성된다.
- 게시글 생성 시 본문에 포함된 현재 사용자의 `temp` 이미지가 생성된 게시글에 `attached`된다.
- 게시글 생성 시 본문에 포함되지 않은 `temp` 이미지는 attach되지 않는다.
- 게시글 수정 시 제거된 기존 이미지가 `delete_pending`으로 변경된다.
- 게시글 수정 시 새로 추가된 `temp` 이미지가 현재 게시글에 `attached`된다.
- 다른 사용자의 이미지 ID를 본문에 넣어도 attach되지 않는다.
- 다른 게시글에 연결된 이미지를 본문에 넣어도 현재 게시글로 이동하지 않는다.
- 허용되지 않은 account hash 또는 variant URL은 attach되지 않는다.
- `public`이 아닌 variant URL은 attach되지 않는다.
- 24시간 TTL이 지난 `temp` 이미지가 Cron 정리 대상에 포함된다.
- 게시글 삭제 시 연결된 `attached` 이미지가 `delete_pending`으로 변경된다.

## 확정된 정책

1. `/images/direct-upload-url` 요청 body의 `postId`는 선택값으로 유지한다.
2. Cloudflare delivery URL의 허용 variant는 초기값으로 `public`만 사용한다.
3. `temp` 이미지 TTL은 24시간으로 설정한다.
4. 업로드 완료 추적은 초기 구현에서는 생략한다.
5. 게시글 삭제 시 연결된 이미지도 `delete_pending`으로 전환한다.

## 결론

현재 목표 UX를 유지하려면 이미지 업로드 URL 발급 단계에서 `postId` 의존성을 제거해야 합니다.

이미지는 먼저 `ownerUserId` 기준의 `temp` 상태로 저장하고, 게시글 생성 또는 수정 submit 시 최종 `content`에 남아 있는 이미지 ID만 해당 게시글에 연결하는 구조가 적합합니다.

이 방식은 draft 게시글 없이도 이미지 선업로드를 허용하며, 게시글은 submit 전까지 생성되지 않고 submit 즉시 게시되는 기존 정책을 유지할 수 있습니다.
