ALTER TABLE "User"
ADD COLUMN "password_hash" VARCHAR(255),
ADD COLUMN "password_updated_at" TIMESTAMP(3);

CREATE TYPE "AuthTokenType" AS ENUM ('VERIFY_EMAIL', 'RESET_PASSWORD');

CREATE TABLE "AuthToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "AuthTokenType" NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthToken_token_hash_key" ON "AuthToken"("token_hash");
CREATE INDEX "AuthToken_userId_type_idx" ON "AuthToken"("userId", "type");
CREATE INDEX "AuthToken_expires_at_idx" ON "AuthToken"("expires_at");

ALTER TABLE "AuthToken"
ADD CONSTRAINT "AuthToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
