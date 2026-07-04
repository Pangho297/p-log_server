ALTER TABLE "image_assets" ALTER COLUMN "post_id" DROP NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_image_assets_owner_status" ON "image_assets" USING btree ("owner_user_id","status");
