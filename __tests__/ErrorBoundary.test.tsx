/**
 * @format
 */

import { Text } from 'react-native';
import { act, create } from 'react-test-renderer';

import * as ReactNativeMMKV from 'react-native-mmkv';

import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { Touchable } from '../src/components/Touchable';

import type { ReactTestRenderer } from 'react-test-renderer';

jest.mock('react-native-mmkv', () => {
  const data = new Map<string, unknown>();

  return {
    __data: data,
    createMMKV: () => ({
      getString: (key: string) => {
        const value = data.get(key);

        return typeof value === 'string' ? value : undefined;
      },
      getNumber: (key: string) => {
        const value = data.get(key);

        return typeof value === 'number' ? value : undefined;
      },
      set: (key: string, value: unknown) => {
        data.set(key, value);
      },
      remove: (key: string) => data.delete(key),
    }),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const store = (
  ReactNativeMMKV as unknown as { __data: Map<string, unknown> }
).__data;

const HABITS_KEY = 'habits';
const BACKUP_KEY = 'habits.rawBackup';

let shouldThrow = true;

function Flaky() {
  if (shouldThrow) {
    throw new Error('render failure');
  }

  return <Text>recovered</Text>;
}

function renderBoundary(): ReactTestRenderer {
  let tree: ReactTestRenderer | undefined;

  act(() => {
    tree = create(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );
  });

  return tree as ReactTestRenderer;
}

function press(tree: ReactTestRenderer, index: number): void {
  const buttons = tree.root.findAllByType(Touchable);

  act(() => {
    buttons[index].props.onPress();
  });
}

beforeEach(() => {
  store.clear();
  shouldThrow = true;
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ErrorBoundary', () => {
  it('renders children while nothing throws', () => {
    shouldThrow = false;

    expect(renderBoundary().root.findAllByType(Text)).toHaveLength(1);
  });

  it('replaces the tree with the fallback when a render throws', () => {
    const tree = renderBoundary();

    expect(tree.root.findAllByType(Flaky)).toHaveLength(0);
    expect(tree.root.findAllByType(Touchable)).toHaveLength(2);
  });

  it('re-renders children after a retry once the cause is gone', () => {
    const tree = renderBoundary();

    shouldThrow = false;
    press(tree, 0);

    expect(tree.root.findAllByType(Flaky)).toHaveLength(1);
  });

  it('still shows the fallback when the cause persists across retries', () => {
    const tree = renderBoundary();

    press(tree, 0);

    expect(tree.root.findAllByType(Touchable)).toHaveLength(2);
  });

  it('clears stored data when recovery via reset is used', () => {
    store.set(HABITS_KEY, '{ broken');
    store.set(BACKUP_KEY, '{ broken');

    const tree = renderBoundary();

    shouldThrow = false;
    press(tree, 1);

    expect(store.get(HABITS_KEY)).toBeUndefined();
    expect(store.get(BACKUP_KEY)).toBeUndefined();
    expect(tree.root.findAllByType(Flaky)).toHaveLength(1);
  });
});