---
title: 'Flutter에서 공유 시, iPad OS에서 공유가 실행되지 않는 문제'
description: 'Astro에서 Content Collections을 사용하여 타입 안전한 콘텐츠 관리하는 방법을 배웠다.'
pubDate: 2025-07-04
tags: ['flutter', 'share_plus']
---

## 오늘 배운 것

Flutter에서 share_plus를 사용하면, 이미지나 텍스트를 공유할 수 있다.
단, sharePositionOrigin 파라미터 값을 무조건 넣어줘야한다.

### 발생 원인

얼마 전 iOS AppStore 심사를 진행 중에 iPad에서 공유하기 버튼을 눌렀을 때, 아무런 동작도 발생하지 않는다는 에러가 발생하기 때문에 심사가 거절당했다는 메시지를 받았다.
이전까지는 iOS와 iPad OS를 따로 고려하지 않고 코드를 작성하였고, iOS simulator로 검사했을 때에도 문제 없었기 때문에 iOS QA 과정에서는 제외되었던 부분이었다.
이번 앱 심사는 iPad도 고려된 배포였기 때문에 해당 문제가 확인된 것으로 추측된다.
해당 문제를 인지하고 [share_plus] (https://pub.dev/packages/share_plus) 패키지를 확인해보니, `sharePositionOrigin` 파라미터를 꼭 넣어달라는 메시지가 맨 밑에 들어있었다.
해결할 때 도움이 되었던 [관련 이슈](https://github.com/fluttercommunity/plus_plugins/issues/1640)를 첨부하겠다.

### 실제 적용

```dart
Future<ShareResultStatus> _shareImage(
  String image,
  BuildContext context,
) async {
  final http.Client client = http.Client();
  final req = await client.get(Uri.parse(image));
  if (req.statusCode >= 400) {
    throw HttpException(req.statusCode.toString());
  }
  final bytes = req.bodyBytes;
  String dir = (await getTemporaryDirectory()).path;
  File file = File('$dir/example.jpeg');

  await file.writeAsBytes(bytes);

  final ShareResult result = await Share.shareXFiles(
    [XFile(file.path)],
    sharePositionOrigin: Rect.fromLTWH(
      0,
      0,
      MediaQuery.of(context).size.width,
      MediaQuery.of(context).size.height / 2,
    ),
  );
  return result.status;
}
```

### 참고 자료

- [Astro Content Collections 공식 문서](https://docs.astro.build/en/guides/content-collections/) 