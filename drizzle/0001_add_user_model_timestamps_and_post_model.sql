ALTER TABLE "user_model" ADD COLUMN "updated_at" timestamp with time zone;
ALTER TABLE "user_model" ADD COLUMN "deleted_at" timestamp with time zone;
UPDATE "user_model" SET "updated_at" = COALESCE("created_at", now()) WHERE "updated_at" IS NULL;
ALTER TABLE "user_model" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE "user_model" ALTER COLUMN "updated_at" SET NOT NULL;
--> statement-breakpoint
CREATE TABLE "post_model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "post_slug_uq" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "post_model" ADD CONSTRAINT "post_model_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_model"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "post_user_id_idx" ON "post_model" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "post_created_at_idx" ON "post_model" USING btree ("created_at");
