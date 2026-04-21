# Keystatic CMS Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 블로그 사이트 내부(`/keystatic`)에서 Keystatic admin UI로 blog/portfolio/til/clips 컨텐츠를 직접 작성·수정하고 GitHub에 바로 커밋할 수 있게 한다.

**Architecture:** Astro에 `@keystatic/astro` 통합을 추가하여 `/keystatic` 경로에 React 기반 admin UI를 자동 등록한다. 로컬 개발에서는 `storage: local` 로 파일시스템에 바로 쓰고, 프로덕션에서는 `storage: github` + GitHub OAuth로 레포지토리에 직접 커밋한다. 스키마는 기존 `src/content.config.ts` 의 Zod 스키마와 1:1로 매핑한다. 컨텐츠 본문은 `fields.mdx()` 로 `.mdx` 파일로 저장되며, 기존 `.md` 파일과 공존한다 (Astro glob `**/*.{md,mdx}` 가 이미 둘 다 매치).

**Tech Stack:** Astro 5.x, `@keystatic/core`, `@keystatic/astro`, `@astrojs/react`, React 18, Netlify (SSR adapter).

**Minimal Work Principle:** 이 계획은 "최대한 작업 적게"를 목표로 하므로 다음은 **의도적으로 제외**한다:
- 기존 컨텐츠 파일 마이그레이션/포맷 변환 (계속 `.md` 유지, 신규만 `.mdx`)
- 커스텀 프리뷰, Markdoc 통합, 이미지 최적화 파이프라인
- Keystatic 라우트 수동 등록 (integration 이 자동으로 처리)

---

## File Structure

| 파일 | 동작 | 책임 |
|------|------|------|
| `package.json` | 수정 | Keystatic·React 의존성 추가 |
| `astro.config.mjs` | 수정 | `react()`, `keystatic()` integration 추가 |
| `keystatic.config.ts` | 생성 | 4개 컬렉션(blog/portfolio/til/clips) 스키마 + storage 모드 정의 |
| `.env.example` | 생성 | GitHub OAuth env 변수 템플릿 (프로덕션용) |
| `.gitignore` | 수정 | `.env` 제외 확인 |

`src/pages/keystatic/*` 와 `src/pages/api/keystatic/*` 는 `@keystatic/astro` integration 이 **자동 주입**하므로 생성하지 않는다.

---

## Task 1: 의존성 설치

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Keystatic + React 의존성 설치**

Run:
```bash
yarn add @keystatic/core @keystatic/astro @astrojs/react react react-dom
yarn add -D @types/react @types/react-dom
```

- [ ] **Step 2: package.json 에 등록되었는지 검증**

Run: `grep -E '"(@keystatic|@astrojs/react|^react|react-dom)"' package.json`
Expected output: 5개 라인 (각 패키지의 버전 표시). 하나라도 빠지면 Step 1 재실행.

- [ ] **Step 3: 커밋**

```bash
git add package.json yarn.lock
git commit -m "chore: add Keystatic and React dependencies"
```

---

## Task 2: Astro 설정에 integration 등록

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: `astro.config.mjs` 를 아래 내용으로 교체**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://halfmoon.day/',
  integrations: [mdx(), sitemap(), react(), keystatic()],
  adapter: netlify(),
});
```

**주의:** `react()` 는 `keystatic()` 앞에 있어야 한다 (Keystatic 이 React renderer 를 요구).

- [ ] **Step 2: dev 서버가 에러 없이 기동하는지 확인**

Run: `yarn dev` (백그라운드 or 별도 터미널)
Expected: `[astro] watching for file changes` 와 함께 `http://localhost:4321` 수신. Keystatic 관련 warning/error 가 없어야 함.

`keystatic.config.ts` 가 아직 없어 "Cannot find module ./keystatic.config" 류 에러가 뜨면 다음 Task 에서 해결됨 — 그 외 에러만 문제 삼는다.

서버를 종료: `Ctrl+C`.

- [ ] **Step 3: 커밋**

```bash
git add astro.config.mjs
git commit -m "feat: register Keystatic and React integrations"
```

---

## Task 3: `keystatic.config.ts` 작성 — 4개 컬렉션 전체 스키마

**Files:**
- Create: `keystatic.config.ts` (프로젝트 루트)

- [ ] **Step 1: 파일 생성**

파일 경로: `/keystatic.config.ts` (프로젝트 루트, `src/` 아래 아님).

내용:

```ts
import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },

  collections: {
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        pubDate: fields.date({ label: 'Publish Date' }),
        updatedDate: fields.date({ label: 'Updated Date' }),
        heroImage: fields.image({
          label: 'Hero Image',
          directory: 'public/blog',
          publicPath: '/blog/',
        }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),

    portfolio: collection({
      label: 'Portfolio',
      slugField: 'title',
      path: 'src/content/portfolio/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        pubDate: fields.date({ label: 'Publish Date' }),
        updatedDate: fields.date({ label: 'Updated Date' }),
        startDate: fields.date({ label: 'Project Start Date' }),
        endDate: fields.date({ label: 'Project End Date' }),
        heroImage: fields.image({
          label: 'Hero Image',
          directory: 'public/portfolio',
          publicPath: '/portfolio/',
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        githubUrl: fields.url({ label: 'GitHub URL' }),
        liveUrl: fields.url({ label: 'Live URL' }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),

    til: collection({
      label: 'TIL',
      slugField: 'title',
      path: 'src/content/til/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        pubDate: fields.date({ label: 'Publish Date' }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        heroImage: fields.image({
          label: 'Hero Image',
          directory: 'public/til',
          publicPath: '/til/',
        }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),

    clips: collection({
      label: 'Clips',
      slugField: 'title',
      path: 'src/content/clips/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        pubDate: fields.date({ label: 'Publish Date' }),
        sourceUrl: fields.url({
          label: 'Source URL',
          validation: { isRequired: true },
        }),
        sourceTitle: fields.text({ label: 'Source Title' }),
        quote: fields.text({ label: 'Quote', multiline: true }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        heroImage: fields.image({
          label: 'Hero Image',
          directory: 'public/clips',
          publicPath: '/clips/',
        }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),
  },
});
```

**스키마 매핑 참고** (기존 Zod → Keystatic):

| Zod | Keystatic | 비고 |
|-----|-----------|------|
| `z.string()` (title) | `fields.slug({ name: ... })` | slug 자동 생성 |
| `z.string()` (description) | `fields.text({ multiline: true })` | |
| `z.coerce.date()` | `fields.date()` | required |
| `z.coerce.date().optional()` | `fields.date()` | Keystatic 은 빈 값 허용이 기본 |
| `z.string().optional()` (heroImage) | `fields.image()` | |
| `z.array(z.string())` | `fields.array(fields.text())` | |
| `z.string().url()` | `fields.url()` | |

- [ ] **Step 2: TypeScript 타입 체크**

Run: `yarn astro check`
Expected: 기존 에러 개수 대비 새로 증가한 에러가 없어야 함. `keystatic.config.ts` 관련 에러가 있으면 Keystatic import 경로 또는 필드 API 확인.

- [ ] **Step 3: dev 서버로 admin UI 접근 검증**

Run: `yarn dev`
브라우저에서 `http://localhost:4321/keystatic` 방문.
Expected:
- Keystatic admin UI 가 로드됨.
- 좌측 사이드바에 `Blog`, `Portfolio`, `TIL`, `Clips` 4개 컬렉션이 보임.
- 각 컬렉션 클릭 시 기존 항목들이 목록으로 보임.

서버 종료: `Ctrl+C`.

- [ ] **Step 4: 스모크 테스트 — 샘플 TIL 작성**

1. `yarn dev` 재시작
2. `/keystatic` → `TIL` → `Create` 클릭
3. Title: "Keystatic 테스트", Description: "스모크 테스트", Publish Date: 오늘, Content 에 "hello" 입력
4. `Create` 버튼 클릭
5. 파일시스템 확인: `src/content/til/keystatic-teseuteu.mdx` (또는 슬러그화된 파일) 이 생성되어야 함
6. 홈페이지 `http://localhost:4321/` 또는 `/til` 에서 새 항목이 렌더링되는지 확인

Expected: MDX 파일이 올바른 frontmatter + 본문으로 생성되고, Astro 가 렌더링함.

검증 완료 후 테스트 파일 삭제: `rm src/content/til/keystatic-*.mdx`.

- [ ] **Step 5: 커밋**

```bash
git add keystatic.config.ts
git commit -m "feat: define Keystatic collections for blog, portfolio, til, clips"
```

---

## Task 4: 프로덕션용 GitHub storage 전환 (선택 — 배포 시)

이 태스크는 **로컬 개발이 아닌 프로덕션에서 `halfmoon.day/keystatic` 으로 접속해 글을 쓰고 싶을 때만** 필요하다. 로컬에서만 쓸 거면 Task 3 에서 끝.

**Files:**
- Modify: `keystatic.config.ts`
- Create: `.env.example`
- Verify: `.gitignore` 에 `.env` 포함

### Step 1: GitHub OAuth App 등록 (사용자 수동 작업)

1. https://github.com/settings/applications/new 방문
2. 아래 값으로 입력:
   - **Application name:** `halfmoon.day Keystatic`
   - **Homepage URL:** `https://halfmoon.day`
   - **Authorization callback URL:** `https://halfmoon.day/api/keystatic/github/oauth/callback`
3. `Register application` → 생성된 `Client ID` 기록
4. `Generate a new client secret` → `Client Secret` 기록 (한 번만 표시됨)

### Step 2: Netlify 환경변수 등록

Netlify 대시보드 → Site → `Site configuration` → `Environment variables` → `Add a variable`:

| 키 | 값 |
|----|-----|
| `KEYSTATIC_GITHUB_CLIENT_ID` | Step 1 의 Client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Step 1 의 Client Secret |
| `KEYSTATIC_SECRET` | 임의 랜덤 문자열 (32+자). 생성: `openssl rand -hex 32` |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | `halfmoonday-keystatic` (OAuth App 의 slug) |

### Step 3: `.env.example` 생성 (로컬 테스트 원할 때 참고용)

내용:
```
KEYSTATIC_GITHUB_CLIENT_ID=
KEYSTATIC_GITHUB_CLIENT_SECRET=
KEYSTATIC_SECRET=
PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=halfmoonday-keystatic
```

### Step 4: `.gitignore` 확인

Run: `grep '^\.env$' .gitignore || echo ".env" >> .gitignore`
Expected: `.env` 가 이미 있거나, 추가됨.

### Step 5: `keystatic.config.ts` storage 를 environment-aware 하게 변경

`keystatic.config.ts` 상단 `import` 아래 + `export default config({...})` 의 `storage` 블록을 아래로 교체:

```ts
import { config, fields, collection } from '@keystatic/core';

const isLocal = import.meta.env.DEV;

export default config({
  storage: isLocal
    ? { kind: 'local' }
    : {
        kind: 'github',
        repo: {
          owner: 'halfmoon-mind',
          name: 'portfolio',
        },
      },

  collections: {
    // ... (변경 없음)
  },
});
```

**주의:** `owner` / `name` 은 실제 GitHub 레포 경로에 맞춰야 한다. 기존 `git remote -v` 로 확인: `git remote get-url origin`.

### Step 6: 배포 후 검증

1. 변경사항 commit + push: `git add . && git commit -m "feat: enable GitHub storage for Keystatic in production" && git push`
2. Netlify 빌드 완료 대기
3. `https://halfmoon.day/keystatic` 방문
4. GitHub OAuth 플로우를 따라 앱 설치/권한 부여
5. 아무 컬렉션에서 테스트 글 작성 → `Save` → GitHub 레포에 commit 이 자동 생성되는지 확인
6. Netlify 재배포가 트리거되고 1-2분 후 실제 사이트에 반영되는지 확인

---

## Rollback 플랜

문제 발생 시:

```bash
# Task 1-3 되돌리기
git revert HEAD~3..HEAD

# 또는 특정 커밋만
git log --oneline | head -5  # 커밋 찾기
git revert <commit-sha>
```

`.env` 는 git 에 없으므로 롤백과 무관. Netlify 환경변수는 대시보드에서 수동 삭제.

---

## Completion Criteria

- [ ] `yarn dev` 기동 시 `http://localhost:4321/keystatic` 에서 4개 컬렉션이 보인다
- [ ] admin UI 로 새 글을 작성하면 `src/content/<collection>/*.mdx` 에 올바른 frontmatter 와 함께 파일이 생성된다
- [ ] 생성된 MDX 파일이 사이트에 정상 렌더링된다
- [ ] (Task 4 수행 시) 프로덕션 `halfmoon.day/keystatic` 에서 GitHub 로그인 후 글 작성 가능하다
