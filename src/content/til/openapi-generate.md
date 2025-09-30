---
title: 'OpenAPI를 사용해 API 자동 생성 시 주의점'
description: 'OpenAPI Generator를 사용하여 API 자동 생성을 하면 서버에서 설정한 Swagger 문서와 동일한 스펙으로 데이터를 모델 및 API Endpoint를 사용할 수 있다. 사용하면서 느꼈던 문제점들을 공유해본다.'
pubDate: 2025-09-23
tags: ['flutter', 'OpenAPI', 'Auto Generation']
---

## 오늘 배운 것

나는 Flutter Engineer로 활동하면서 기존에 Swagger 문서를 보고 다시 [Retrofit](https://pub.dev/packages/retrofit)이나 다른 API 호출부를 만들고 거기에 알맞은 모델을 [freezed](https://pub.dev/packages/freezed)로 생성하여 사용하는 방식을 계속 사용하고 있었다.
다만 문제점은 API 변경이 되거나 새로운 API를 만들 때마다 계속 내가 임의로 수정해야하고, 서버 배포 시에 변경되었을 때 문제점이 없는지 일일이 확인해야한다는 단점이 있었다.
그래서 사용을 고민했던 것은 [openapi generator](https://github.com/OpenAPITools/openapi-generator)였다.
이것을 사용하면 OpenAPI 스펙에 맞게 생성된 백엔드 API 호출부를 모두 자동화하여 내가 따로 API endpoint나 request body, request parameter, response body 등을 자동으로 생성해주어 편의성을 굉장히 올려주는 툴이다.
해당 패키지를 도입하려고 한번 테스트해본 결과 문제점이 일부 존재하여 일단 적용은 보류하였는데, 해당 문제들을 공유해보고자 한다.

### 문제점 1
Flutter에서 API 호출을 담당하는 패키지라고 하면 가장 유명한 패키지가 [dio](https://pub.dev/packages/dio), [http](https://pub.dev/packages/http) 가 있을 것이다. 둘 다 장단점이 있긴 하지만, 여러가지 커스텀을 시도하기 때문에 대부분 dio를 사용할 것으로 추측한다.
OpenAPI Generator를 사용하면 해당 호출부를 대체할 수 있을 뿐더러, 모델들을 자동으로 생성해줘서 편하게 사용할 수 있을 줄 알았다.
하지만 dio 패키지를 이전 버전을 사용하면서 내가 사용하는 패키지의 버전을 내린다거나, 내가 기존에 구현한 커스텀 버전을 사용할 수 없도록 만들었다.
그래서 http 패키지 기반으로 사용하려고 하니, 이미 구현했던 Interceptor 같은 기능들을 100% 활용할 수 없었다.

### 문제점 2
서버에서 OpenAPI를 활용한 generation을 하더라도 문제가 있는 경우인데, 이 부분도 공유하려고 한다.
서버에서 DTO를 생성할 때, Object의 이름을 다르게 하더라도 RequestBody의 content가 동일하다면, generator가 각각 class를 생성하는게 아니라 처음 만든 class를 재사용하는 특성이 있다.
이것도 비슷한 예로 dart 파일을 생성할 때에 문제가 발생하는데, 내가 겪은 문제를 예시로 들어 설명하겠다.
서버에서 사용하는 enum 타입 중에서 요일(date)에 관련된 데이터가 있었다.
이 값은 서버에서 String 타입으로 request를 받는 부분이었고, 거기에 들어갈 수 있는 데이터들은 enum 타입으로 구현되어 있었다.
하지만 해당 enum 타입은 한 곳에서만 사용하는 것이 아니였고 여러 개의 request에 동일한 enum 값을 사용하게 되었다.
이런 상황에서 request body에 넣을 모델을 생성하니 A request body에서 사용하는 enum 타입과 B request body에서 사용하는 enum 타입이 동일한 값을 참조하는 것이다.
이러한 경우에 자동으로 generation 할 때 공통된 값을 만들고 그걸 각각 참조하도록 구현되어있으면 좋겠지만, 그런 방식이 아니라 서버에서 발생하는 문제와 비슷하게 B request body에서 A request body의 일부를 참조하는 것이다.
예를 들어 ServiceDayEnum 이라는 공통되는 enum이 있다면, 비슷한게 InternalClassroomListBodyAllOfDataServiceDaysEnum 이라는 값도 있고, ClassroomWithSiteServiceDaysEnum 과 같은 enum이 있다는 것이다.
각각 모델이 있으면 상관이 없으나, 아쉽게도 ClassroomWithSiteServiceDaysEnum을 참조하면서 ServiceDayEnum를 enum 타입으로 가지고 있는 괴상한 코드가 자동생성되게 된다.

### 사용 중인 방식
문제점 2에서 지적한 바와 같이 일단 기본적으로 자동 생성한 코드를 그대로 사용하면 lint에서부터 문제가 발생할 가능성이 있다.
나는 이것을 해결하기 위해 임의로 script를 하나 생성했다. 해당 script는 공통으로 구현되는 enum 타입을 grep과 sed로 제거하고 잘못된 참조를 수정한다.
또한 dio를 사용하지 못하는 것을 막기 위해 일단은 request, response body와 parameter의 모델로만 사용하고 실제 API를 호출하는 형태는 사용하지 않는다.

### 결론...
자동화를 위해서 코드를 생성했지만, 어이없게도 이걸 유지보수하기 위한 자동생성 코드 수정하는 script를 생성하고 있는 시점에 온 것부터 약간 앞뒤가 안맞는 것 같긴하다.
하지만 자동생성의 이점을 잘 활용 한다면 생산성을 조금 더 높일 수 있는 기회가 되지 않을까?