// Site-wide UI internationalization. Korean is the default locale (served at the
// root); English is served under the /en/ path prefix. Long-form content (blog,
// portfolio, til, clips) is translated as separate content files — this module
// only covers the chrome/shell strings that live in templates.

export type Locale = 'ko' | 'en';
export const DEFAULT_LOCALE: Locale = 'ko';
export const LOCALES: Locale[] = ['ko', 'en'];

/** Locale of a URL: /en or /en/* is English, everything else Korean. */
export function getLocale(url: { pathname: string }): Locale {
  const p = url.pathname;
  return p === '/en' || p.startsWith('/en/') ? 'en' : 'ko';
}

/**
 * Convert a path to the given locale by adding/removing the /en prefix.
 * Input may already carry an /en prefix; it is normalised to the ko base first.
 * Pages whose locale sibling shares the same slug (everything except blog) can
 * rely on this for their language toggle href.
 */
export function localizePath(path: string, locale: Locale): string {
  const base = path === '/en' || path === '/en/' ? '/' : path.startsWith('/en/') ? path.slice(3) : path;
  if (locale === 'ko') return base;
  return base === '/' ? '/en/' : `/en${base}`;
}

export const ogLocale = (l: Locale): string => (l === 'en' ? 'en_US' : 'ko_KR');

/**
 * ko/en/x-default hreflang alternates for a page given the current path and its
 * sibling's path. x-default points at Korean (the default locale).
 */
export function hreflangFor(
  locale: Locale,
  currentPath: string,
  siblingPath: string,
  site: URL | undefined,
): { hreflang: string; href: string }[] {
  const abs = (p: string) => (site ? new URL(p, site).toString() : p);
  const koPath = locale === 'ko' ? currentPath : siblingPath;
  const enPath = locale === 'en' ? currentPath : siblingPath;
  return [
    { hreflang: 'ko', href: abs(koPath) },
    { hreflang: 'en', href: abs(enPath) },
    { hreflang: 'x-default', href: abs(koPath) },
  ];
}

const UI = {
  ko: {
    'site.description': '최고의 경험을 위해 노력하는 일기를 작성하는 공간',
    'meta.keywords': '포트폴리오, 블로그, 기술, 개발, 웹 개발',

    'a11y.openMenu': '메뉴 열기',
    'a11y.github': 'GitHub 프로필',
    'a11y.linkedin': 'LinkedIn 프로필',
    'a11y.langSwitch': '언어 선택',

    'home.bio.1': '항상 최선을 다하는 엔지니어 심상현입니다. 현재 4년차 Flutter Mobile Engineer로 활동하고 있습니다.',
    'home.bio.2': '새로운 것을 익히고, 그것을 활용하여 새로운 서비스 혹은 기존의 프로덕트를 개선하고 있습니다.',
    'home.bio.3': '빠르게 MVP를 만들어 시장에 내놓고, 그것을 검증하고 반복하는 것을 좋아합니다.',
    'home.recentPosts': '최근 글',
    'home.recentPortfolio': '최근 포트폴리오',
    'home.recentTil': '최근 TIL',
    'home.recentClips': '최근 Clips',
    'home.morePosts': '블로그 더 보기 →',
    'home.morePortfolio': '포트폴리오 더 보기 →',
    'home.moreTil': 'TIL 더 보기 →',
    'home.moreClips': 'Clips 더 보기 →',

    'blog.metaTitleSuffix': '블로그',

    'portfolio.metaDescription': '다양한 프로젝트를 한 눈에 보아요',
    'portfolio.intro': '재밌고 유쾌한 프로젝트를 한 눈에 확인하기!',
    'portfolio.updated': '업데이트:',
    'portfolio.back': '← 포트폴리오 목록으로',

    'til.back': '← TIL 목록으로 돌아가기',

    'clips.intro': '읽은 글과 그 위에 남기는 짧은 코멘트.',
    'clips.slackNote': '설치하면 새 Clip이 올라올 때 지정한 채널로 알림이 갑니다.',
    'clips.back': '← 클립 목록으로 돌아가기',
    'clips.sourceLabel': '📰 원본 아티클',
  },
  en: {
    'site.description': 'A space for writing about the pursuit of the best possible experience',
    'meta.keywords': 'portfolio, blog, tech, software, web development, Flutter',

    'a11y.openMenu': 'Open menu',
    'a11y.github': 'GitHub profile',
    'a11y.linkedin': 'LinkedIn profile',
    'a11y.langSwitch': 'Language',

    'home.bio.1': "I'm Sanghyeon Sim, an engineer who always gives his best. I'm currently in my fourth year as a Flutter mobile engineer.",
    'home.bio.2': 'I pick up new things and put them to work — building new services or improving existing products.',
    'home.bio.3': 'I love shipping an MVP fast, getting it in front of the market, then validating and iterating.',
    'home.recentPosts': 'Recent Posts',
    'home.recentPortfolio': 'Recent Portfolio',
    'home.recentTil': 'Recent TIL',
    'home.recentClips': 'Recent Clips',
    'home.morePosts': 'More posts →',
    'home.morePortfolio': 'More portfolio →',
    'home.moreTil': 'More TIL →',
    'home.moreClips': 'More clips →',

    'blog.metaTitleSuffix': 'Blog',

    'portfolio.metaDescription': 'A glance at a variety of projects',
    'portfolio.intro': 'A quick look at some fun, playful projects!',
    'portfolio.updated': 'Updated:',
    'portfolio.back': '← Back to Portfolio',

    'til.back': '← Back to TIL',

    'clips.intro': "Articles I've read, with a short note on top.",
    'clips.slackNote': "Once installed, you'll get a notification in your chosen channel whenever a new Clip goes up.",
    'clips.back': '← Back to Clips',
    'clips.sourceLabel': '📰 Original article',
  },
} as const;

export type UIKey = keyof (typeof UI)['ko'];

/** Returns a `t(key)` lookup bound to the given locale, falling back to Korean. */
export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return UI[locale][key] ?? UI.ko[key];
  };
}

export function siteDescription(locale: Locale): string {
  return UI[locale]['site.description'];
}
