# Progress ドメインリファクタリング計画

**作成日**: 2025-12-18
**ブランチ**: `feature/refactor-progress-domain-responsibility`
**目的**: Progress ドメインの責務過多とover-fetching問題の解決

---

## 1. 現状の問題点

### 1.1 Over-fetching 問題（API層）

**問題:**
`GET /api/progress/subjects/{subjectId}` が常に全てのデータを返却する。

**レスポンス構造:**
```json
{
  "userId": "uuid",
  "subjectId": 1,
  "progressPercentage": 75,
  "clearedCount": 15,
  "remainingCount": 5,
  "totalSections": 20,
  "isAllCleared": false,
  "nextSectionId": 16,
  "clearedSections": [
    {"sectionId": 1, "completedAt": "2025-12-01T10:00:00Z"},
    {"sectionId": 2, "completedAt": "2025-12-01T11:00:00Z"},
    // ... 全ての完了セクション
  ]
}
```

**影響:**
- フロントエンドが「進捗率のみ」必要な場合でも `clearedSections` 配列が毎回送信される
- セクション数が増えると（100個など）データ転送量が増大
- フロントエンドで不要なデータをフィルタリングする必要がある

**該当ファイル:**
- `presentation/dto/response/UserProgressResponse.kt:7-41`
- `presentation/controller/progress/ProgressQueryController.kt:17-30`

### 1.2 ドメインモデルの責務過多

**問題:**
`UserProgress` ドメインモデルに7つのメソッドが存在し、複数の関心事が混在している。

**UserProgress.kt の責務:**
```kotlin
data class UserProgress(
    val userId: UserId,
    val subjectId: SubjectId,
    val clearedSections: List<UserClearedSection>,
    val totalSections: Int
) {
    // 1. 計算ロジック
    fun calculateProgressPercentage(): Int
    fun getClearedCount(): Int
    fun getRemainingCount(): Int

    // 2. 判定ロジック
    fun isSectionCleared(sectionId: SectionId): Boolean
    fun isAllCleared(): Boolean

    // 3. 操作ロジック
    fun markSectionAsCleared(sectionId: SectionId): UserClearedSection

    // 4. 提案ロジック
    fun suggestNextSection(): SectionId?
    fun getClearedSectionIds(): List<SectionId>
}
```

**問題点:**
- **Single Responsibility Principle 違反**: 複数の関心事（計算・判定・操作・提案）が1つのクラスに集中
- **拡張性の低下**: 新しい要件（例：最近7日間の進捗）を追加するたびにクラスが肥大化
- **テストの複雑化**: 7つのメソッドそれぞれのテストが必要
- **再利用性の低下**: 計算ロジックを別の場所で使いたくても UserProgress に依存

**該当ファイル:**
- `domain/model/progress/UserProgress.kt:1-119`

### 1.3 フロントエンドへの影響

**現状の実装:**

`ProgressInspectorView.tsx:92-122` では全てのデータを表示しているが、他の画面では以下のような使い方をしている可能性：

```typescript
// 進捗バーコンポーネント（進捗率のみ必要）
const ProgressBar = ({ subjectId }) => {
  const progress = await getProgress(subjectId);
  // clearedSections は不要だが取得される
  return <div>{progress.progressPercentage}%</div>;
};

// セクション一覧画面（完了状態チェックのみ必要）
const SectionList = ({ subjectId, sections }) => {
  const progress = await getProgress(subjectId);
  const clearedIds = progress.clearedSections.map(s => s.sectionId);
  // progressPercentage, remainingCount などは不要だが取得される
  return sections.map(section => (
    <Section isCleared={clearedIds.includes(section.id)} />
  ));
};
```

**問題:**
- 画面ごとに必要なデータが異なるが、常に全データを取得
- フロントエンドで不要なデータを無視する実装が必要
- ネットワークトラフィックの無駄

---

## 2. リファクタリング提案

### 2.1 Option 1: エンドポイント分割（API層の改善）

**概要:**
単一のエンドポイントを用途別に分割し、必要なデータのみを返却する。

**提案するエンドポイント:**

#### 2.1.1 進捗サマリー取得
```
GET /api/progress/subjects/{subjectId}/summary
```

**レスポンス:**
```json
{
  "progressPercentage": 75,
  "clearedCount": 15,
  "remainingCount": 5,
  "totalSections": 20
}
```

**用途:**
- 進捗バーの表示
- ダッシュボードのサマリー表示

#### 2.1.2 完了セクション一覧取得
```
GET /api/progress/subjects/{subjectId}/cleared-sections
```

**レスポンス:**
```json
{
  "clearedSections": [
    {"sectionId": 1, "completedAt": "2025-12-01T10:00:00Z"},
    {"sectionId": 2, "completedAt": "2025-12-01T11:00:00Z"}
  ]
}
```

**用途:**
- 完了履歴画面
- セクション一覧での完了状態表示

#### 2.1.3 次のセクション提案
```
GET /api/progress/subjects/{subjectId}/next-section
```

**レスポンス:**
```json
{
  "nextSectionId": 16,
  "isAllCleared": false
}
```

**用途:**
- 「次へ進む」ボタン
- 学習フロー誘導

#### 2.1.4 既存エンドポイントの扱い

**Option A: 廃止予定とする**
```
GET /api/progress/subjects/{subjectId}  // @Deprecated
```
- 後方互換性のため残す
- ドキュメントに「非推奨」と明記
- 将来のバージョンで削除

**Option B: 詳細情報として残す**
```
GET /api/progress/subjects/{subjectId}/detail
```
- 全情報が必要な画面（インスペクター、管理画面など）で使用
- 名前を変更して用途を明確化

**推奨: Option B**（用途が明確になり、混乱が少ない）

**メリット:**
- over-fetching 問題の即座の解決
- フロントエンドが必要なデータのみリクエスト可能
- ネットワークトラフィック削減
- 実装コスト低（1-2時間）

**デメリット:**
- エンドポイント数の増加（3個 → 5個）
- フロントエンドで複数リクエストが必要な画面がある場合の対応が必要
- ドメインモデルの問題は未解決

**影響範囲:**
- Presentation層: Controller 1ファイル追加、DTO 3ファイル追加
- Application層: UseCase の修正（既存メソッド活用）
- フロントエンド: API呼び出しの変更（画面ごとに対応）

---

### 2.2 Option 2: ドメイン責務分離（ドメイン層の改善）

**概要:**
`UserProgress` を軽量なデータモデルに戻し、計算・判定・提案ロジックをドメインサービスに分離する。

#### 2.2.1 リファクタリング後の構造

**A. データモデル（軽量化）**

```kotlin
// domain/model/progress/UserProgress.kt
/**
 * ユーザーの進捗状態を表現する値オブジェクト
 *
 * 責務: 進捗状態のスナップショットを保持するのみ
 */
data class UserProgress(
    val userId: UserId,
    val subjectId: SubjectId,
    val clearedSections: List<UserClearedSection>,
    val totalSections: Int
) {
    init {
        require(totalSections > 0) { "最大セクション数は1以上である必要があります" }
    }
}
```

**B. ドメインサービス（計算ロジック）**

```kotlin
// domain/service/ProgressCalculator.kt
/**
 * 進捗率計算サービス
 *
 * 責務: UserProgress から統計値を計算する
 */
interface ProgressCalculator {
    fun calculatePercentage(progress: UserProgress): Int
    fun getClearedCount(progress: UserProgress): Int
    fun getRemainingCount(progress: UserProgress): Int
    fun isAllCleared(progress: UserProgress): Boolean
}

// infrastructure/service/ProgressCalculatorImpl.kt
@Service
class ProgressCalculatorImpl : ProgressCalculator {
    override fun calculatePercentage(progress: UserProgress): Int {
        if (progress.totalSections == 0) return 0
        val clearedCount = progress.clearedSections.size
        if (clearedCount >= progress.totalSections) return 100
        return (clearedCount * 100) / progress.totalSections
    }

    override fun getClearedCount(progress: UserProgress): Int =
        progress.clearedSections.size

    override fun getRemainingCount(progress: UserProgress): Int =
        progress.totalSections - progress.clearedSections.size

    override fun isAllCleared(progress: UserProgress): Boolean =
        progress.clearedSections.size >= progress.totalSections
}
```

**C. ドメインサービス（提案ロジック）**

```kotlin
// domain/service/NextSectionSuggester.kt
/**
 * 次セクション提案サービス
 *
 * 責務: 学習者に次に取り組むべきセクションを提案する
 */
interface NextSectionSuggester {
    fun suggest(progress: UserProgress): SectionId?
}

// infrastructure/service/NextSectionSuggesterImpl.kt
@Service
class NextSectionSuggesterImpl : NextSectionSuggester {
    override fun suggest(progress: UserProgress): SectionId? {
        val clearedIds = progress.clearedSections
            .map { it.sectionId.value }
            .toSet()

        for (id in Section.MIN_SECTION_ID..Section.MAX_SECTION_ID) {
            if (!clearedIds.contains(id)) {
                return SectionId(id)
            }
        }
        return null // 全て完了
    }
}
```

**D. ドメインサービス（判定ロジック）**

```kotlin
// domain/service/SectionCompletionChecker.kt
/**
 * セクション完了状態判定サービス
 *
 * 責務: 特定セクションの完了状態をチェックする
 */
interface SectionCompletionChecker {
    fun isCleared(progress: UserProgress, sectionId: SectionId): Boolean
    fun getClearedSectionIds(progress: UserProgress): List<SectionId>
}

// infrastructure/service/SectionCompletionCheckerImpl.kt
@Service
class SectionCompletionCheckerImpl : SectionCompletionChecker {
    override fun isCleared(progress: UserProgress, sectionId: SectionId): Boolean {
        return progress.clearedSections.any { it.sectionId == sectionId }
    }

    override fun getClearedSectionIds(progress: UserProgress): List<SectionId> {
        return progress.clearedSections.map { it.sectionId }
    }
}
```

#### 2.2.2 UseCase の変更

```kotlin
// application/usecase/progress/ProgressUseCase.kt
@Service
@Transactional
class ProgressUseCase(
    private val clearedSectionRepository: UserClearedSectionRepository,
    private val sectionRepository: SectionRepository,
    private val subjectRepository: SubjectRepository,
    // ドメインサービスを注入
    private val progressCalculator: ProgressCalculator,
    private val nextSectionSuggester: NextSectionSuggester,
    private val completionChecker: SectionCompletionChecker
) {

    fun getUserProgress(userId: UserId, subjectId: SubjectId): UserProgress {
        subjectRepository.findById(subjectId)
            ?: throw IllegalArgumentException("題材が見つかりません")

        val clearedSections = clearedSectionRepository.findByUserIdAndSubjectId(userId, subjectId)
        val totalSections = sectionRepository.countBySubjectId(subjectId)

        return UserProgress(userId, subjectId, clearedSections, totalSections)
    }

    fun markSectionAsCleared(userId: UserId, subjectId: SubjectId, sectionId: SectionId): UserClearedSection {
        val progress = getUserProgress(userId, subjectId)

        // ドメインサービスで判定
        require(!completionChecker.isCleared(progress, sectionId)) {
            "セクション ${sectionId.value} は既に完了しています"
        }

        val cleared = UserClearedSection(
            userClearedSectionId = null,
            userId = userId,
            subjectId = subjectId,
            sectionId = sectionId,
            completedAt = Instant.now()
        )

        return clearedSectionRepository.save(cleared)
    }
}
```

#### 2.2.3 メリット・デメリット

**メリット:**
- **単一責任の原則を遵守**: 各クラスの責務が明確
- **拡張性の向上**: 新しい計算ロジックを追加しやすい（例：最近7日間の進捗計算サービス）
- **テスト容易性**: 各ドメインサービスを独立してテスト可能
- **再利用性**: ロジックを他のUseCaseでも再利用可能
- **長期的な保守性**: 将来のマイクロサービス化時に良好な境界となる

**デメリット:**
- **実装コスト**: 4-6時間（クラス分割、テスト修正）
- **クラス数の増加**: 3ファイル増加（インターフェース + 実装）
- **複雑性の増加**: 依存注入が増える
- **一時的な学習コスト**: チームメンバーへの説明が必要

**影響範囲:**
- Domain層: UserProgress 簡略化、ドメインサービス 3個追加
- Infrastructure層: ドメインサービス実装 3個追加
- Application層: ProgressUseCase の修正（ドメインサービス注入）
- Presentation層: 変更なし（DTOへの変換で吸収）
- テスト: UserProgress のテスト修正、ドメインサービスのテスト追加

---

### 2.3 推奨アプローチ: 段階的リファクタリング

#### Phase 1: エンドポイント分割（今すぐ）

**目的:** over-fetching 問題の即座の解決

**実装内容:**
1. 新しいエンドポイント追加
   - `GET /api/progress/subjects/{subjectId}/summary`
   - `GET /api/progress/subjects/{subjectId}/cleared-sections`
   - `GET /api/progress/subjects/{subjectId}/next-section`
2. 既存エンドポイントを `/detail` にリネーム
3. フロントエンドのAPI呼び出し変更

**期間:** 1-2時間
**リスク:** 低
**価値:** フロントエンドの開発効率向上、パフォーマンス改善

#### Phase 2: ドメイン責務分離（1-2週間後）

**目的:** ドメインモデルの設計改善

**実装内容:**
1. ドメインサービスの追加
   - `ProgressCalculator`
   - `NextSectionSuggester`
   - `SectionCompletionChecker`
2. `UserProgress` の簡略化
3. `ProgressUseCase` の修正
4. テストの修正・追加

**期間:** 4-6時間
**リスク:** 中
**価値:** 長期的な保守性向上、拡張性向上

#### 段階的アプローチの理由

1. **リスク分散**: 大きな変更を一度に行わない
2. **早期の価値提供**: Phase 1 だけでもフロントエンドが楽になる
3. **学習機会**: Phase 1 の実装中に Phase 2 の設計を熟考できる
4. **ロールバック容易性**: 問題発生時に切り戻しやすい

---

## 3. フロントエンドへの影響分析

### 3.1 現状のAPI使用箇所

**確認済みファイル:**
- `viewmodels/useProgressInspectorViewModel.ts:29-44` - `getProgress()` 呼び出し
- `views/progress/ProgressInspectorView.tsx:92-122` - 全データを表示

**想定される他の使用箇所:**
- 進捗バーコンポーネント（`components/ProgressBar.tsx`）
- セクション一覧画面（`views/sections/SectionsView.tsx`）
- ダッシュボード（`views/home/RootView.tsx`）

### 3.2 Phase 1 実装後の変更

#### 3.2.1 進捗バーコンポーネント

**Before:**
```typescript
const ProgressBar = ({ subjectId }) => {
  const progress = await getProgress(subjectId);
  return <div>{progress.progressPercentage}%</div>;
  // clearedSections は使わないが取得される
};
```

**After:**
```typescript
const ProgressBar = ({ subjectId }) => {
  const summary = await getProgressSummary(subjectId);
  return <div>{summary.progressPercentage}%</div>;
  // 必要なデータのみ取得
};
```

#### 3.2.2 セクション一覧画面

**Before:**
```typescript
const SectionList = ({ subjectId, sections }) => {
  const progress = await getProgress(subjectId);
  const clearedIds = progress.clearedSections.map(s => s.sectionId);

  return sections.map(section => (
    <Section isCleared={clearedIds.includes(section.id)} />
  ));
};
```

**After:**
```typescript
const SectionList = ({ subjectId, sections }) => {
  const { clearedSections } = await getClearedSections(subjectId);
  const clearedIds = clearedSections.map(s => s.sectionId);

  return sections.map(section => (
    <Section isCleared={clearedIds.includes(section.id)} />
  ));
};
```

#### 3.2.3 ProgressInspectorView（詳細画面）

**Before:**
```typescript
const progress = await getProgress(subjectId);
```

**After:**
```typescript
const progress = await getProgressDetail(subjectId);
// 全データが必要な画面なので /detail エンドポイントを使用
```

### 3.3 必要なフロントエンド変更

#### 3.3.1 ProgressService の拡張

```typescript
// services/ProgressService.ts

// 既存（詳細情報用にリネーム）
export const getProgressDetail = async (subjectId: number): Promise<ProgressData> => {
  const response = await apiClient.get(`/api/progress/subjects/${subjectId}/detail`);
  return response.data;
};

// 新規追加
export const getProgressSummary = async (subjectId: number): Promise<ProgressSummary> => {
  const response = await apiClient.get(`/api/progress/subjects/${subjectId}/summary`);
  return response.data;
};

export const getClearedSections = async (subjectId: number): Promise<ClearedSectionsData> => {
  const response = await apiClient.get(`/api/progress/subjects/${subjectId}/cleared-sections`);
  return response.data;
};

export const getNextSection = async (subjectId: number): Promise<NextSectionData> => {
  const response = await apiClient.get(`/api/progress/subjects/${subjectId}/next-section`);
  return response.data;
};
```

#### 3.3.2 型定義の追加

```typescript
// models/Progress.ts

// 既存
export interface ProgressData {
  userId: string;
  subjectId: number;
  progressPercentage: number;
  clearedCount: number;
  remainingCount: number;
  totalSections: number;
  isAllCleared: boolean;
  nextSectionId: number | null;
  clearedSections: ClearedSectionInfo[];
}

// 新規追加
export interface ProgressSummary {
  progressPercentage: number;
  clearedCount: number;
  remainingCount: number;
  totalSections: number;
}

export interface ClearedSectionsData {
  clearedSections: ClearedSectionInfo[];
}

export interface NextSectionData {
  nextSectionId: number | null;
  isAllCleared: boolean;
}
```

### 3.4 影響範囲まとめ

| ファイル | 変更内容 | 工数 |
|---------|---------|------|
| `services/ProgressService.ts` | 新しいAPI関数追加（3個） | 15分 |
| `models/Progress.ts` | 新しい型定義追加（3個） | 10分 |
| `viewmodels/useProgressInspectorViewModel.ts` | `getProgress` → `getProgressDetail` にリネーム | 5分 |
| `views/progress/ProgressInspectorView.tsx` | 変更なし | 0分 |
| 進捗バー使用箇所 | API呼び出し変更 | 10分/箇所 |
| セクション一覧使用箇所 | API呼び出し変更 | 10分/箇所 |

**合計工数:** 約1-2時間（使用箇所の数に依存）

### 3.5 移行戦略

#### Option A: 一括移行
- 全ての使用箇所を一度に変更
- フロントエンドとバックエンドを同時にデプロイ

**メリット:** クリーンな移行
**デメリット:** リスクが高い、ロールバックが困難

#### Option B: 段階的移行（推奨）

1. バックエンドに新しいエンドポイントを追加（既存は残す）
2. フロントエンドを画面ごとに段階的に移行
3. 全ての移行が完了したら、古いエンドポイントを廃止

**メリット:** リスクが低い、ロールバック容易
**デメリット:** 移行期間中は2つのAPIが共存

**推奨: Option B**

---

## 4. 実装ステップ

### Phase 1: エンドポイント分割

#### Step 1: バックエンド実装（1時間）

1. **DTO の追加**
   ```
   presentation/dto/response/ProgressSummaryResponse.kt
   presentation/dto/response/ClearedSectionsResponse.kt
   presentation/dto/response/NextSectionResponse.kt
   ```

2. **Controller の追加**
   ```kotlin
   // ProgressQueryController.kt に追加

   @GetMapping("/subjects/{subjectId}/summary")
   fun getProgressSummary(...)

   @GetMapping("/subjects/{subjectId}/cleared-sections")
   fun getClearedSections(...)

   @GetMapping("/subjects/{subjectId}/next-section")
   fun getNextSection(...)
   ```

3. **既存エンドポイントのリネーム**
   ```kotlin
   @GetMapping("/subjects/{subjectId}/detail")  // /subjects/{subjectId} から変更
   fun getUserProgressDetail(...)
   ```

4. **テスト追加**
   - 新しいエンドポイントの統合テスト

#### Step 2: フロントエンド実装（1時間）

1. **型定義の追加**（`models/Progress.ts`）
2. **API関数の追加**（`services/ProgressService.ts`）
3. **ProgressInspectorView の修正**（`getProgress` → `getProgressDetail`）
4. **他の使用箇所の段階的移行**

#### Step 3: デプロイ・検証（30分）

1. バックエンドデプロイ
2. フロントエンドデプロイ
3. 動作確認

---

### Phase 2: ドメイン責務分離

#### Step 1: ドメインサービスインターフェースの追加（1時間）

1. **インターフェース定義**
   ```
   domain/service/ProgressCalculator.kt
   domain/service/NextSectionSuggester.kt
   domain/service/SectionCompletionChecker.kt
   ```

2. **実装クラス追加**
   ```
   infrastructure/service/ProgressCalculatorImpl.kt
   infrastructure/service/NextSectionSuggesterImpl.kt
   infrastructure/service/SectionCompletionCheckerImpl.kt
   ```

#### Step 2: UserProgress の簡略化（1時間）

1. **メソッドの削除**
   - 7つのメソッドを削除
   - データ保持のみに特化

2. **companion object の整理**
   - ファクトリメソッドは残す

#### Step 3: ProgressUseCase の修正（1時間）

1. **ドメインサービスの注入**
2. **ロジック呼び出しの変更**
   ```kotlin
   // Before
   val percentage = userProgress.calculateProgressPercentage()

   // After
   val percentage = progressCalculator.calculatePercentage(userProgress)
   ```

#### Step 4: テストの修正・追加（2時間）

1. **UserProgress のテスト簡略化**
2. **ドメインサービスのテスト追加**
3. **ProgressUseCase のテスト修正**

#### Step 5: デプロイ・検証（30分）

---

## 5. リスク分析と対策

### 5.1 Phase 1 のリスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| フロントエンド移行漏れ | 中 | 段階的移行、古いエンドポイントを残す |
| エンドポイントの仕様ミス | 低 | 既存のUseCaseを活用、統合テスト追加 |
| パフォーマンス劣化 | 低 | 複数リクエストが必要な画面の確認 |

### 5.2 Phase 2 のリスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| 既存機能の破壊 | 中 | 包括的なテスト、段階的リファクタリング |
| ドメインサービスの設計ミス | 中 | レビュー、DDD原則の遵守 |
| パフォーマンス影響 | 低 | ベンチマーク、プロファイリング |

---

## 6. 期待される効果

### Phase 1 完了後

- ✅ over-fetching 問題の解決
- ✅ ネットワークトラフィック 30-50% 削減（進捗バー表示時）
- ✅ フロントエンド開発効率の向上
- ✅ API の責務が明確化

### Phase 2 完了後

- ✅ ドメインモデルの単一責任化
- ✅ 拡張性の向上（新しい計算ロジック追加が容易）
- ✅ テスト容易性の向上
- ✅ 長期的な保守性の向上
- ✅ マイクロサービス化への準備完了

---

## 7. 参考資料

### 関連ファイル

**バックエンド:**
- `domain/model/progress/UserProgress.kt` - 現状のドメインモデル
- `application/usecase/progress/ProgressUseCase.kt` - 進捗UseCase
- `presentation/controller/progress/ProgressQueryController.kt` - 進捗Controller
- `presentation/dto/response/UserProgressResponse.kt` - レスポンスDTO

**フロントエンド:**
- `models/Progress.ts` - 型定義
- `services/ProgressService.ts` - API呼び出し
- `viewmodels/useProgressInspectorViewModel.ts` - ViewModel
- `views/progress/ProgressInspectorView.tsx` - View

### 設計原則

- **Single Responsibility Principle (SRP)**: 各クラスは1つの責務のみを持つ
- **Domain-Driven Design (DDD)**: ドメインサービスでビジネスロジックを分離
- **API Design Best Practices**: 用途別にエンドポイントを分割

---

## 8. 実装判断

### 今すぐ実装すべき理由

1. **コードベースが小さい**: 3,400行の今なら影響範囲を完全に把握できる
2. **フロントエンドへの影響が明確**: 実装箇所が限定的
3. **段階的アプローチでリスク軽減**: Phase 1 だけでも価値がある
4. **モノリス内でのリファクタリングが容易**: マイクロサービス化後では困難

### 先送りする理由

1. **他の優先度の高い機能開発がある**
2. **近々リリース予定があり、リスクを回避したい**
3. **現時点で実害が小さい**（セクション数が少ない、トラフィックが少ない）

---

**最終推奨:** Phase 1（エンドポイント分割）を今すぐ実施し、Phase 2（ドメイン責務分離）を1-2週間後に実施する段階的アプローチを推奨します。
