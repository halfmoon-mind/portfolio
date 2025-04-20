---
title: 'Flutter로 업데이트 없이 다채로운 이벤트 구축하기 2편 feat RFW'
description: '앱에서 업데이트 없이 다채로운 이벤트 구축한 경험을 공유합니다.'
pubDate: '2024-04-10'
heroImage: '/rfw.png'
tags: ['Flutter', 'Method Channel', 'WebView', 'Event Page', 'RFW', 'Remote Flutter Widget']
---

[1편](./Flutter로-업데이트-없이-다채로운-이벤트-구축하기_1편.md)에서 이어집니다.

# 서론

이벤트 페이지를 구축하는 방법에 대해서는 간단하게 저번 글에서 요약해보았습니다.
그렇다면 웹뷰와 observer로만 작업할 수 있을까요?

# RFW

[RFW](https://pub.dev/packages/rfw)(Remote Flutter Widget) 패키지는 다음과 같은 설명을 하고 있습니다.

```
a library for rendering declarative widget description files at runtime.
```

해석을 해보자면 `런타임에 선언적 위젯 설명 파일을 렌더링하기 위한 라이브러리입니다` 라는 뜻인데요.
즉 동적으로 랜더링되는 위젯을 런타임에 뷰에 추가할 수 있다는 뜻입니다.

# 계기

사실 이 패키지를 알게된 계기는 앱에서 [코드푸시](https://learn.microsoft.com/ko-kr/appcenter/distribution/codepush/)와 같은 기능을 찾아보다가 발견하였습니다. ㅎㅎ
Flutter는 매년 다음년도에 어떤 작업을 중점적으로 할 것이고, 하지 않은 것인지에 대해서 발표를 하는데요, [Roadmap](https://github.com/flutter/flutter/wiki/Roadmap)에서 확인할 수 있습니다.
![](https://velog.velcdn.com/images/halfmoon_mind/post/f8b8a1a8-2ca8-426d-be76-2069deb51ee3/image.png)
여기서 `Non-goals`라는 섹션에서는 다음 년도에 작업하지 않을 것을 얘기해주는데, 확인해보니 code push는 지원하지 않는다(...)라고 얘기를 하였는데 다른 패키지들은 존재하는 것을 보고 이건 뭘까 하면서 호기심을 가졌습니다.
shorebird는 code push와 동일한 기능을 지원하지만, 서드파티 패키지인 것과 아직 iOS가 베타 릴리즈(라고 얘기하면서 확인해보니 정식 릴리즈가 되었다...!)여서 도입이 꺼려졌었는데, rfw는 무엇일까 하고 궁금하였습니다.

# 한계

말만 들으면 모든 뷰를 동적으로 그려줄 수 있다면 앱 내에 코드가 아예 없어도 될 것처럼 보여지는데, 그것보다는 일부 UI코드를 서버에서 내려줄 수 있다고 생각하면 편하다. 모든 UI나 비즈니스 로직을 업데이트 하는 것은 어려울 수 있다.

> ![](https://velog.velcdn.com/images/halfmoon_mind/post/2efbcd82-6e26-4ed8-bdf8-77a5f44bbc72/image.png)
> 공식문서에도 한계점이 나와있다...

# 사용법

먼저 패키지를 pubspec.yaml에 추가한다.
예제 코드는 다음 링크에서 확인할 수 있다. ([Github](https://github.com/flutter/packages/tree/main/packages/rfw/example))

먼저 각 속성에 들어갈 수 있는 정보는 String 혹은 num 타입이다.
예시 코드를 보자.

```dart
import core.widgets;
import core.material;

widget Counter = Scaffold(
  appBar: AppBar(title: Text(text: "Counter Demo")),
  body: Center(
    child: Column(
      mainAxisAlignment: "center",
      children: [
        Text(text: 'You have pushed the button this many times:', textAlign: "center"),
        Text(text: data.counter, style: {
          fontSize: 36.0,
        }),
      ],
    ),
  ),
  floatingActionButton: FloatingActionButton(
    onPressed: event "increment" { },
    tooltip: "Increment",
    child: Icon(icon: 0xE047, fontFamily: "MaterialIcons"),
  ),
);
```

또한 해당 뷰가 들어갈 실제 앱에서 사용하고 있는 정보(`data.counter`)도 볼 수 있다.
혹은 앱 영역에 데이터를 전송할 event인 `increment` 도 볼 수 있다.

다른 예제 코드를 보자.

```dart
import core.widgets;
import core.material;

widget Counter = Container(
  color: 0xFF66AACC,
  child: Center(
    child: Button(
      child: Padding(
        padding: [ 20.0 ],
        child: Text(text: data.counter, style: {
          fontSize: 56.0,
          color: 0xFF000000,
        }),
      ),
      onPressed: event 'increment' { },
    ),
  ),
);

widget Button { down: false } = GestureDetector(
  onTap: args.onPressed,
  onTapDown: set state.down = true,
  onTapUp: set state.down = false,
  onTapCancel: set state.down = false,
  child: Container(
    duration: 50,
    margin: switch state.down {
      false: [ 0.0, 0.0, 2.0, 2.0 ],
      true: [ 2.0, 2.0, 0.0, 0.0 ],
    },
    padding: [ 12.0, 8.0 ],
    decoration: {
      type: "shape",
      shape: {
        type: "stadium",
        side: { width: 1.0 },
      },
      gradient: {
        type: "linear",
        begin: { x: -0.5, y: -0.25 },
        end: { x: 0.0, y: 0.5 },
        colors: [ 0xFFFFFF99, 0xFFEEDD00 ],
        stops: [ 0.0, 1.0 ],
        tileMode: "mirror",
      },
      shadows: switch state.down {
        false: [ { blurRadius: 4.0, spreadRadius: 0.5, offset: { x: 1.0, y: 1.0, } } ],
        default: [],
      },
    },
    child: DefaultTextStyle(
      style: {
        color: 0xFF000000,
        fontSize: 32.0,
      },
      child: args.child,
    ),
  ),
);
```

조금 더 복잡한 뷰인데, 실제 flutter에서 사용하는 속성 중, material widget의 기능 대부분을 지원하는 것으로 보인다.

다른 예제 코드를 보자.

```dart
static WidgetLibrary _createLocalWidgets() {
    return LocalWidgetLibrary(<String, LocalWidgetBuilder>{
      'GreenBox': (BuildContext context, DataSource source) {
        return ColoredBox(
          color: const Color(0xFF002211),
          child: source.child(<Object>['child']),
        );
      },
      'Hello': (BuildContext context, DataSource source) {
        return Center(
          child: Text(
            'Hello, ${source.v<String>(<Object>["name"])}!',
            textDirection: TextDirection.ltr,
          ),
        );
      },
    });
  }

  // ...

void _update() {
    _runtime.update(localName, _createLocalWidgets());
    _runtime.update(remoteName, parseLibraryFile('''
      import local;
      widget root = GreenBox(
        child: Hello(name: "World"),
      );
    '''));
  }
```

해당 코드는 로컬에 정의된 widget을 보여준다.
여기서 \_runtime.update 안에 file 정보만 서버에서 지정해주면, 로컬에 선언된 원하는 widget에 대해서 지정해줄 수 있을 것이다.

# 내가 만든 RFW뷰

먼저 rfw에 원하는 뷰를 선언해준다.

```dart
import core.widgets;
import core.material;

widget Counter = GestureDetector(
    child: Container(
        height: 200,
        color: 0xFF002211,
        child: Column(
            mainAxisAlignment: "center",
            crossAxisAlignment: "center",
            children: [Text(text: ["Hello, ", data.greet.name, "!"], textDirection: "ltr"),],
        ),
    ),
    onTap: event "greeting" { data: "GO" },
);
```

`Counter`라는 변수에 GestureDector로 클릭했을 때, greeting이라는 이벤트에 "GO"라는 정보를 전달한다. 또한 greet.name이라는 변수 값도 client 사이드에서 받는다.

client(앱) 사이드에서는 다음과 같이 선언한다.

```dart
// https://github.com/halfmoon-mind/remote-flutter-widget/raw/main/lib/remote/counter_app1.rfw
// https://github.com/halfmoon-mind/remote-flutter-widget/raw/main/lib/remote/counter_app2.rfw

import 'dart:io';

import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:rfw/rfw.dart';

void main() {
  runApp(
    MaterialApp(
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const RemoveView(),
    ),
  );
}

class RemoveView extends StatefulWidget {
  const RemoveView({super.key});

  @override
  State<RemoveView> createState() => _RemoveViewState();
}

class _RemoveViewState extends State<RemoveView> {
  final Runtime _runtime = Runtime();
  final DynamicContent _data = DynamicContent();

  int _counter = 0;
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    _runtime.update(
        const LibraryName(<String>['core', 'widgets']), createCoreWidgets());
    _runtime.update(const LibraryName(<String>['core', 'material']),
        createMaterialWidgets());

    _updateData();
    _updateWidgets();
  }

  void _updateData() {
    _data.update('counter', _counter.toString());
  }

  void _updateWidgets() async {
    final Directory home = await getApplicationSupportDirectory();
    const baseUrl =
        "https://github.com/halfmoon-mind/remote-flutter-widget/raw/main/lib/remote/";
    const firstFileName = "counter_app1.rfw";
    const secondFileName = "counter_app2.rfw";

    String targetFileName = firstFileName;

    // 항상 새로운 값으로 업데이트
    File targetFile = File(join(home.path, firstFileName));
    if (targetFile.existsSync()) {
      targetFile.deleteSync();
      targetFileName = secondFileName;
      targetFile = File(join(home.path, secondFileName));
    }
    final client =
        await (await HttpClient().getUrl(Uri.parse('$baseUrl$targetFileName')))
            .close();
    await targetFile
        .writeAsBytes(await client.expand((element) => element).toList());
    _runtime.update(const LibraryName(<String>['main']),
        decodeLibraryBlob(await targetFile.readAsBytes()));
    setState(() {
      _ready = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) {
      return const Material(
        child: Scaffold(
          body: Center(
            child: Text(
              "NOT READY",
              style: TextStyle(fontSize: 40),
            ),
          ),
        ),
      );
    }
    return RemoteWidget(
      runtime: _runtime,
      widget: const FullyQualifiedWidgetName(
        LibraryName(<String>['main']),
        'Counter',
      ),
      data: _data,
      onEvent: (eventName, eventArguments) {
        if (eventName == 'increment') {
          setState(() {
            _counter++;
            _updateData();
          });
        }
        if (eventName == "greeting") {
          Fluttertoast.showToast(msg: "Hello, ${eventArguments['data']}");
        }
      },
    );
  }
}
```

해당 코드는 계속 다른 화면을 보여주기 위해서 1번과 2번을 번갈아서 저장하였다.
이 코드에서 flutter 영역의 데이터를 rfw 측에 넘겨주기, rfw 측의 정보를 flutter에 event의 형태로 전달하기, 동적으로 화면 그리는 것을 실제로 보여주기와 같은 것을 보여준다.

# 후기

먼저 **실제 플러터와의 문법이 조금 달라**서 어려웠다.
이게 실제로 동작하는지는 rfw의 파서가 정상적으로 해당 코드를 분석할 수 있으면 가능한데, 문법이 약간 다르다보니 해당 값에 어떻게 넣어야하는지 감이 잘 안왔다.

```dart
// 예시
import core.widgets;
import core.material;
widget Counter = Scaffold(
  appBar: AppBar(title: Text(text: "Counter Demo")),
  body: Center(
    child: Column(
      mainAxisAlignment: "center",
      children: [
        Text(text: 'You have pushed the button this many times:', textAlign: "center"),
        Text(text: data.counter, style: {
          fontSize: 36.0,
        }),
      ],
    ),
  ),
  floatingActionButton: FloatingActionButton(
    onPressed: event "increment" { },
    tooltip: "Increment",
    child: Icon(icon: 0xE047, fontFamily: "MaterialIcons"),
  ),
);
```

예제 코드를 보면 우리가 생각하는 Scaffold에 들어갈 수 있는 값이 약간씩 다르다. 기존에는 `MainAxisAlignment.center`와 같은 형태가 들어갔지만, rfw에서는 String의 형태로 입력한다던지...

이러한 불편함을 제외하고는 굉장히 획기적이었다.
데이터 로딩 중에 임시 뷰를 미리 그려줄 수도 있는 부분과 함께 무엇보다 **동적으로 데이터를 내려줄 수 있다**는 장점이 있는듯 했다. 필요하다면 서버에서 직접 코드를 가공해서 내려줄 수도 있을 것이다.

단점으로 하나 꼽히는건 **runner로 코드를 컴파일해줘야**한다는 것이다.
[Github](https://github.com/flutter/packages/blob/main/packages/rfw/example/remote/remote_widget_libraries/encode.dart)를 보면 encode하는 방식이 나와있는데, 완전히 동적으로 가능하다는건 아닌 것 같아서 아쉬웠다.

이것과 관련해서 학교에서 발표를 하였는데 질문에서 **RFW의 성능이 flutter에서 dart 코드로 작성한 것과 동일한 성능을 유지할 수 있는가**에 대해서 질문을 받았는데, 대답을 못했다. 이건 한 번 찾아보고 고민해보면 좋을 것 같다.

해당 패키지를 찾아보다보니, 관련된 글이 많지 않아서 해당 패키지에 관심이 있는 사람에게 도움이 되었으면 좋겠다.
