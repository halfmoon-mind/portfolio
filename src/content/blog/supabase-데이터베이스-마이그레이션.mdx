---
title: Docker 환경의 PostgreSQL에서 Supabase로 데이터베이스 마이그레이션
pubDate: '2025-05-14'
description: Docker 환경의 PostgreSQL에서 Supabase로 데이터베이스 마이그레이션
heroImage: 'https://velog.velcdn.com/images/halfmoon_mind/post/6a0d05d9-1cce-40c4-be7c-db4b052497db/image.png'
tags: ['Docker', 'PostgreSQL', 'Supabase', '데이터베이스 마이그레이션']
---

데이터베이스 마이그레이션은 개발자라면 한 번쯤 겪는 도전적인 과제입니다. 특히 버전 차이가 있는 경우 더욱 까다로워질 수 있습니다. 이번 글에서는 EC2에서 실행 중인 Docker 컨테이너의 PostgreSQL 17 데이터베이스를 Supabase(PostgreSQL 15)로 마이그레이션하는 과정과 그 과정에서 발생한 문제들, 그리고 최종 해결책을 공유하려고 합니다.

## 목차

1. 상황 개요
2. 첫 번째 시도: pg_dump와 직접 복원
3. 두 번째 시도: SQL 덤프 파일 활용
4. 세 번째 시도: Supabase CLI
5. 최종 해결책: DBeaver를 이용한 테이블 마이그레이션
6. 교훈 및 결론

## 1. 상황 개요

프로젝트를 진행하면서 기존에 EC2 인스턴스 내부의 Docker 컨테이너에서 실행 중이던 PostgreSQL 17 데이터베이스를 Supabase로 이전해야 하는 상황이 발생했습니다.

변경하려고 했던 첫번째 문제는, 비용적인 문제로 ec2 t2.small 인스턴스에서 t2.micro로 변경하려고 하였고, cpu 보다는 메모리 사용량을 줄이기 위해서 다른 프로세스들을 최소한으로 사용하려고 했습니다.

또한 같은 ec2 내에서 DB와 서버 같이 떠있는 경우에는 해당 ec2에 접근하지 못하거나, 꺼져버리는 경우에는 자칫하면 DB까지 복구할 수 없을 정도로 큰 문제가 발생할 수도 있었습니다. 따라서 DB를 따로 클라우드 서비스를 활용하려고 했지만, AWS RDS에 비해서 무료 플랜을 사용할 수 있는 supabase를 사용하려고 하였습니다.

하지만 현재 Supabase는 PostgreSQL 15를 사용하고 있는데, 우리의 기존 데이터베이스는 최신 버전인 PostgreSQL 17을 사용하면서 버전이 맞지 않는 문제가 발생했습니다.

## 2. 첫 번째 시도: pg_dump와 직접 복원

가장 먼저 시도한 방법은 PostgreSQL의 기본 백업 도구인 `pg_dump`를 사용하여 데이터를 덤프하고, 이를 Supabase에 복원하는 것이었습니다.

```bash
# Docker 컨테이너에서 데이터베이스 덤프
docker exec -it [container_name] pg_dump -U [username] -F c -b -v -f /tmp/database_dump.backup [database_name]

# 덤프 파일을 로컬로 복사
docker cp [container_name]:/tmp/database_dump.backup ./database_dump.backup

```

이후 Supabase에서 이 백업 파일을 복원하려고 했으나 다음과 같은 오류가 발생했습니다:

```
pg_restore: 오류: 파일 헤더에 있는 1.16 버전은 지원되지 않습니다

```

이 오류는 PostgreSQL 17에서 생성된 덤프 파일이 PostgreSQL 15에서 직접 복원될 수 없음을 의미합니다. PostgreSQL은 대체로 상위 버전과의 호환성은 보장하지만, 하위 버전과의 호환성은 보장하지 않기 때문입니다.

## 3. 두 번째 시도: SQL 덤프 파일 활용

다음으로 ChatGPT의 도움을 받아 일반 SQL 형식으로 덤프를 생성하여 Supabase의 SQL Editor에서 실행하는 방법을 시도했습니다.

```bash
# 일반 SQL 형식으로 덤프 생성
docker exec -it [container_name] pg_dump -U [username] --schema-only --no-owner -f /tmp/schema.sql [database_name]
docker exec -it [container_name] pg_dump -U [username] --data-only -f /tmp/data.sql [database_name]

# SQL 파일을 로컬로 복사
docker cp [container_name]:/tmp/schema.sql ./schema.sql
docker cp [container_name]:/tmp/data.sql ./data.sql

```

하지만 이 방법 역시 문제가 발생했습니다:

```
psql:backup.sql:224: 오류: 잘못된 명령: \N
```

또한 UUID 타입의 데이터가 제대로 인식되지 않는 문제도 발생했습니다. PostgreSQL 17과 15 사이의 데이터 타입 변경이나 SQL 문법 차이가 원인으로 보였습니다.

## 4. 세 번째 시도: Supabase CLI

Supabase CLI를 활용한 방법도 고려했습니다. Supabase CLI는 로컬 개발 환경과 Supabase 프로젝트 간의 데이터 동기화를 위한 도구를 제공합니다.

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 데이터베이스 참조
supabase db remote set --db-url postgresql://[connection_string]

# 마이그레이션 시도
supabase db push
```

하지만 이 접근법 역시 버전 차이로 인한 호환성 문제로 완전한 해결책이 되지 못했습니다.

## 5. 최종 해결책: DBeaver를 이용한 테이블 마이그레이션

여러 시도 끝에 발견한 해결책은 오픈소스 데이터베이스 툴인 **DBeaver**를 활용하는 것이었습니다. DBeaver는 DataGrip과 유사한 무료 도구로, 다양한 데이터베이스 간의 마이그레이션 기능을 제공합니다.

### DBeaver를 활용한 마이그레이션 단계:

1. DBeaver 설치 및 실행
2. 소스 데이터베이스(EC2의 Docker PostgreSQL 17) 연결 설정
3. 대상 데이터베이스(Supabase PostgreSQL 15) 연결 설정
4. 소스 데이터베이스에서 마이그레이션할 테이블 선택
5. 우클릭 후 "Export Data" → "Database Transfer" 선택
6. 대상 데이터베이스 선택 및 옵션 설정
   - 스키마 생성 옵션 선택
   - 데이터 마이그레이션 옵션 선택
   - 제약 조건 및 인덱스 옵션 설정
7. 마이그레이션 실행

이 방법을 통해 성공적으로 데이터를 마이그레이션할 수 있었습니다. DBeaver는 데이터베이스 버전 차이를 자동으로 처리하고, 필요한 변환을 수행하여 데이터 및 스키마를 올바르게 이전해주었습니다.
