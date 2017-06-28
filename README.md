## О проекте

SmartOffice система класса ERP/CRM/PM, управления проектами, бюджетами, клиентами.

## Установка

Для установки клонировать проект, далее в папке проекта:

```shell
npm install
```

или

```shell
yarn install
```

Для запуска в качестве сервиса установить pm2:

```shell
npm install -g pm2
```

Чтобы pm2 работал после перезагрузки:

```shell
sudo pm2 startup
```

pm2 автоматически распознает систему init для текущей системы и включит себя в автостарт системы.

## Запуск

Для запуска серверной части, находясь в папке проекта:

```shell
pm2 start server.config.js // development режим
```

или

```shell
pm2 start server.production.config.js // production режим
```

Запуск клиенсткой части:

```shell
pm2 start client.config.js // development режим
```

Клиентская часть запускается тольков development режиме, так как для production формируются статические html/js/css/media.

## Разработка

Вся разработка ведется в ветке development, после окончания работ создавать merge request в ветку master.

Ветка master запущена по адресу: [http://smartoffice.smartunit.pro](http://smartoffice.smartunit.pro).

Ветка development запущена по адресу: [http://dev.smartoffice.smartunit.pro](http://dev.smartoffice.smartunit.pro).

Также можно делать свой fork (рекомендуется) и делать pull request в основной проект.
