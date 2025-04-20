---
title: 'MySQL에서 이모지(Emoji) 저장 문제 해결하기'
description: 'Flutter 애플리케이션에서 MySQL에 이모지 저장 시 발생하는 문제 해결법'
pubDate: '2023-04-30'
heroImage: 'https://velog.velcdn.com/images/halfmoon_mind/post/642cf83f-eaea-40c0-bbfd-8e540365f7c3/image.png'
tags: ['MySQL', 'Flutter', '이모지', 'UTF-8']
---

Flutter 애플리케이션을 개발하는 과정에서 이모지를 MySQL 데이터베이스에 저장할 때 발생한 문제와 그 해결 과정을 공유한다.

## 문제 상황

Flutter 앱에서 emoji_picker 라이브러리를 사용해 선택한 이모지를 MySQL 데이터베이스에 저장하는 기능을 구현했다. 하지만 특정 이모지, 특히 복합 이모지가 제대로 저장되지 않는 문제가 발생했다.

예를 들어, 가족 이모지인 👨‍👩‍👧‍👧를 저장하면 데이터베이스에는 👩‍👦처럼 일부만 저장되는 현상이 발생했다.

초기 데이터베이스 컬럼 설정은 다음과 같았다:

```
Name: emoji
Type: varchar(4)
Character Set: utf8mb4
Collation: utf8mb4_general_ci
```

클라이언트에서는 올바르게 표시되지만, 서버에서 데이터를 다시 로드하면 이모지가 변경되어 있었다. 서버 로그를 확인한 결과, 이모지는 서버까지 올바르게 전달되었으나 MySQL에 저장되는 과정에서 변형되는 것으로 확인되었다.

## 원인 분석 및 해결 과정

### 1. MySQL의 UTF-8 인코딩 이해하기

MySQL의 UTF-8 구현은 표준과 다소 차이가 있다. MySQL의 'utf8' 문자셋은 실제로 문자당 최대 3바이트만 지원한다. 대부분의 일반 문자는 3바이트면 충분하지만, 이모지와 같은 일부 유니코드 문자는 4바이트가 필요하다.

이런 4바이트 문자를 저장하기 위해서는 'utf8mb4' 문자셋을 사용해야 한다. 여기서 'mb4'는 'multi-byte 4'의 약자로, 문자당 최대 4바이트까지 저장할 수 있음을 의미한다.

그러나 이미 utf8mb4를 사용하고 있었기 때문에 문제의 원인이 다른 곳에 있다고 판단했다.

### 2. Collation 검토

다음으로 생각한 것은 Collation(문자 정렬 규칙)의 문제 가능성이었다. utf8mb4_general_ci에서 utf8mb4_unicode_ci로 변경하는 방안을 검토했다.

두 방식의 주요 차이점:

- `utf8mb4_general_ci`: CPU 성능이 제한적이던 시절에 최적화된 빠른 정렬 방식
- `utf8mb4_unicode_ci`: 더 정확한 유니코드 표준 기반 정렬 방식

현대 시스템에서는 두 방식 간 성능 차이가 미미하며, 오히려 unicode_ci가 더 정확한 정렬을 제공하기 때문에 최근에는 이 방식이 선호된다. 하지만 테스트 결과, Collation 변경으로는 문제가 해결되지 않았다.

### 3. 바이트 크기 검증

마지막으로 이모지가 실제로 차지하는 바이트 크기를 조사했다.

![](https://velog.velcdn.com/images/halfmoon_mind/post/642cf83f-eaea-40c0-bbfd-8e540365f7c3/image.png)

가족 이모지(👨‍👩‍👧‍👧)는 25바이트, 다른 복합 이모지들도 각각 21바이트, 14바이트 등으로 상당한 공간을 차지했다.

VARCHAR(4)의 실제 저장 공간을 확인해본 결과:

> ![](https://velog.velcdn.com/images/halfmoon_mind/post/c8f0fd4c-c55d-4411-ab05-5ebc8f819219/image.png)
> VARCHAR(4)는 최대 16바이트, VARCHAR(8)은 32바이트까지 저장 가능한 것으로 확인됐다.

VARCHAR(4)는 각 문자를 최대 4바이트로 계산하여 총 16바이트까지만 저장할 수 있다. 따라서 25바이트 크기의 이모지는 자연스럽게 잘릴 수밖에 없었다. 실제로 큰 이모지를 저장할 때 `ERROR 1265: Data truncated for column 'emoji' at row 1` 오류가 발생하는 것을 확인했다.

## 해결책

데이터베이스 스키마를 수정하여 emoji 컬럼의 타입을 VARCHAR(4)에서 VARCHAR(8)로 변경했다. 이로써 최대 32바이트까지 저장할 수 있게 되었고, 복합 이모지도 문제없이 저장되었다.

> ![](https://velog.velcdn.com/images/halfmoon_mind/post/ef45b21b-0c6b-447f-bd47-3ca0971e992b/image.png)
>
> 변경 후 모든 이모지가 정상적으로 저장되는 것을 확인할 수 있었다.

## 결론 및 시사점

이번 경험을 통해 MySQL의 문자 인코딩과 저장 방식에 대한 몇 가지 중요한 사항을 배웠다:

1. MySQL의 기본 utf8 인코딩은 문자당 최대 3바이트만 지원하며, 이모지와 같은 4바이트 문자는 utf8mb4를 사용해야 한다.
2. VARCHAR(n)에서 n은 단순히 문자 수를 의미하지만, 실제 저장 공간은 사용하는 문자셋에 따라 달라진다.
3. 복합 이모지는 단일 문자처럼 보이지만 내부적으로는 여러 코드 포인트의 조합으로, 상당한 바이트 크기를 차지할 수 있다.

이모지를 포함한 유니코드 문자를 데이터베이스에 저장할 때는 충분한 저장 공간을 확보하는 것이 중요하다. VARCHAR 크기를 넉넉하게 설정하고, 적절한 문자셋(utf8mb4)을 사용하면 대부분의 문제를 예방할 수 있다.
