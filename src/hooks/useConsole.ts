/**
 * useConsole Hook
 * コンソール出力とコード実行を管理
 */
import { useState, useCallback } from 'react';
import type { ConsoleMessage } from '@/components/features/TerminalPanel/TerminalPanel';

interface UseConsoleOptions {
  maxMessages?: number;
}

interface UseConsoleReturn {
  messages: ConsoleMessage[];
  isRunning: boolean;
  runCode: (code: string, language: string) => Promise<void>;
  clearConsole: () => void;
  addMessage: (type: ConsoleMessage['type'], content: string) => void;
}

/**
 * コンソールをキャプチャしてメッセージを収集
 */
const captureConsole = (
  onMessage: (type: ConsoleMessage['type'], content: string) => void
): (() => void) => {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  const formatArgs = (args: unknown[]): string => {
    return args
      .map((arg) => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');
  };

  console.log = (...args) => {
    originalConsole.log(...args);
    onMessage('log', formatArgs(args));
  };

  console.error = (...args) => {
    originalConsole.error(...args);
    onMessage('error', formatArgs(args));
  };

  console.warn = (...args) => {
    originalConsole.warn(...args);
    onMessage('warn', formatArgs(args));
  };

  console.info = (...args) => {
    originalConsole.info(...args);
    onMessage('info', formatArgs(args));
  };

  // 復元関数を返す
  return () => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  };
};

export const useConsole = ({
  maxMessages = 100,
}: UseConsoleOptions = {}): UseConsoleReturn => {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addMessage = useCallback(
    (type: ConsoleMessage['type'], content: string) => {
      setMessages((prev) => {
        const newMessages = [
          ...prev,
          { type, content, timestamp: new Date() },
        ];
        // 最大メッセージ数を超えたら古いものを削除
        if (newMessages.length > maxMessages) {
          return newMessages.slice(-maxMessages);
        }
        return newMessages;
      });
    },
    [maxMessages]
  );

  const clearConsole = useCallback(() => {
    setMessages([]);
  }, []);

  const runCode = useCallback(
    async (code: string, language: string) => {
      setIsRunning(true);

      try {
        if (language === 'javascript' || language === 'typescript') {
          // JavaScript/TypeScriptの実行
          await runJavaScript(code, addMessage);
        } else if (language === 'python') {
          // Pythonの実行（Pyodide使用）
          await runPythonCode(code, addMessage);
        } else {
          addMessage('warn', `${language}の実行はサポートされていません`);
        }
      } catch (error) {
        addMessage(
          'error',
          error instanceof Error ? error.message : String(error)
        );
      } finally {
        setIsRunning(false);
      }
    },
    [addMessage]
  );

  return {
    messages,
    isRunning,
    runCode,
    clearConsole,
    addMessage,
  };
};

/**
 * JavaScriptコードを実行
 */
const runJavaScript = async (
  code: string,
  addMessage: (type: ConsoleMessage['type'], content: string) => void
): Promise<void> => {
  // コンソールをキャプチャ
  const restoreConsole = captureConsole(addMessage);

  try {
    // Web Workerでの実行を試みる（サンドボックス化）
    // 現在はメインスレッドで実行（簡易版）
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const fn = new AsyncFunction(code);
    const result = await fn();

    // 戻り値があれば表示
    if (result !== undefined) {
      addMessage('result', String(result));
    }
  } catch (error) {
    addMessage(
      'error',
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error)
    );
  } finally {
    restoreConsole();
  }
};

/**
 * Pythonコードを実行（Pyodide使用）
 */
const runPythonCode = async (
  code: string,
  addMessage: (type: ConsoleMessage['type'], content: string) => void
): Promise<void> => {
  try {
    addMessage('info', '🐍 Pyodideを読み込み中...');

    // Pyodideを動的にロード
    const { runPython, isPyodideReady } = await import('@/runtime/pythonRuntime');

    if (!isPyodideReady()) {
      addMessage('info', '初回読み込みには数秒かかります...');
    }

    const result = await runPython(code);

    // stdout出力
    result.stdout.forEach((line) => {
      addMessage('log', line);
    });

    // stderr出力
    result.stderr.forEach((line) => {
      addMessage('error', line);
    });

    // 戻り値があれば表示
    if (result.result !== null) {
      addMessage('result', result.result);
    }

    addMessage('info', `✅ 実行完了 (${result.duration.toFixed(0)}ms)`);
  } catch (error) {
    addMessage(
      'error',
      error instanceof Error ? error.message : String(error)
    );
  }
};

