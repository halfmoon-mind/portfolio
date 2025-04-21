---
title: 'Flutter로 업데이트 없이 다채로운 이벤트 구축하기'
description: '앱에서 업데이트 없이 다채로운 이벤트 구축한 경험을 공유합니다.'
pubDate: '2024-04-02'
heroImage: 'https://velog.velcdn.com/images/halfmoon_mind/post/e19be1b4-5ead-463c-9561-2fe1b54166af/image.png'
tags: ['Flutter', 'Method Channel', 'WebView', 'Event Page']
---

안녕하세요
현재 테일크루라는 회사에서 Flutter Engineer로 웹소설 플랫폼 "모픽"이라는 서비스를 만들고 있는 심상현입니다.

> _숭실대학교 Developer Conference, DEVCON에서 발표한 이야기를 요약한 내용입니다_

# 문제 상황

현재 저희 회사에는 웹소설 플랫폼을 만들고 있는데요, 해당 서비스를 만들다보니 마주쳤던 문제를 소개하려고 합니다.
저희는 새로운 기능으로 이벤트 페이지를 구축하려고 하였습니다. 이를 통해서 유저들에게 어떤 이벤트가 있는지 바로 알려줄 수 있도록 하려고 했었습니다.
여기서 이벤트 페이지를 구현하는 방식에는 여러가지 방식이 있을 것 같은데요, 다음과 같은 선택지가 있을 것입니다.

### 선택1. 웹뷰로 만들자.

처음에는 당연하게 웹뷰로 만들려고 했습니다.
해당 화면은 지속적으로 변화할 수 있고, 변경될 여지가 굉장히 클 것이기 때문입니다.
하지만 문제가 하나 있었습니다.
이벤트 페이지 내에서 동적인 인터렉션이 들어갈 수 있었던 것입니다.

> | <img src="https://velog.velcdn.com/images/halfmoon_mind/post/ead3c762-c339-4dad-ad96-cba9e916ef37/image.png"/> | <img src="https://velog.velcdn.com/images/halfmoon_mind/post/02010652-8145-4ad5-ab49-4d43fed61b41/image.png"/> |
> | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
>
> 왼쪽에 사진을 누르면 오른쪽 소설 상세페이지로 이동해야한다.

소설로 이동하는 것 뿐만 아니라, API 호출이라던가, 앱 내부에 있는 dialog가 뜬다거나, 다양한 인터렉션이 발생해야하였습니다.
이러한 상황에서 웹뷰만 사용하기에는 웹뷰 영역에서 Flutter내의 코드를 어떻게 사용할 수 있는지에 대해서 고민을 하였습니다.

### 선택2. 앱 내의 페이지로 만들자. (Flutter내 Dart 코드로 만들어서 배포하기)

그렇다면 앱 내의 화면으로 구현하면 어떨까로 생각해보았습니다.
이러한 경우에는 앱 내에서 모든 작업이 이루어지다보니, 아까전에 말했던 앱 내에 있는 코드를 실행(dialog 띄우기, 페이지 이동 등)하는 것은 쉬웠지만, 앱 배포마다 새로운 업데이트가 강제적으로 필요했습니다.

# 해결방안

결국 저는 고심 끝에 Method Channel과 WebView를 합쳐서 해결하였습니다.
Method Channel이란 Native언어의 코드를 실행하거나, Native 영역에서 Flutter 영역으로 데이터를 전달하거나 함수를 호출할 수 있는 기술을 말합니다.

> ![https://docs.flutter.dev/platform-integration/platform-channels](https://velog.velcdn.com/images/halfmoon_mind/post/5757ff5a-7e64-4668-b31c-5800516a7803/image.png)
> Flutter의 Method Channel, Android와 iOS Native 코드를 실행하거나 Native 영역에서 Flutter의 코드를 실행할 수 있다.

또한 웹뷰를 사용하면 앱스토어 / 플레이스토어를 거치지 않고도 앱 내의 콘텐츠를 업데이트할 수 있습니다. 웹만 다시 배포하면 되니깐요!

그래서 다음과 같은 구조가 탄생하였습니다.
![](https://velog.velcdn.com/images/halfmoon_mind/post/e19be1b4-5ead-463c-9561-2fe1b54166af/image.png)
코드로 한번 확인해볼까요? **_모든 코드는 [Github](https://github.com/halfmoon-mind/remote-flutter-widget/blob/main/lib/webview/webview.dart)에 올라가 있습니다_**
먼저 HTML 코드를 확인해보겠습니다.
**위치 : assets/test.html**

```HTML
<!DOCTYPE html>
<html lang="ko">
  <body>
    <script>
      // dialog라는 이벤트에 첫번째 인자로 "EVENT_TITLE_HELLO" 데이터 전달
        function dialog() {
            window.flutter_inappwebview.callHandler('dialog', 'EVENT_TITLE_HELLO');
        }
    </script>
    <h1 style="color: black" onclick="dialog()" >ON TAP DIALOG EVENT!</p>
  </body>
</html>
```

dialog라는 함수 안에 flutter 영역으로 dialog라는 이벤트에 "EVENT_TITLE_HELLO"라는 데이터를 첫 번째 인자로 전달하는 것을 알 수 있습니다.

**위치 : lib/webview/webview.dart**

주의 : 현재 코드에서는 `flutter_inappwebview: ^5.8.0` 버전을 사용하고 있습니다. 패키지 버전 업데이트 따라서 해당 코드의 인자나 값이 정상적으로 실행되지 않을 수도 있습니다.

```dart
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: InAppWebView(
        initialFile: '/assets/test.html',
        initialOptions: InAppWebViewGroupOptions(
          crossPlatform: InAppWebViewOptions(
            javaScriptEnabled: true,
            useShouldOverrideUrlLoading: true,
            mediaPlaybackRequiresUserGesture: false,
            useOnLoadResource: true,
            allowFileAccessFromFileURLs: true,
            allowUniversalAccessFromFileURLs: true,
            transparentBackground: true,
          ),
        ),
        onLoadStop: (controller, url) {
          webViewController = controller;
          addDialogEvent(context);
        },
      ),
    );
  }
}
```

우리가 눈여겨볼 곳은 addDialogEvent인데요, WebView가 로딩이 완료된 시점에 addDialogEvent함수를 통해서 dialog 실행에 대한 observer를 추가해줍니다.

```dart
void addDialogEvent(BuildContext context) {
    webViewController?.addJavaScriptHandler(
    // event handler 이름 등록
      handlerName: "dialog",
      callback: (args) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text("Dialog"),
            // argument 사용
            content: Text(args[0]),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => const LocalView(),
                    ),
                  );
                },
                child: const Text("OK"),
              ),
            ],
          ),
        );
      },
    );
  }
```

이러한 방식을 사용한다면, dialog라는 이벤트에 대해서 argument로 받는 데이터를 flutter 앱 내에 있는 코드에서 활용할 수 있을 것입니다.
또한 이러한 방식을 채택한다면 앱 내에서 동작해야하는 것들에 대해서 미리 인터페이스를 선언해주고, 웹 영역에서 해당 event 이름으로 호출하면 플러터 영역에서 이루어지는 형태로 작업하면 쉽게 작업할 수 있습니다. (앱 내에서 observing 해야하는 event가 생각보다 많지 않아 구현하기 용이합니다.)

# 마무리

저는 제가 생각한 방법이 최선의 방법이라고 생각하지 않는데요. 이벤트 페이지 구축에 다양한 방식이 있지만, 제가 이 문제를 해결할 당시 다양한 방법을 고려해보았을 때, 관련된 best practice가 없던 것으로 알고 있었고 빠르게 구현하고 유지보수하기 쉽다고 생각이 들었기 때문입니다.
해당 부분을 구현하기 위해서는 백엔드 및 웹 개발하는 사람과의 협업이 필요합니다. Flutter 영역에서 호출할 인터페이스와 Backend에서 어떤 데이터를 내려줄지도 고민이 필요합니다.
혹시라도 문제점 혹은 조언해주실 부분 있으시면 댓글로 얼마든지 달아주셔도 좋습니다.

#### [발표 자료](https://docs.google.com/presentation/d/1h1k59DlG17EkKn8x8BKJWyMSrG0xvtWC4TrrjrclaJg/edit?usp=sharing)도 공유해드려요 ㅎㅎ
