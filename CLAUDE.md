# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

이 프로젝트는 Astro 기반의 개인 포트폴리오 블로그 사이트입니다. Netlify를 통해 배포되며, 블로그, 포트폴리오, TIL(Today I Learned) 세 가지 주요 컨텐츠 섹션을 제공합니다.

## 패키지 매니저

이 프로젝트는 **yarn**을 사용합니다 (`yarn.lock` 존재). `npm`/`pnpm` 명령을 사용하지 말고 항상 `yarn`으로 통일해주세요.

## 개발 명령어

```bash
# 의존성 설치
yarn install

# 새 패키지 추가
yarn add <package>
yarn add -D <package>   # devDependency

# 개발 서버 실행 (localhost:4321)
yarn dev

# 프로덕션 빌드
yarn build

# 빌드 결과 로컬 미리보기
yarn preview

# Astro CLI 직접 실행
yarn astro [command]
```

## 프로젝트 구조

### 컨텐츠 컬렉션 (src/content/)
- **blog/**: 블로그 포스트 (Markdown/MDX)
- **portfolio/**: 포트폴리오 프로젝트 (Markdown/MDX)
- **til/**: Today I Learned 항목 (Markdown/MDX)
- **clips/**: 읽은 글 + 코멘트 형태의 공유 포스트 (Markdown/MDX)

각 컬렉션은 `src/content.config.ts`에서 정의된 스키마로 타입이 검증됩니다.

### Frontmatter 스키마

**Blog & TIL:**
```typescript
{
  title: string
  description: string
  pubDate: Date
  updatedDate?: Date (blog only)
  heroImage?: string (blog only)
  tags?: string[] (til only)
}
```

**Portfolio:**
```typescript
{
  title: string
  description: string
  pubDate: Date
  updatedDate?: Date
  startDate?: Date
  endDate?: Date
  heroImage?: string
  tags?: string[]
  githubUrl?: string
  liveUrl?: string
}
```

**Clips:**
```typescript
{
  title: string          // 클립 제목 (내가 붙이는 헤드라인)
  description: string    // 요약 (리스트/RSS/OG용)
  pubDate: Date
  sourceUrl: string      // 원본 아티클 URL (필수)
  sourceTitle?: string   // 자동 스크래핑 실패 시 수동 지정
  quote?: string         // 원문에서 인상 깊었던 인용문
  tags?: string[]
  heroImage?: string     // 자동 og:image 덮어쓰기용
}
```

### 레이아웃 구조
- **BaseLayout**: 모든 페이지의 기본 레이아웃. 헤더, 푸터, Schema.org 웹사이트 구조화 데이터 포함
- **BlogPost**: 블로그 포스트 전용 레이아웃. Article Schema.org 구조화 데이터, hero 이미지, 날짜 표시 포함

### 페이지 라우팅
- `/`: 홈페이지 (최근 블로그 3개, 포트폴리오 3개, TIL 3개 표시)
- `/blog`: 블로그 목록
- `/blog/[...slug]`: 개별 블로그 포스트
- `/portfolio`: 포트폴리오 목록
- `/portfolio/[slug]`: 개별 포트폴리오 프로젝트
- `/til`: TIL 목록
- `/til/[slug]`: 개별 TIL 항목
- `/resume`: 이력서 페이지
- `/rss.xml`: RSS 피드

## 주요 기술 스택

- **프레임워크**: Astro 5.x
- **통합**: MDX, Sitemap, RSS, Netlify Adapter
- **스타일**: Astro 컴포넌트 내 인라인 스타일
- **배포**: Netlify
- **사이트 URL**: https://halfmoon.day/

## SEO 및 구조화 데이터

- 모든 페이지에 Schema.org 구조화 데이터 포함
- BaseLayout에서 WebSite 스키마 생성
- BlogPost에서 BlogPosting 스키마 생성 (작성자: 심상현)
- Sitemap 자동 생성
- RSS 피드 지원

## 컨텐츠 작성 시 주의사항

1. 모든 컨텐츠는 한국어로 작성됨 (lang="ko")
2. 새 블로그/포트폴리오/TIL 작성 시 해당 컬렉션의 frontmatter 스키마를 반드시 준수
3. 이미지 파일은 `public/` 디렉토리에 배치
4. Hero 이미지는 최대 높이 500px로 표시됨

## Clips 작성 워크플로

Clips는 "외부 아티클 링크 + 내 코멘트" 포맷이며, 원본 글의 OG 이미지/제목/설명은 **빌드가 아닌 로컬 스크립트**로 스크래핑해 `src/data/clips-cache.json`에 저장한다.

```bash
# 1. src/content/clips/<slug>.md 작성 (frontmatter에 sourceUrl 반드시 포함)
# 2. 캐시 갱신 (새 URL만 스크래핑, 이미 있는 URL은 건드리지 않음)
yarn clips:refresh

# 강제로 전체 재스크래핑
yarn clips:refresh --force

# 3. 로컬 확인
yarn dev

# 4. 커밋 (클립 파일 + 캐시 JSON을 함께 커밋해야 배포에 반영됨)
git add src/content/clips/<slug>.md src/data/clips-cache.json
git commit -m "feat(clips): ..."
```

- 빌드(`yarn build`)는 캐시를 **읽기만** 한다 → Netlify 배포 시 외부 네트워크 호출 없음.
- 캐시에 URL이 없는 상태로 배포해도 빌드는 성공하며, 해당 클립은 썸네일 플레이스홀더로 렌더된다. 이후 `yarn clips:refresh`로 캐시 채우고 다시 커밋하면 정상화.

## 글로벌 상수

`src/consts.ts`에 정의:
- SITE_TITLE: "Half to Full"
- SITE_DESCRIPTION: "최고의 경험을 위해 노력하는 일기를 작성하는 공간"
