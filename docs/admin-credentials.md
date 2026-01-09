# 管理者認証情報（開発者専用）

認証情報は AWS Secrets Manager で管理しています。

## Secrets Manager から取得

```bash
# 管理者認証情報
aws secretsmanager get-secret-value \
  --secret-id j15-backend/admin-credentials-dev \
  --query 'SecretString' --output text | jq .

# X-Admin-Key
aws secretsmanager get-secret-value \
  --secret-id j15-backend/admin-api-key-dev \
  --query 'SecretString' --output text
```

## 使い方

### サインイン（JWT トークン取得）

```bash
CREDS=$(aws secretsmanager get-secret-value --secret-id j15-backend/admin-credentials-dev --query 'SecretString' --output text)
EMAIL=$(echo $CREDS | jq -r '.email')
PASSWORD=$(echo $CREDS | jq -r '.password')

curl -X POST https://zu9mkxoir4.execute-api.ap-northeast-1.amazonaws.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
```

### 管理者 API 呼び出し

```bash
# Authorization: Bearer <accessToken> で認証
curl -X POST https://zu9mkxoir4.execute-api.ap-northeast-1.amazonaws.com/api/subjects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"subjectId":1,"title":"題材名","description":"説明","maxSections":100}'
```

### 新規管理者作成（X-Admin-Key 使用）

```bash
ADMIN_KEY=$(aws secretsmanager get-secret-value --secret-id j15-backend/admin-api-key-dev --query 'SecretString' --output text)

curl -X POST https://zu9mkxoir4.execute-api.ap-northeast-1.amazonaws.com/api/admin/users \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: $ADMIN_KEY" \
  -d '{"username":"new_admin","email":"admin@example.com","password":"password123"}'
```

メアド:
ka392561@gmail.com
pass:
wF2!kiaWh2\*Y
