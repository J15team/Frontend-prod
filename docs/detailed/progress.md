# 進捗管理 API 詳細

ユーザーの学習進捗を管理します。各ユーザーが題材ごとに完了したセクションを記録・取得できます。

## 進捗状態取得

認証済みユーザーの特定題材における進捗状態を取得します。

**エンドポイント**

```http
GET /api/progress/subjects/{subjectId}
```

**認証**: 必須（JWTトークン）

**リクエストヘッダー**

```
Authorization: Bearer {accessToken}
```

**パスパラメータ**

| パラメータ | 型   | 説明    |
| ---------- | ---- | ------- |
| subjectId  | long | 題材 ID |

**レスポンス**

**成功時 (200 OK)**

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "subjectId": 1,
  "progressPercentage": 15,
  "clearedCount": 16,
  "remainingCount": 85,
  "totalSections": 101,
  "isAllCleared": false,
  "nextSectionId": 16,
  "clearedSections": [
    {
      "sectionId": 0,
      "completedAt": "2025-12-06T10:00:00Z"
    },
    {
      "sectionId": 1,
      "completedAt": "2025-12-06T11:00:00Z"
    }
  ]
}
```

| フィールド         | 型          | 説明                                           |
| ------------------ | ----------- | ---------------------------------------------- |
| userId             | string      | ユーザー ID（UUID 形式）                       |
| subjectId          | long        | 題材 ID                                        |
| progressPercentage | int         | 進捗率（0~100%）小数点以下切り捨て             |
| clearedCount       | int         | 完了済みセクション数                           |
| remainingCount     | int         | 未完了セクション数                             |
| totalSections      | int         | 題材の総セクション数（maxSections）            |
| isAllCleared       | boolean     | 全セクション完了しているか                     |
| nextSectionId      | int or null | 次に完了すべきセクション ID（全完了時は null） |
| clearedSections    | array       | 完了済みセクションの詳細リスト                 |

**エラー**

- **401 Unauthorized**: 認証トークンが無効または期限切れ
- **404 Not Found**: 題材が存在しない

---

## セクション完了記録

認証済みユーザーがセクションを完了したことを記録します。

**エンドポイント**

```http
POST /api/progress/subjects/{subjectId}/sections
```

**認証**: 必須（JWTトークン）

**パスパラメータ**

| パラメータ | 型   | 説明    |
| ---------- | ---- | ------- |
| subjectId  | long | 題材 ID |

**リクエストヘッダー**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**リクエストボディ**

```json
{
  "sectionId": 5
}
```

| フィールド | 型  | 必須 | 説明          | バリデーション |
| ---------- | --- | ---- | ------------- | -------------- |
| sectionId  | int | ○    | セクション ID | 0~100          |

**レスポンス**

**成功時 (201 Created)**

```json
{
  "message": "セクション 5 を完了としてマークしました",
  "sectionId": 5,
  "completedAt": "2025-12-06T12:30:00Z"
}
```

**エラー**

- **400 Bad Request**: セクション ID が不正、または既に完了済み
  ```json
  {
    "error": "セクション 5 は既に完了しています"
  }
  ```
- **401 Unauthorized**: 認証トークンが無効または期限切れ
- **404 Not Found**: 題材が存在しない

---

## セクション完了状態チェック

認証済みユーザーの特定セクションが完了済みかチェックします。

**エンドポイント**

```http
GET /api/progress/subjects/{subjectId}/sections/{sectionId}
```

**認証**: 必須（JWTトークン）

**リクエストヘッダー**

```
Authorization: Bearer {accessToken}
```

**パスパラメータ**

| パラメータ | 型   | 説明                   |
| ---------- | ---- | ---------------------- |
| subjectId  | long | 題材 ID                |
| sectionId  | int  | セクション ID（0~100） |

**レスポンス**

**成功時 (200 OK)**

```json
{
  "isCleared": true
}
```

| フィールド | 型      | 説明                          |
| ---------- | ------- | ----------------------------- |
| isCleared  | boolean | true: 完了済み、false: 未完了 |

**エラー**

- **401 Unauthorized**: 認証トークンが無効または期限切れ

---

## セクション完了削除

認証済みユーザーのセクション完了記録を削除します。

**エンドポイント**

```http
DELETE /api/progress/subjects/{subjectId}/sections/{sectionId}
```

**認証**: 必須（JWTトークン）

**リクエストヘッダー**

```
Authorization: Bearer {accessToken}
```

**パスパラメータ**

| パラメータ | 型   | 説明                   |
| ---------- | ---- | ---------------------- |
| subjectId  | long | 題材 ID                |
| sectionId  | int  | セクション ID（0~100） |

**レスポンス**

**成功時 (200 OK)**

```json
{
  "message": "セクション 5 の完了記録を削除しました"
}
```

**エラー**

- **400 Bad Request**: 削除に失敗
  ```json
  {
    "error": "削除に失敗しました"
  }
  ```
- **401 Unauthorized**: 認証トークンが無効または期限切れ

---

## フロントエンド実装例

### 進捗状態の取得と表示

```typescript
// 進捗バーの表示（認証トークンを含める）
const fetchProgress = async (subjectId: number) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`/api/progress/subjects/${subjectId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};

// 表示
const progress = await fetchProgress(subjectId);
<ProgressBar value={progress.progressPercentage} />
<Text>{progress.clearedCount} / {progress.totalSections} セクション完了</Text>

// 次のセクションを提案
if (progress.nextSectionId !== null) {
  <Button>次のセクション（{progress.nextSectionId}）を開始</Button>
}
```

### セクション完了の切り替え

```typescript
// セクション完了時に呼び出す（認証トークンを含める）
async function markSectionComplete(subjectId: number, sectionId: number) {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `/api/progress/subjects/${subjectId}/sections`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sectionId }),
    }
  );

  if (response.status === 201) {
    // 成功: 進捗バーを更新
    refreshProgress();
  } else if (response.status === 400) {
    // 既に完了済み
    const error = await response.json();
    alert(error.error);
  }
}

// 完了状態を解除
async function unmarkSectionComplete(subjectId: number, sectionId: number) {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(
    `/api/progress/subjects/${subjectId}/sections/${sectionId}`,
    {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
  );

  if (response.ok) {
    refreshProgress();
  }
}
```

### セクション一覧と進捗の表示

```typescript
const fetchSectionsWithProgress = async (subjectId: number) => {
  const token = localStorage.getItem('accessToken');
  
  // セクション一覧を取得
  const sectionsRes = await fetch(`/api/subjects/${subjectId}/sections`);
  const sections = await sectionsRes.json();

  // 進捗を取得
  const progressRes = await fetch(`/api/progress/subjects/${subjectId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const progress = await progressRes.json();

  // セクションに完了状態をマージ
  const sectionsWithStatus = sections.map(section => ({
    ...section,
    isCleared: progress.clearedSections.some(
      cs => cs.sectionId === section.sectionId
    )
  }));

  return { sections: sectionsWithStatus, progress };
};

// 表示
const { sections, progress } = await fetchSectionsWithProgress(subjectId);
<ProgressBar value={progress.progressPercentage} />
<Text>{progress.clearedCount} / {progress.totalSections} 完了</Text>

{sections.map(section => (
  <SectionItem key={section.sectionId}>
    <Text>{section.title}</Text>
    {section.isCleared && <CheckIcon />}
    <Button onClick={() => toggleComplete(section.sectionId, section.isCleared)}>
      {section.isCleared ? '未完了にする' : '完了にする'}
    </Button>
  </SectionItem>
))}
```

