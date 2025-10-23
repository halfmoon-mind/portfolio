# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

이 프로젝트는 Astro 기반의 개인 포트폴리오 블로그 사이트입니다. Netlify를 통해 배포되며, 블로그, 포트폴리오, TIL(Today I Learned) 세 가지 주요 컨텐츠 섹션을 제공합니다.

## 개발 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (localhost:4321)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 로컬 미리보기
npm run preview

# Astro CLI 직접 실행
npm run astro [command]
```

## 프로젝트 구조

### 컨텐츠 컬렉션 (src/content/)
- **blog/**: 블로그 포스트 (Markdown/MDX)
- **portfolio/**: 포트폴리오 프로젝트 (Markdown/MDX)
- **til/**: Today I Learned 항목 (Markdown/MDX)

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

## 글로벌 상수

`src/consts.ts`에 정의:
- SITE_TITLE: "Half to Full"
- SITE_DESCRIPTION: "최고의 경험을 위해 노력하는 일기를 작성하는 공간"
