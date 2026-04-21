# Clips 기능 디자인 스펙

- 작성일: 2026-04-21
- 작성자: Claude (브레인스토밍 결과)
- 상태: 사용자 리뷰 대기

## 1. 배경 & 목적

블로그 운영자는 다른 사람의 글을 읽고 인사이트를 얻는 활동을 많이 한다. 현재는 슬랙 채널에서 "원본 링크 + 내 코멘트" 형태로 공유하고 있는데, 이것을 블로그에도 올려 공개적으로 누구나 읽을 수 있게 만들고 싶다.

기존 컨텐츠 타입(`blog`, `portfolio`, `til`)은 이 용도에 맞지 않는다.
- `blog`는 긴 글 중심이라 짧은 코멘트가 묻힘
- `til`은 "내가 배운 것"이라는 다른 성격
- `portfolio`는 프로젝트 쇼케이스

→ 새로운 4번째 컨텐츠 타입 `clips`를 추가한다.

## 2. 핵심 요구사항

1. **외부 아티클 링크를 중심으로 한 공유 포스트** — 원본 URL + 운영자의 코멘트
2. **시각적으로 "공유글"임이 분명히 드러남** — 블로그의 긴 글과 착각되지 않게
3. **글 작성 부담 최소화** — 원본 글의 썸네일/제목은 자동으로 가져옴
4. **기존 사이트의 배포 안정성 유지** — Netlify 자동 배포 플로우에 외부 네트워크 의존성을 주입하지 않음
5. **홈/RSS 구독자에게도 노출** — 새 클립이 기존 구독자에게 자연스럽게 전달됨

## 3. 컨텐츠 모델

### 3.1 컬렉션 스키마

`src/content.config.ts`에 `clips` 컬렉션 추가:

```typescript
const clips = defineCollection({
  loader: glob({ base: './src/content/clips', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),                   // 클립 제목 (운영자가 붙이는 헤드라인)
    description: z.string(),             // 리스트/OG/RSS용 한 줄 요약
    pubDate: z.coerce.date(),            // 공유 날짜
    sourceUrl: z.string().url(),         // 원본 아티클 URL (필수)
    sourceTitle: z.string().optional(),  // 원본 글 제목 (자동 스크래핑 덮어쓰기용)
    quote: z.string().optional(),        // 원문에서 인상 깊었던 인용문
    tags: z.array(z.string()).optional(),
    heroImage: z.string().optional(),    // 자동 og:image 덮어쓰기용 (보통 비워둠)
  }),
});
```

### 3.2 선택/제외된 필드

- `sourceAuthor` (저자/매체명): **제외**. 매체의 "저자" 개념이 모호한 경우가 많고(블로그/뉴스레터/팟캐스트), 도메인만 표시하면 충분.
- `tags`: 포함. 장기적으로 클립이 쌓이면 태그 분류가 유용.
- `quote`: 포함. "슬랙에서 공유"의 감성을 재현하는 핵심 요소.
- `heroImage`: 선택. 기본은 자동 스크래핑된 og:image를 쓰고, 자동값이 이상하거나 없을 때만 수동 지정.

### 3.3 샘플 파일

`src/content/clips/reviews-dead.md`:

```yaml
---
title: 코드는 사람이 검토해서는 안 된다
description: AI가 작성하는 코드가 늘어날수록, 명세와 자동 검증이 리뷰를 대체할 수 있을까?
pubDate: 2026-04-21
sourceUrl: https://www.latent.space/p/reviews-dead
quote: 코드는 사람이 작성해서는 안 됩니다. 코드는 사람이 검토해서는 안 됩니다.
tags: [ai, code-review, testing]
---

AI가 생성하는 코드의 수가 기하급수적으로 증가하면서 대부분의 개발자라면 코드 리뷰에 많은 공을 들이는 케이스가 많아질 것으로 예상합니다.
(본문 생략 — 운영자의 전체 코멘트)
```

## 4. OG 메타데이터 스크래핑 & 캐싱

### 4.1 설계 원칙

- **빌드는 순수하게 캐시를 읽기만** — Netlify 빌드 시 외부 네트워크 호출 없음
- **스크래핑은 별도 수동 명령** — 로컬에서 `yarn clips:refresh`로 실행
- **캐시는 git에 커밋** — git 상태가 곧 배포 상태 (결정적)
- **깜빡 허용** — 캐시에 URL이 없어도 빌드는 성공, 썸네일만 빠짐

### 4.2 컴포넌트

#### `src/data/clips-cache.json`
구조:
```json
{
  "https://www.latent.space/p/reviews-dead": {
    "ogImage": "https://substackcdn.com/.../cover.png",
    "ogTitle": "Code Reviews are Dead",
    "ogDescription": "...",
    "fetchedAt": "2026-04-21T12:34:56.000Z"
  }
}
```
- 초기값: `{}`
- git에 커밋
- 실패한 URL은 `"failed": true, "fetchedAt": ...` 로 기록 (재시도 정책은 `--force`로만)

#### `src/utils/clips-metadata.ts`
- `getClipMetadata(sourceUrl: string): ClipMetadata | null` — 캐시에서 조회만. 없으면 `null`. **네트워크 호출 없음.**
- `failed: true` 기록이 있는 URL도 `null` 반환.
- Astro 페이지에서 이 유틸만 사용.

#### 필드 fallback 우선순위 (페이지 렌더 시)

| 렌더용 값 | 1순위 (수동) | 2순위 (캐시) | 3순위 (fallback) |
|---|---|---|---|
| hero/썸네일 이미지 | `clip.data.heroImage` | `cache.ogImage` | 플레이스홀더 (도메인 이니셜) |
| 원본 제목 | `clip.data.sourceTitle` | `cache.ogTitle` | `sourceUrl` 그대로 표시 |
| 원본 설명 | — | `cache.ogDescription` | 생략 |

수동 지정이 있으면 항상 우선. 캐시에 데이터가 없거나 `null`이면 3순위 fallback 적용 — 빌드가 실패하지 않음.

#### `scripts/refresh-clips-cache.mjs`
- CLI 엔트리포인트. `yarn clips:refresh`로 실행.
- 동작:
  1. `src/content/clips/` 하위 `.md`/`.mdx` 파일 전부 읽음
  2. 각 파일의 frontmatter에서 `sourceUrl` 추출
  3. 캐시에 없는 URL만 `open-graph-scraper`로 fetch
  4. 성공 시 `ogImage`/`ogTitle`/`ogDescription` 저장, 실패 시 `failed: true`
  5. `clips-cache.json` 덮어쓰기
- `--force` 플래그: 캐시 무시하고 전체 재스크래핑
- 타임아웃: 10초/URL
- 상대 경로 og:image는 `sourceUrl` 기준 절대 URL로 정규화

### 4.3 의존성
- `open-graph-scraper` (devDependency, Node.js 전용 스크립트에서만 사용)

### 4.4 사용자 워크플로
```
1. src/content/clips/new-clip.md 작성
2. yarn clips:refresh           ← 새 URL만 스크래핑, clips-cache.json 업데이트
3. yarn dev 로 로컬 확인 (선택)
4. git add . && git commit -m "add clip: ..."
5. git push → Netlify 자동 배포 (캐시 읽기만, 빠름)
```

## 5. 페이지 디자인

### 5.1 `/clips` — 리스트 페이지

파일: `src/pages/clips/index.astro`

**레이아웃:** 카드 그리드. 홈페이지의 `card-grid` 스타일을 기반으로 변형.

**카드 구조:**
```
┌────────────────────────────┐
│  [og:image 썸네일]           │  ← 비어있으면 플레이스홀더 (연한 그라데이션)
├────────────────────────────┤
│  🔗 latent.space             │  ← sourceUrl 도메인만 추출
│  내가 붙인 클립 제목           │
│  설명 한 줄                  │
│  2026-04-21  #ai #testing   │
└────────────────────────────┘
```

- 클릭 → `/clips/[slug]` (원본 사이트 아님)
- 정렬: `pubDate` 내림차순
- 페이지네이션 없음 (전체 표시, 50개 넘으면 추후 논의)
- 태그 필터 / 검색: **이번 범위 아님**

### 5.2 `/clips/[slug]` — 상세 페이지

파일: `src/pages/clips/[slug].astro`
레이아웃: `src/layouts/ClipPost.astro` (신규, BlogPost 재활용 안 함)

**구조:**
```
┌─────────────────────────────────────────┐
│          [og:image, 전체 너비 배너]        │  ← 있으면 표시, 없으면 생략
└─────────────────────────────────────────┘

┌─ 원본 아티클 카드 ─────────────────────────┐
│ 📰 원본 아티클                            │
│ <cache.ogTitle 또는 sourceTitle>          │
│ <cache.ogDescription>                    │
│ latent.space ↗                           │  ← 카드 전체가 sourceUrl 링크
└─────────────────────────────────────────┘  (target=_blank, rel=noopener noreferrer)

# 클립 제목 (post.data.title)
2026-04-21 · #ai · #testing

> "원문에서 인상 깊었던 인용문"             ← quote 필드 있을 때만

본문 Markdown 풀 렌더
...

─────────────────────────────────────────
← 클립 목록으로 돌아가기
```

**시각적 포인트:**
- 원본 아티클 카드가 페이지 상단의 "공유글임"을 드러내는 앵커
- `quote`는 본문 시작 전 큰 blockquote로 렌더 (슬랙 공유 스타일)
- 본문은 긴 글도 받을 수 있게 full markdown 지원

### 5.3 플레이스홀더 처리

og:image가 없는 경우:
- **리스트 카드**: 연한 그라데이션 배경 + 원본 도메인 이니셜 중앙 배치 (예: "L" for latent.space)
- **상세 페이지**: 상단 배너를 생략하고 바로 "원본 아티클 카드"부터 시작

## 6. 네비게이션 & 통합

### 6.1 헤더 메뉴 (`src/components/Header.astro`)

현재: `Home · Blog · TIL · Portfolio · Resume`
변경: `Home · Blog · TIL · Clips · Portfolio · Resume`

(Blog/TIL 다음에 짧은 포맷끼리 묶음)

### 6.2 홈페이지 (`src/pages/index.astro`)

기존 3개 섹션 하단에 **"최근 Clips"** 섹션 신설:
- 최근 3개 표시
- `/clips` 리스트 카드 스타일과 동일
- "Clips 더 보기 →" 링크

### 6.3 RSS 피드 (`src/pages/rss.xml.js`)

현재는 `blog`만 포함. 변경 후: `blog` + `clips`를 병합한 뒤 `pubDate` 내림차순 정렬.

```js
const posts = await getCollection('blog');
const clips = await getCollection('clips');
const items = [
  ...posts.map(p => ({ ...p.data, link: `/blog/${p.id}/` })),
  ...clips.map(c => ({
    title: c.data.title,
    description: c.data.description,
    pubDate: c.data.pubDate,
    link: `/clips/${c.id}/`,
  })),
].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
```

- 클립은 RSS description에 요약만 (본문은 사이트에서)
- TIL/portfolio는 RSS 미포함(현행 유지)

### 6.4 사이트맵

`@astrojs/sitemap`이 `src/pages/` 기반으로 자동 생성. 별도 작업 불필요.

## 7. SEO / 구조화 데이터

- 상세 페이지 `<head>` OG 태그에 캐시된 og:image 사용 → 외부 공유 시 썸네일 렌더링
- 스키마: `Article` with `isBasedOn: { "@type": "CreativeWork", "url": sourceUrl }` 형태로 "원본에 기반한 공유 포스트"임을 명시
- BlogPosting 스키마는 쓰지 않음 (원본이 따로 있는 2차 콘텐츠)

## 8. 파일 변경 목록

### 신규 파일
- `src/content/clips/` — 디렉토리, 샘플 클립 1개 (`reviews-dead.md`, 주신 코멘트로)
- `src/pages/clips/index.astro` — 리스트 페이지
- `src/pages/clips/[slug].astro` — 상세 페이지
- `src/layouts/ClipPost.astro` — 클립 전용 레이아웃
- `src/utils/clips-metadata.ts` — 캐시 조회 유틸
- `src/data/clips-cache.json` — 초기 `{}`
- `scripts/refresh-clips-cache.mjs` — og 스크래핑 CLI

### 수정 파일
- `src/content.config.ts` — `clips` 스키마 추가 + export
- `src/components/Header.astro` — 메뉴에 "Clips" 추가
- `src/pages/index.astro` — "최근 Clips" 섹션 추가
- `src/pages/rss.xml.js` — blog + clips 병합
- `package.json` — `clips:refresh` 스크립트 + `open-graph-scraper` devDependency
- `CLAUDE.md` — clips 컬렉션 문서화, 클립 작성 워크플로 추가

## 9. 범위 외 (명시적 제외)

다음은 이번 스펙에 포함되지 않으며, 별도 요구 시 이후에 다룸:
- 태그별 필터 페이지 / 아카이브
- 검색 기능
- 클립 목록 페이지네이션 (50개 초과 시 논의)
- 댓글 / 반응 / 좋아요
- 자동 og:image 재스크래핑 주기 (수동 `--force`로만)
- 클립 → 블로그로 승격하는 기능

## 10. 성공 기준

- `src/content/clips/`에 `.md` 파일 추가하면 `/clips`와 `/clips/[slug]`, 홈페이지, RSS에 자동 반영됨
- `yarn clips:refresh` 실행 시 새 URL의 og:image/title/description이 `clips-cache.json`에 저장됨
- 캐시가 있는 상태에서 `yarn build`는 외부 네트워크 호출 0회
- 캐시가 없어도 빌드는 성공하며, 썸네일만 플레이스홀더로 대체됨
- 외부(타 블로그/SNS)에서 `/clips/[slug]` 공유 시 OG 태그로 썸네일이 정상 노출됨
