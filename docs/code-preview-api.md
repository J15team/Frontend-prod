# コードプレビュー API

## 概要

コードを実行して結果を即座に確認できるエンドポイント。テストケースの正誤判定は行わず、単純にコードを実行して出力を返す。

## エンドポイント

### POST /api/code/preview

**認証必須**

#### リクエスト

```json
{
  "code": "#include <stdio.h>\nint main() { printf(\"Hello\\n\"); return 0; }",
  "language": "c",
  "input": "",
  "timeLimit": 2000
}
```

| フィールド | 型     | 必須 | 説明                                     |
| ---------- | ------ | ---- | ---------------------------------------- |
| code       | string | ✓    | 実行するソースコード                     |
| language   | string | ✓    | プログラミング言語 (現在は "c" のみ対応) |
| input      | string |      | 標準入力として渡すデータ                 |
| timeLimit  | number |      | 実行時間制限 (ミリ秒)。デフォルト 2000ms |

#### レスポンス

```json
{
  "output": "Hello\n",
  "executionTime": 15,
  "status": "SUCCESS",
  "errorMessage": null
}
```

| フィールド    | 型     | 説明                            |
| ------------- | ------ | ------------------------------- |
| output        | string | プログラムの標準出力            |
| executionTime | number | 実行時間 (ミリ秒)               |
| status        | string | 実行結果のステータス            |
| errorMessage  | string | エラーメッセージ (エラー時のみ) |

#### ステータス値

| ステータス    | 説明                                            |
| ------------- | ----------------------------------------------- |
| SUCCESS       | コードが正常にコンパイル・実行された            |
| COMPILE_ERROR | コンパイルエラーが発生した                      |
| RUNTIME_ERROR | 実行時エラーが発生した (セグフォ、ゼロ除算など) |
| TIMEOUT       | 実行時間制限を超過した                          |
| ERROR         | その他のエラー                                  |

## TypeScript 使用例

```typescript
interface CodePreviewRequest {
  code: string;
  language: string;
  input?: string;
  timeLimit?: number;
}

interface CodePreviewResponse {
  output: string | null;
  executionTime: number | null;
  status: "SUCCESS" | "COMPILE_ERROR" | "RUNTIME_ERROR" | "TIMEOUT" | "ERROR";
  errorMessage: string | null;
}

async function previewCode(
  token: string,
  request: CodePreviewRequest
): Promise<CodePreviewResponse> {
  const response = await fetch(
    "https://zu9mkxoir4.execute-api.ap-northeast-1.amazonaws.com/api/code/preview",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    }
  );

  return response.json();
}

// 使用例
const result = await previewCode(token, {
  code: '#include <stdio.h>\nint main() { int a, b; scanf("%d %d", &a, &b); printf("%d\\n", a + b); return 0; }',
  language: "c",
  input: "5 3\n",
});

console.log(result);
// {
//   output: "8\n",
//   executionTime: 15,
//   status: "SUCCESS",
//   errorMessage: null
// }
```

## React Hook 例

```typescript
import { useState } from "react";

interface PreviewState {
  output: string | null;
  status: string | null;
  error: string | null;
  isLoading: boolean;
}

export function useCodePreview(token: string) {
  const [state, setState] = useState<PreviewState>({
    output: null,
    status: null,
    error: null,
    isLoading: false,
  });

  const preview = async (code: string, language: string, input: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/code/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, language, input }),
      });

      const data = await response.json();

      setState({
        output: data.output,
        status: data.status,
        error: data.errorMessage,
        isLoading: false,
      });
    } catch (e) {
      setState({
        output: null,
        status: "ERROR",
        error: "通信エラーが発生しました",
        isLoading: false,
      });
    }
  };

  return { ...state, preview };
}
```

## エラーケース

### コンパイルエラー

```json
{
  "output": "",
  "executionTime": 0,
  "status": "COMPILE_ERROR",
  "errorMessage": "main.c:1:23: error: expected ';' before '}' token..."
}
```

### タイムアウト

```json
{
  "output": "",
  "executionTime": 2000,
  "status": "TIMEOUT",
  "errorMessage": null
}
```

### 実行時エラー

```json
{
  "output": "",
  "executionTime": 10,
  "status": "RUNTIME_ERROR",
  "errorMessage": "Segmentation fault"
}
```

## 制限事項

| 項目         | デフォルト値 | 最大値     |
| ------------ | ------------ | ---------- |
| 実行時間制限 | 2000ms       | 10000ms    |
| メモリ制限   | 256MB        | 512MB      |
| 対応言語     | -            | C 言語のみ |
