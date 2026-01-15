# テストケース入出力仕様書

## 概要

課題実行システムにおけるテストケースの入出力形式を定義する。
競技プログラミング（AtCoder、Paiza 等）と同様の標準入出力（stdin/stdout）方式を採用。

## 入出力方式

### 基本仕様

| 項目   | 方式                                        |
| ------ | ------------------------------------------- |
| 入力   | 標準入力（stdin）                           |
| 出力   | 標準出力（stdout）                          |
| エラー | 標準エラー出力（stderr）※判定には使用しない |

### 実行イメージ

```bash
echo "入力データ" | ./実行ファイル
# 出力が期待値と一致するか比較
```

## テストケース JSON 形式

### スキーマ

```json
[
  {
    "input": "標準入力として渡す文字列",
    "expected": "期待される標準出力",
    "visible": true
  }
]
```

| フィールド | 型      | 必須 | 説明                         |
| ---------- | ------- | ---- | ---------------------------- |
| input      | string  | ✓    | stdin に渡す入力データ       |
| expected   | string  | ✓    | 期待される stdout 出力       |
| visible    | boolean | ✓    | ユーザーに入出力を公開するか |

### 改行の扱い

- 入力の末尾には改行（`\n`）を含める
- 出力の期待値も末尾に改行を含める
- JSON では `\\n` とエスケープする

## 入力パターン例

### パターン 1: 単一の値

**問題**: 整数を入力し、2 倍にして出力

```json
{
  "input": "5\n",
  "expected": "10\n",
  "visible": true
}
```

**C 言語での読み取り**:

```c
int n;
scanf("%d", &n);
printf("%d\n", n * 2);
```

### パターン 2: 複数の値（スペース区切り）

**問題**: 2 つの整数を入力し、合計を出力

```json
{
  "input": "3 5\n",
  "expected": "8\n",
  "visible": true
}
```

**C 言語での読み取り**:

```c
int a, b;
scanf("%d %d", &a, &b);
printf("%d\n", a + b);
```

### パターン 3: 配列（長さ + 要素）

**問題**: N 個の整数を入力し、合計を出力

**入力形式**:

```
N
a1 a2 a3 ... aN
```

```json
{
  "input": "5\n1 2 3 4 5\n",
  "expected": "15\n",
  "visible": true
}
```

**C 言語での読み取り**:

```c
int n;
scanf("%d", &n);

int sum = 0;
for (int i = 0; i < n; i++) {
    int x;
    scanf("%d", &x);
    sum += x;
}
printf("%d\n", sum);
```

### パターン 4: 複数行入力

**問題**: N 行の文字列を入力し、行数を出力

**入力形式**:

```
N
文字列1
文字列2
...
文字列N
```

```json
{
  "input": "3\nhello\nworld\ntest\n",
  "expected": "3\n",
  "visible": true
}
```

**C 言語での読み取り**:

```c
int n;
scanf("%d", &n);

char buf[256];
for (int i = 0; i < n; i++) {
    scanf("%s", buf);
}
printf("%d\n", n);
```

### パターン 5: 2 次元配列（行列）

**問題**: N×M の行列を入力し、全要素の合計を出力

**入力形式**:

```
N M
a11 a12 ... a1M
a21 a22 ... a2M
...
aN1 aN2 ... aNM
```

```json
{
  "input": "2 3\n1 2 3\n4 5 6\n",
  "expected": "21\n",
  "visible": true
}
```

**C 言語での読み取り**:

```c
int n, m;
scanf("%d %d", &n, &m);

int sum = 0;
for (int i = 0; i < n; i++) {
    for (int j = 0; j < m; j++) {
        int x;
        scanf("%d", &x);
        sum += x;
    }
}
printf("%d\n", sum);
```

### パターン 6: 入力なし

**問題**: "Hello, World!" と出力

```json
{
  "input": "",
  "expected": "Hello, World!\n",
  "visible": true
}
```

**C 言語**:

```c
printf("Hello, World!\n");
```

### パターン 7: 複数行出力

**問題**: 1 から N までの数を 1 行ずつ出力

```json
{
  "input": "3\n",
  "expected": "1\n2\n3\n",
  "visible": true
}
```

## 管理者向け：テストケース作成ガイド

### フロントエンドでの入力方法

管理者画面でテストケースを作成する際：

**入力欄（テキストエリア）**:

```
5
1 2 3 4 5
```

**期待出力欄（テキストエリア）**:

```
15
```

※ フロントエンドで末尾に改行を自動付与するか、明示的に入力してもらう

### JSON 変換例

上記の入力を JSON に変換：

```json
{
  "input": "5\n1 2 3 4 5\n",
  "expected": "15\n",
  "visible": true
}
```

### 複数テストケースの例

```json
[
  {
    "input": "3\n1 2 3\n",
    "expected": "6\n",
    "visible": true
  },
  {
    "input": "5\n10 20 30 40 50\n",
    "expected": "150\n",
    "visible": true
  },
  {
    "input": "1\n100\n",
    "expected": "100\n",
    "visible": false
  }
]
```

## 可視性（visible）の使い分け

| visible | 用途                                 |
| ------- | ------------------------------------ |
| true    | サンプルケース。問題文に例として表示 |
| false   | 隠しケース。採点用。入出力は非公開   |

### 推奨構成

- `visible: true` を 1〜3 件（ユーザーが動作確認できる）
- `visible: false` を複数件（エッジケース、大きな入力など）

## 出力の比較方法

### 完全一致

現在の実装では、出力と期待値の**完全一致**で判定。

- 末尾の改行も含めて一致が必要
- 余分な空白があると不正解

### 将来の拡張（検討中）

- 末尾空白・改行の無視オプション
- 浮動小数点の誤差許容
- スペシャルジャッジ（カスタム比較関数）

## エラーケース

### コンパイルエラー（CE）

コードがコンパイルできない場合。テストケースは実行されない。

### 実行時エラー（RE）

- セグメンテーションフォルト
- ゼロ除算
- 配列の範囲外アクセス

### タイムアウト（TLE）

制限時間内に実行が完了しない場合。

### メモリ超過（MLE）

メモリ制限を超えた場合。

## API での使用例

### テストケース付きセクション作成

```bash
curl -X POST "/api/assignments/1/sections" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sectionId": 1,
    "title": "配列の合計",
    "description": "N個の整数を入力し、合計を出力してください。",
    "hasAssignment": true,
    "testCases": "[{\"input\":\"5\\n1 2 3 4 5\\n\",\"expected\":\"15\\n\",\"visible\":true},{\"input\":\"3\\n10 20 30\\n\",\"expected\":\"60\\n\",\"visible\":false}]",
    "timeLimit": 2000,
    "memoryLimit": 256
  }'
```

### コード提出

```bash
curl -X POST "/api/assignments/1/sections/1/submissions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "#include <stdio.h>\nint main() { int n, sum = 0; scanf(\"%d\", &n); for (int i = 0; i < n; i++) { int x; scanf(\"%d\", &x); sum += x; } printf(\"%d\\n\", sum); return 0; }",
    "language": "C"
  }'
```

## 参考

- [AtCoder 入力形式](https://atcoder.jp/contests/abc001/tasks/abc001_1)
- [Paiza スキルチェック](https://paiza.jp/challenges)
- [AOJ (Aizu Online Judge)](https://onlinejudge.u-aizu.ac.jp/)
