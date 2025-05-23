---
title: 'Nightary'
description: '수면 상태를 배터리 형태로 보여주는 수면 측정 트래커'
pubDate: '2023-12-29'
startDate: '2023-12'
endDate: '2024-01'
heroImage: '/assets/nightary.png'
tags: ['Flutter', 'HealthKit', 'WidgetKit', 'Local Storage']
githubUrl: 'https://github.com/GDSC-snowflowerthon/Nightary-team12-mobile'
---

# Nightary

Nightary는 사용자의 수면 패턴을 분석하고 수면 상태를 배터리 형태로 시각화하여 보여주는 수면 측정 트래커 앱입니다.
Google Developer Student Club(GDSC) 해커톤, 눈꽃톤에서 개발된 이 앱은 사용자가 자신의 수면 상태를 직관적으로 파악하고 개선할 수 있도록 도와줍니다.

Flutter를 기반으로 개발되었으며, Apple Watch의 센서 기반으로 HealthKit을 통하여 수면의 질과 양을 측정합니다.
홈화면에서 위젯을 통한 배터리 시각화로 사용자는 자신의 수면 상태를 에너지 레벨로 쉽게 이해할 수 있으며, 수면 패턴에 따른 맞춤형 조언을 받아 건강한 수면 습관을 형성할 수 있습니다.

다양한 수면 데이터를 기록하고 분석하는 기능을 제공하며, 수면 목표 설정 및 알림 기능을 통해 사용자가 규칙적인 수면 습관을 유지할 수 있도록 도와줍니다.

## 기능

- 수면 데이터 수집 및 분석
- 배터리 형태의 직관적인 수면 상태 시각화
- 수면 패턴에 따른 맞춤형 조언
- 수면 목표 설정 및 알림 기능
- 홈 화면 위젯 지원

## 기술 스택

- **Flutter**: 모바일 앱 개발
- **HealthKit**: Apple의 건강 데이터 접근
- **WidgetKit**: iOS 홈 화면 위젯 개발
- **Local Storage**: 사용자 설정 및 데이터 저장

## 도전과제 및 해결방안

### 수면 데이터 수집 및 분석

- HealthKit을 통한 실제 수면 데이터를 분석해보니 수면 데이터가 연속적이지 않고, 수면 레벨이 바뀔 때마다 데이터가 끊어져 있거나 5~10분 간격으로 수면이 이어져 있는 패턴들을 확인하였습니다.
- 이를 단순하게 수면이 연속적이지 않다고 판단하는게 아니라, 끊긴 시점에서 5~10분 내로 수면이 이어져 있으면 수면이 이어져 있는 것으로 판단하여 수면 데이터를 분석하였습니다.
