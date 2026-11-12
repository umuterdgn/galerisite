-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable: Add 1536-dimensional embedding column for OpenAI / Google AI semantic vector search
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);

-- CreateIndex: IVFFlat index with cosine distance operator for sub-second semantic search
CREATE INDEX IF NOT EXISTS "properties_embedding_cosine_idx" ON "properties" 
USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);

