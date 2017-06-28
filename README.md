## О проекте

SmartOffice как он есть с добавлением graphql в компоненте task

Добавлен graphql сервер на express

Изменения

Небольние изменения в webpack.dev.js - добавлена прокся для grapqh 

App.js: Добавлены обертки для Apollo - криент GraphQL для React и Ant.design - библеотека React UI компонентов.

/client/components/tasks_gql - таблица с сотрировкой и ссылками. Даные получаются от gql-сервера.

Побаловаться с запросами к gql-серверу можно по ссылке [http://localhost:3000/graphql](http://localhost:3000/graphql). или [http://localhost:4000/graphql](http://localhost:4000/graphql). Обязательно тыкнуть в "<Docs" (правый верхний угол)

POST запросы через api не реплизованы, но возможны. В grapqhQL оин называются mutation. Реализуются также как query, только с аргументами + на клиете добавается props - mutate. Доделаю, если будет интересно.

В идеале grapqhQL может сидеть на loopback, но тогда надо будет в resolve функции (см. gql_server) писать запросы к БД через функционал loopback'a, что геморойней, но упростит проект.

## Установка

Аналогична SmartOffice

## Запуск

Для запуска GraphQL сервера, находясь в папке проекта:

```shell
pm2 start gql_server.config.js 
```
или 

```shell
npm run gql
```

Для запуска серверной части, находясь в папке проекта:

```shell
pm2 start server.config.js // development режим
```

Запуск клиенсткой части:

```shell
pm2 start client.config.js // development режим
```

