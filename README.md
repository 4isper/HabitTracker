# HabitTracker

Мобильное приложение на React Native для отслеживания ежедневных привычек: список привычек, отметка выполнения за сегодня, история и базовая статистика. Данные хранятся локально и переживают перезапуск приложения.

## Возможности

- Список привычек: название, иконка (emoji) и статус за текущий день, визуальное разделение выполненных и невыполненных.
- Добавление и редактирование привычки: название обязательно, emoji и цвет опционально, дубликаты названий запрещены.
- Отметка выполнения тапом по чекбоксу, повторный тап снимает отметку, интерфейс обновляется сразу.
- История выполнения и статистика: процент выполнения, серия дней подряд, полоса прогресса.
- Фильтрация по выполненным и невыполненным, тёмная тема по системной настройке.

## Технологии

- **React Native** 0.87.1 (CLI, New Architecture, Hermes)
- **TypeScript** — strict-режим
- **React Navigation 7** — `native-stack`
- **MMKV 4** — локальное хранилище (`react-native-mmkv`)
- **Анимации** — core `Animated` с `useNativeDriver: true`
- **Локализация** — i18next + react-i18next, русский язык
- **Иконки** — `lucide-react-native`

Внешних UI-китов нет: компоненты написаны на стандартных примитивах React Native.

## Запуск

Требования: Node.js ≥ 22.11, для iOS — Xcode и CocoaPods, для Android — JDK и Android SDK (minSdk 24).

```sh
git clone https://github.com/4isper/HabitTracker.git && cd HabitTracker

npm install
pod install --project-directory=ios   # обязательно для iOS

npm start        # Metro, в отдельном терминале
npm run ios      # или npm run android
```

Версии CocoaPods зафиксированы в `Gemfile` / `Gemfile.lock`, если системный `pod` отличается — используйте `bundle install && bundle exec pod install --project-directory=ios`.

Проверки качества:

```sh
npm run lint     # ESLint
npx tsc --noEmit # типы
npm test         # Jest
```

## Структура проекта

```
src/
├── components/   переиспользуемые UI-компоненты
├── screens/      Home, AddHabit, EditHabit, HabitDetails
├── state/        HabitsContext — состояние и бизнес-логика
├── storage/      чтение и запись в MMKV
├── theme/        токены: цвета, отступы, радиусы, типографика, motion
├── utils/        даты и расчёт статистики
├── hooks/        useTodayKey — актуальная дата при открытом приложении
├── constants/    варианты эмодзи и цветов
├── i18n/         словари переводов
├── navigation/   типы параметров навигации
└── types/        TypeScript-типы домена
```

Состояние хранится в `HabitsContext` — экраны не обращаются к хранилищу напрямую, а расчёт статистики вынесен в чистые функции `utils/stats.ts`, покрытые unit-тестами.

## Не реализовано

Дополнительные возможности из ТЗ, не сделанные в этой версии: уведомления-напоминания и календарное представление истории (сейчас список дат).