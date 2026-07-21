export type ResumeLink = {
  label: string;
  href: string;
};

export type ResumeProject = {
  name: string;
  links: ResumeLink[];
  responsibilities: string[];
};

export type ResumeExperience = {
  role: string;
  company: string;
  period: string;
  projects: ResumeProject[];
};

export type ResumeTalk = {
  year: string;
  title: string;
  links: ResumeLink[];
};

export type ResumeEducation = {
  school: string;
  department: string;
  period: string;
};

export type ResumeOpenSourceProject = {
  name: string;
  period: string;
  url: string;
  features: string[];
};

export const resumeProfile = {
  name: '심상현',
  title: 'Software Engineer',
  image: '/profile.jpg',
  contacts: [
    {
      label: 'simsanghyeon00@gmail.com',
      href: 'mailto:simsanghyeon00@gmail.com',
    },
    {
      label: 'github.com/halfmoon-mind',
      href: 'https://github.com/halfmoon-mind',
    },
  ],
};

export const resumeIntro = [
  `<span class="highlight">Flutter Mobile Engineer</span>로 4년차를 맞이하며 여러 프로덕션 서비스를 배포 및 유지보수 하고 있습니다. Flutter 뿐 아니라 다양한 분야의 지식을 배우면서 <span class="highlight">엔지니어링 퀄리티</span>를 높이고 있습니다. 엔지니어로서의 관점 뿐만 아니라 <span class="highlight">비즈니스의 본질</span>을 이해하고 유연하게 문제를 해결합니다.`,
  `일상생활 속의 불편함을 인지하고 이를 기술로서 풀어내는 <span class="highlight">제너럴리스트</span>입니다. 또한 <span class="highlight">AI</span>를 적극적으로 활용하여 Product에 빠르게 <span class="highlight">비즈니스 임팩트</span>를 낼 수 있는 방안을 항상 고민하고 적극적으로 제시하는 <span class="highlight">Product Engineer</span>입니다.`,
];

export const experiences: ResumeExperience[] = [
  {
    role: 'Flutter Mobile Engineer',
    company: 'Playtag',
    period: '2025년 6월 - 현재',
    projects: [
      {
        name: '스토리라인 - AI 행동 분석 솔루션',
        links: [
          {
            label: 'AppStore',
            href: 'https://apps.apple.com/us/app/storyline-ai-insight/id6445879562',
          },
          {
            label: 'PlayStore',
            href: 'https://play.google.com/store/apps/details?id=com.playtag.storyline',
          },
        ],
        responsibilities: [
          `<span class="highlight">AI 기반 아동 행동 분석 솔루션</span>의 iOS/Android Flutter 앱 개발 및 운영`,
          `교사와 보호자가 아동의 활동 기록, 놀이 참여도, 사회적 상호작용을 확인하는 <span class="highlight">교육 도메인</span>의 모바일 경험 개선`,
          `글로벌 교육기관 사용 환경을 고려해 <span class="highlight">다국어 처리</span>를 진행하고, 언어별 문구와 화면 흐름을 안정적으로 관리`,
        ],
      },
    ],
  },
  {
    role: 'Flutter Mobile Engineer',
    company: '어터',
    period: '2023년 10월 - 2025년 6월',
    projects: [
      {
        name: '[비공개] - 영화 커뮤니티',
        links: [],
        responsibilities: [
          `프로젝트 내 <span class="highlight">유일 앱 개발자</span>로 프로젝트 내 모든 기능 구현`,
          `<span class="highlight">앱인앱 구조</span>로 커뮤니티 내 숏드라마 서비스 구현하여 2가지(<span class="highlight">Bloc+GoRouter, GetX</span>) 상태 관리를 동시에 사용할 수 있도록 구현`,
          `Cursor와 같은 <span class="highlight">AI Agent</span>를 적극적으로 활용하여 빠르게 프로젝트를 구축`,
          `커뮤니티 내 게시글 뷰어, 게시글 작성을 위한 <span class="highlight">HTML 에디터</span> 기능 구현`,
          `<span class="highlight">DRM</span> 적용된 <span class="highlight">HLS/DASH 스트리밍</span> 방식 동영상 플레이어 개발하고, 불안정한 네트워크 환경에서 적절하게 화면이 보여질 수 있도록 지속적으로 기능 개선`,
          `전세계 스토어 대상으로 배포하여 <span class="highlight">다국어 지원</span> 애플리케이션 개발 경험`,
          `유저가 인앱결제를 시도 할 때, 서버가 응답하지 않을 경우를 대비해 1분마다 <span class="highlight">영수증 검증 처리 재시도</span>하면서 유저와 인증 정보를 <span class="highlight">Sentry</span> 서버에 로그로 남겨 CS 대응에 수월하도록 처리`,
        ],
      },
      {
        name: '모픽 - 웹소설 콘텐츠 플랫폼',
        links: [
          { label: '웹사이트', href: 'https://mofic.io' },
          {
            label: 'AppStore',
            href: 'https://apps.apple.com/kr/app/%EB%AA%A8%ED%94%BD-%EB%8D%94-%EB%A7%8E%EC%9D%80-%EC%86%8C%EC%84%A4-%EC%86%8D%EC%9C%BC%EB%A1%9C/id6469601198',
          },
          {
            label: 'PlayStore',
            href: 'https://play.google.com/store/apps/details?id=com.toodat.android&hl=ko',
          },
        ],
        responsibilities: [
          `<span class="highlight">Fastlane</span>을 활용한 <span class="highlight">CI/CD 파이프라인</span> 구축하여 배포 소요 시간 <span class="highlight">60% (6분) 감소</span>`,
          `<span class="highlight">Amplitude</span>를 활용하여 유저 사용시간 분석하고, 야간 시간대 유저 참여를 높이기 위해 주도적으로 <span class="highlight">다크모드</span>의 기능 우선순위를 조정하여 개발`,
          `기능 추가 이후 야간 시간대 기존 대비 유저 session <span class="highlight">35% 증가</span>`,
          `팀 내 모바일 엔지니어링을 주도하며 <span class="highlight">Clean Architecture</span>, <span class="highlight">MVVM</span> 구조를 설계하여 앱을 제작`,
          `Geek News, Toss Tech와 같은 뉴스레터, 테크블로그를 읽고 기존 앱 아키텍처를 변경에 용이하게 개선`,
          `<span class="highlight">Sentry</span>를 로그 레벨과 <span class="highlight">Stack Trace</span>, <span class="highlight">Routing history</span>를 적극적으로 활용하여 Sentry 도입 이후 버그 픽스 소요 시간 <span class="highlight">30% 단축</span>`,
          `신속한 비즈니스 검증 및 요구사항 수정을 빠르게 반영하기 위해 <span class="highlight">Server Driven UI</span>를 적용`,
          `앱 배포 없이 <span class="highlight">Admin 페이지</span>에서 손쉽게 메인페이지의 화면 구성을 수정할 수 있도록 구현`,
          `Flutter에서 지원하는 적절한 ePub 파일 뷰어 패키지가 없어 <span class="highlight">웹소설 뷰어 패키지</span> 제작하여 초기에 만든 웹뷰를 활용한 epub.js 뷰어보다 로딩 속도 <span class="highlight">40% 감소</span>`,
          `앱 리브랜딩 경험으로 하드 코딩된 데이터 제거하고, 관리 포인트를 각 페이지가 아니라 <span class="highlight">하나의 모듈</span>에서 관리하도록 설정`,
        ],
      },
    ],
  },
  {
    role: 'Software Engineer',
    company: '허슬러즈',
    period: '2022년 4월 - 2023년 5월 (1년 1개월)',
    projects: [
      {
        name: '게더링 - 소셜 공유 캘린더 플랫폼',
        links: [
          {
            label: 'AppStore',
            href: 'https://apps.apple.com/kr/app/%EA%B2%8C%EB%8D%94%EB%A7%81-%ED%95%A8%EA%BB%98-%EC%93%B0%EB%8A%94-%EA%B3%B5%EC%9C%A0-%EC%BA%98%EB%A6%B0%EB%8D%94/id1643475991',
          },
          {
            label: 'PlayStore',
            href: 'https://play.google.com/store/apps/details?id=day.gathering.app&hl=ko',
          },
        ],
        responsibilities: [
          `<span class="highlight">일간/주간/월간</span> 커스텀 캘린더 제작`,
          `기존에 모든 반복 일정이 각각 다른 일정으로 처리되는 것에 불편함을 느껴 <span class="highlight">반복 일정 관리 알고리즘</span> 개발`,
          `DB 레코드 <span class="highlight">40% 감소</span>`,
          `그룹 서비스(그룹 일정 추가, 게시글) <span class="highlight">Full Stack</span> 개발 (Node.js, Flutter)`,
        ],
      },
    ],
  },
];

export const skillCategories = [
  {
    name: '프론트엔드',
    items: ['React.js / Next.js', 'HTML / CSS / JavaScript / TypeScript', 'Tailwind CSS'],
  },
  {
    name: '모바일',
    items: ['Flutter', 'SwiftUI', 'Bloc / GetX / Provider', 'Clean Architecture / MVVM'],
  },
  {
    name: '기타',
    items: [
      'AWS (EC2, S3, Lambda 등)',
      'Amplitude / Google Analytics / Appsflyer',
      'Sentry',
      'CI/CD (Fastlane)',
    ],
  },
];

export const talks: ResumeTalk[] = [
  {
    year: '2026',
    title: '바람개비 - 결국, 만들어 본 사람만 남는다',
    links: [
      {
        label: '발표자료',
        href: '/26.06.20%20%EB%B0%94%EB%9E%8C%EA%B0%9C%EB%B9%84%20%EB%B0%9C%ED%91%9C.pdf',
      },
    ],
  },
  {
    year: '2025',
    title: '스타트업에서 AI와 함께 살아남기',
    links: [
      {
        label: '발표자료',
        href: 'https://archive-halfmoon-mind.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%B3%E1%84%90%E1%85%A1%E1%84%90%E1%85%B3%E1%84%8B%E1%85%A5%E1%86%B8%E1%84%8B%E1%85%A6%E1%84%89%E1%85%A5+AI%E1%84%8B%E1%85%AA+%E1%84%92%E1%85%A1%E1%86%B7%E1%84%81%E1%85%A6+%E1%84%89%E1%85%A1%E1%86%AF%E1%84%8B%E1%85%A1%E1%84%82%E1%85%A1%E1%86%B7%E1%84%80%E1%85%B5.pdf',
      },
    ],
  },
  {
    year: '2025',
    title: 'YourSSU 홈커밍 - 주니어와 취준생에게 전하는 Flutter 사용 경험',
    links: [],
  },
  {
    year: '2024',
    title: 'GDXC - 과거의 나, 현재의 나',
    links: [],
  },
  {
    year: '2024',
    title: 'GDSC 2024 Final Event - 학교에서 배운 내용으로 현업에서 써먹기',
    links: [
      {
        label: '발표자료',
        href: 'https://archive-halfmoon-mind.s3.ap-northeast-2.amazonaws.com/EDDY_3%E1%84%80%E1%85%B5_GDSC_FinalEvent.pdf',
      },
    ],
  },
  {
    year: '2024',
    title: 'SSU DEVCON - Flutter로 다채로운 이벤트 페이지 구축하기',
    links: [
      {
        label: '발표자료',
        href: 'https://archive-halfmoon-mind.s3.ap-northeast-2.amazonaws.com/%E1%84%89%E1%85%AE%E1%86%BC%E1%84%89%E1%85%B5%E1%86%AFDEVCON+-+%E1%84%89%E1%85%B5%E1%86%B7%E1%84%89%E1%85%A1%E1%86%BC%E1%84%92%E1%85%A7%E1%86%AB+%E1%84%87%E1%85%A1%E1%86%AF%E1%84%91%E1%85%AD.pdf',
      },
      {
        label: '유튜브',
        href: 'https://www.youtube.com/watch?v=JpzyT2XPNqw&ab_channel=GDSCSoongsil',
      },
    ],
  },
  {
    year: '2023',
    title: 'GDSC SSUMall Seminar - 플러터, 어디까지 배워볼래?',
    links: [
      {
        label: '발표자료',
        href: 'https://archive-halfmoon-mind.s3.ap-northeast-2.amazonaws.com/%E1%84%91%E1%85%B3%E1%86%AF%E1%84%85%E1%85%A5%E1%84%90%E1%85%A5_%E1%84%8B%E1%85%A5%E1%84%83%E1%85%B5%E1%84%81%E1%85%A1%E1%84%8C%E1%85%B5_%E1%84%87%E1%85%A2%E1%84%8B%E1%85%AF%E1%84%87%E1%85%A9%E1%86%AF%E1%84%85%E1%85%A2.pdf',
      },
    ],
  },
];

export const education: ResumeEducation = {
  school: '숭실대학교',
  department: '컴퓨터학부',
  period: '2019.03 - 2025.02',
};

export const openSourceProjects: ResumeOpenSourceProject[] = [
  {
    name: 'Rubric Evaluator',
    period: '2026년 6월 - 현재',
    url: 'https://github.com/halfmoon-mind/rubric-evaluator',
    features: [
      `Claude Code / Codex 스킬 디렉토리를 6섹션·31항목 <span class="highlight">루브릭</span>으로 평가하는 플러그인`,
      `구조·안전성 검사를 stdlib 기반 Python 스크립트로 수행하고, S~F 등급을 <span class="highlight">결정적(deterministic)</span>으로 산출`,
      `단일 소스에서 <span class="highlight">Claude Code와 Codex</span> 두 호스트용 플러그인을 동시에 배포`,
    ],
  },
  {
    name: 'Fusion Council',
    period: '2026년 6월 - 현재',
    url: 'https://github.com/halfmoon-mind/fusion-council',
    features: [
      `구현 계획과 코드 리뷰를 <span class="highlight">다중 모델(Claude 역할 패널 + GPT-5.5)</span>로 교차 검증하는 Claude Code 플러그인`,
      `architect·skeptic·test·maintainer 역할 패널이 병렬로 심의하고, judge가 <span class="highlight">하나의 결과로 합성</span>하는 결정적 파이프라인 설계`,
      `벤치마크 기반 평가(EVAL.md)로 기본 구성을 검증하여 <span class="highlight">노이즈 절반, 비용 21% 절감</span> 구성을 기본값으로 채택`,
    ],
  },
  {
    name: 'Awesome Articles',
    period: '2025년 1월 - 현재',
    url: 'https://github.com/yourssu/awesome-articles',
    features: [
      `iOS, Android, 프론트엔드, 백엔드, 엔지니어링 등 <span class="highlight">다양한 분야의 아티클</span>을 분류하여 체계적으로 아카이빙하는 오픈소스 프로젝트`,
      `다양한 개발자들이 함께 좋은 아티클을 공유하고 토론하며 전반적인 <span class="highlight">엔지니어링 수준</span>을 높이는 지식 공유 플랫폼`,
      `<span class="highlight">GitHub Discussion</span>을 통해 의견 교환을 하고, 정기적으로 의견과 링크를 취합하여 업데이트`,
    ],
  },
  {
    name: 'YDS (YourSSU Design System)',
    period: '2023년 4월 - 2024년 1월',
    url: 'https://github.com/yourssu/YDS-iOS',
    features: [
      `YourSSU에서 개발한 YourSSU Design System(YDS)의 <span class="highlight">iOS 파트</span> 구현`,
      `기존 <span class="highlight">UIKit</span>으로만 구현되어 있는 디자인시스템을 <span class="highlight">SwiftUI</span>로 구현`,
      `디자인 시스템 메인테이너로서 사용자인 개발자들에게 어떠한 <span class="highlight">DX</span>를 제공하면 좋을지에 대한 고민`,
    ],
  },
  {
    name: 'Style Parser',
    period: '2024년 6월 - 2024년 7월',
    url: 'https://github.com/halfmoon-mind/style-parser',
    features: [
      `HTML 형태와 ePub 파싱 데이터를 위한 <span class="highlight">스타일 파서</span> 패키지`,
      `파싱한 스타일을 기반으로 TextSpan을 구현하여, 텍스트 페이지네이션와 같은 유저의 기호에 따라 화면을 구현하도록 유도`,
    ],
  },
];
