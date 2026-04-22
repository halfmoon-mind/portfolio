---
title: 'Clean Architecture와 GetX를 활용한 Todo List 앱 만들기'
description: 'GetX를 활용한 클린 아키텍쳐 적용 예제'
pubDate: '2023-09-14'
heroImage: '/clean-architecture.png'
tags: ['Flutter', 'Clean Architecture', 'GetX']
---

# 시작하며

요즘 앱 개발을 하면 여러가지 아키텍쳐, 디자인 패턴을 사용하게 된다.
결국 서비스를 유지보수 / 코드 가독성 측면을 높이려고 사용하는 방법이라고 생각된다.

하지만 개인적인 생각으로 앱 서비스 개발을 처음 배우는 단계에서 아키텍쳐에 대해서 배우는 것에 대해서는 별로 추천하지 않는다.
내가 flutter를 처음 배웠던 시점에서는 모든 Widget을 Screen에 모두 때려박은 다음, Model 정도만 분리하고 작업했던 것으로 기억한다. 그 시점에서는 뷰를 구현하는 것마저도 쉽지 않았고, 디자인 패턴은 그런 뷰를 만드는 것이 익숙해진 이후에 필요해진 것 같다.
지금에 이르러서는 아키텍쳐에 대한 지식이 필요한 부분이라고 생각해서 공부하고 있는데, 돌이켜보면 지금까지 만들어본 대부분의 토이 프로젝트에서는 크게 필요 없어 보이긴 한다.
따라서 이 글은 처음 flutter를 배우는 사람 보다는 어느 정도 만들어본 경험이 있고, 여러가지 아키텍쳐를 구현하는 방식에 대해서 고민해본 사람에게 추천한다.

# 서비스 구현하기

사실 이 글을 쓰려고 클린 아키텍쳐를 찾아보고 작성한 것은 아니고, 회사 입사 과제로 작성한 부분이다.
코드를 작성하면서 들었던 생각들을 공유하고 싶어서 작성한 것이니, 틀린 부분이 있을 수도 있고 불완전한 부분이 있을 수도 있다.

## GetX

[GetX](https://pub.dev/packages/get)은 flutter에 존재하는 상태관리 라이브러리 중 하나이다.
이것 외로도 Provider, Riverpod, Bloc 과 같은 라이브러리가 존재한다.
그 중 나는 GetX를 활용해서 todo list를 만들어 볼 것이다.

flutter의 여러 커뮤니티에서 항상 나오는 얘기가 GetX에 대해서 별로다 / 정말 좋다 라는 의견이 충돌하는 것으로 보인다.
내가 서비스를 만들어 보면서 느꼈던 부분은 GetX 자체는 괜찮아 보인다.
Observer 패턴을 잘 적용하고 있는 라이브러리라고 생각하지만, 단점은 상태 관리 라이브러리 하나치고는 너무 방대한 부분(라우팅, 모달, DI 등)을 적용할 수 있고, 결국 서비스 자체가 하나의 패키지에 종속되어버리는 부분이 좋지 않다고 생각한다.
또한 flutter에서 잘 사용하라고 만든 context를 무시하고 독립적으로 사용할 수 있도록 만들 수 있어, 좋지 않은 코딩 습관을 기를 수 있다는 단점이 생길 수도 있다. (내가 현재 GetX로 flutter 입문을 하고 다시 돌아가려하니 너무 어려운 경험에서 시작했다)

## Clean Architecture

flutter의 상태관리 라이브러리들은 각각 결합하면 좋은 디자인 패턴이 있는 것으로 보인다.
내가 생각하기에는 GetX는 다른 디자인 패턴이 크게 필요하지는 않아 보이고, 클린 아키텍쳐 정도만 도입해도 괜찮아 보여서 적용해보았다.
![](https://velog.velcdn.com/images/halfmoon_mind/post/617cb8a5-693e-40a9-acd0-5ff82d19b4ae/image.png)
Clean Architecture란 각 레이어 별로 로직을 나누어서 관심사를 분리하고, 코드를 유지보수하거나 가독성을 높이는 아키텍쳐라고 생각하면 좋을 것 같다.
예를 들어 실제 데이터를 만나는 (로컬DB나 api 호출 등) 경우는 Entity, 그것을 감싸는 UseCase들. Usecase를 활용하는 Presenter들로 구성되게 된다.

### 폴더 구조

```
lib
 ┣ data
 ┃ ┣ datasources
 ┃ ┃ ┗ todo_local_datasource.dart
 ┃ ┗ repositories
 ┃ ┃ ┗ todo_repository_impl.dart
 ┣ domain
 ┃ ┣ entities
 ┃ ┃ ┣ todo_entity.dart
 ┃ ┃ ┗ todo_entity.g.dart
 ┃ ┣ repositories
 ┃ ┃ ┗ todo_repository.dart
 ┃ ┗ usecases
 ┃ ┃ ┣ get_todos.dart
 ┃ ┃ ┗ save_todos.dart
 ┣ presentation
 ┃ ┣ controllers
 ┃ ┃ ┗ todo_controller.dart
 ┃ ┣ pages
 ┃ ┃ ┣ edit_todo_page.dart
 ┃ ┃ ┗ todo_page.dart
 ┃ ┗ widgets
 ┃ ┃ ┗ todo_widget.dart
 ┣ routes
 ┃ ┗ routes.dart
 ┗ main.dart
```

처음 배울 때는 매우 추상적인 개념이여서 어떻게 구현하면 좋을지에 대해서 고민이 깊었는데, 예제 코드를 보면서 참고하면 좋을 것 같아서 이 글을 작성하게 되었다.

### data 영역

todo_local_datasource.dart
실제 로컬 DB에 있는 정보를 불러오는 방식으로 구현하였다.

```dart
import 'package:flutter_todo_example/domain/entities/todo_entity.dart';
import 'package:hive/hive.dart';

class TodoLocalDataSource {
  final String _boxName = 'todos';
  Future<Box<TodoEntity>> get _todosBox async => await Hive.openBox(_boxName);

  Future<List<TodoEntity>> getTodos() async {
    final box = await _todosBox;
    return box.values.toList();
  }

  Future<void> saveTodos(List<TodoEntity> todos) async {
    final box = await _todosBox;
    for (final todo in todos) {
      await box.put(todo.id, todo);
    }
  }
}
```

todo_repository_impl.dart
repository를 구현한 구현체이다.

```dart
import 'package:flutter_todo_example/data/datasources/todo_local_datasource.dart';
import 'package:flutter_todo_example/domain/entities/todo_entity.dart';
import 'package:flutter_todo_example/domain/repositories/todo_repository.dart';

class TodoRepositoryImpl implements TodoRepository {
  final TodoLocalDataSource localDataSource;

  TodoRepositoryImpl(this.localDataSource);

  @override
  Future<List<TodoEntity>> getTodos() {
    return localDataSource.getTodos();
  }

  @override
  Future<void> saveTodos(List<TodoEntity> todos) {
    return localDataSource.saveTodos(todos);
  }
}
```

### domain 영역

todo_entity.dart
직렬화 할 수 있는 방법으로 모델링 하였다.

```dart
import 'package:hive/hive.dart';

part 'todo_entity.g.dart';

@HiveType(typeId: 0)
class TodoEntity {
  @HiveField(0)
  final String id;
  @HiveField(1)
  final String title;
  @HiveField(2)
  final bool isCompleted;

  TodoEntity(this.id, this.title, this.isCompleted);

  TodoEntity copyWith({String? id, String? title, bool? isCompleted}) {
    return TodoEntity(
      id ?? this.id,
      title ?? this.title,
      isCompleted ?? this.isCompleted,
    );
  }
}
```

todo_repository.dart
data 영역의 repository의 interface를 만들어준다.

```dart
import 'package:flutter_todo_example/domain/entities/todo_entity.dart';

abstract class TodoRepository {
  Future<List<TodoEntity>> getTodos();
  Future<void> saveTodos(List<TodoEntity> todos);
}
```

get_todos.dart
dart의 특이한 문법인 `call()`이 등장하는데, 이는 클래스를 마치 함수처럼 부를 수 있도록 만들어둔 것이다.
이러한 방식으로 repository를 받은 후에 실제로 동작하는 부분이 나온다.

```dart
import 'package:flutter_todo_example/domain/entities/todo_entity.dart';
import 'package:flutter_todo_example/domain/repositories/todo_repository.dart';

class GetTodos {
  final TodoRepository repository;

  GetTodos(this.reposity);

  Future<List<TodoEntity>> call() async {
    return await reposity.getTodos();
  }
}
```

### presentation 영역

todo_page.dart
getx를 활용하여 obx를 사용하여 더 깔끔한 코드를 만들 수 있었다.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_todo_example/domain/entities/todo_entity.dart';
import 'package:flutter_todo_example/domain/usecases/get_todos.dart';
import 'package:flutter_todo_example/domain/usecases/save_todos.dart';
import 'package:flutter_todo_example/presentation/controllers/todo_controller.dart';
import 'package:flutter_todo_example/presentation/pages/edit_todo_page.dart';
import 'package:flutter_todo_example/presentation/widgets/todo_widget.dart';
import 'package:get/get.dart';

class TodoPage extends StatelessWidget {
  const TodoPage({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<TodoController>(
        init: TodoController(Get.find<GetTodos>(), Get.find<SaveTodos>()),
        builder: (controller) {
          return DefaultTabController(
            length: 2,
            child: Scaffold(
              appBar: AppBar(
                title: const Text('Todo'),
                bottom: const TabBar(
                  tabs: [
                    Tab(text: 'Todo', icon: Icon(Icons.list)),
                    Tab(text: 'Done', icon: Icon(Icons.check)),
                  ],
                ),
                actions: [
                  IconButton(
                    onPressed: () {
                      controller.textEditingController.clear();
                      Get.to(() => const EditTodoPage());
                    },
                    icon: const Icon(Icons.add),
                  ),
                ],
              ),
              body: TabBarView(children: [
                Obx(() {
                  final inProgressTodos =
                      controller.todos.where((t) => !t.isCompleted).toList();
                  return _buildTodoList(inProgressTodos);
                }),
                Obx(() {
                  final completedTodos =
                      controller.todos.where((t) => t.isCompleted).toList();
                  return _buildTodoList(completedTodos);
                })
              ]),
            ),
          );
        });
  }

  Widget _buildTodoList(List<TodoEntity> todos) {
    return ListView.builder(
      itemCount: todos.length,
      itemBuilder: (context, index) {
        final todo = todos[index].obs;
        return TodoWidget(todo: todo, key: Key(todo.value.id));
      },
    );
  }
}
```

todo_controller.dart
todo와 관련된 getx controller를 선언하여, 내부적으로 사용하는 데이터들을 메모리에서 관리한다.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_todo_example/domain/entities/todo_entity.dart';
import 'package:flutter_todo_example/domain/usecases/get_todos.dart';
import 'package:flutter_todo_example/domain/usecases/save_todos.dart';
import 'package:get/get.dart';

class TodoController extends GetxController {
  final GetTodos getTodos;
  final SaveTodos saveTodos;
  final textEditingController = TextEditingController();

  TodoController(this.getTodos, this.saveTodos);

  final todos = <TodoEntity>[].obs;

  @override
  void onInit() {
    super.onInit();
    loadTodos();
  }

  Future<void> loadTodos() async {
    final result = await getTodos();
    todos.value = result;
    update();
  }

  void addTodo(TodoEntity todo) {
    todos.add(todo);
    saveTodos(todos);
    textEditingController.clear();
    update();
  }

  void toggleIsCompleted(TodoEntity todo) {
    final index = todos.indexWhere((element) => element.id == todo.id);
    todos[index] = todo.copyWith(isCompleted: !todo.isCompleted);
    saveTodos(todos);
    update();
  }

  void editTodo(TodoEntity todo) {
    final index = todos.indexWhere((element) => element.id == todo.id);
    todos[index] = todo;
    saveTodos(todos);
    textEditingController.clear();
    update();
  }
}
```

## 후기

앞에서 getx를 사용하니까 뭔가 코딩 실력이 나빠진다는 생각이 들어서 최근 provider를 많이 사용하였는데, 확실히 getx는 서비스를 빠르게 만들기에는 좋다는 생각이 들었다.
물론 그만큼 직관적이고, obx를 활용하여 StatelessWidget들로 쌓아나가는 것이 가능하다는 것이 좋은 부분인 것같다.
또한 클린 아키텍쳐를 이용하면 영역들마다 코드들이 분리되어 있으니, 가독성이 매우 높아졌다는 사실을 알 수 있었다.

## 예제 Github

[예제 레포지토리 링크](https://github.com/halfmoon-mind/flutter_todo_example)
