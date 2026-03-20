CREATE TYPE "public"."image_status" AS ENUM('temp', 'attached', 'delete_pending', 'deleted');--> statement-breakpoint
CREATE TABLE "image_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_id" varchar(128) NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"status" "image_status" DEFAULT 'temp' NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delete_after" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "image_assets_image_id_unique" UNIQUE("image_id")
);
--> statement-breakpoint
CREATE INDEX "idx_image_assets_owner_post" ON "image_assets" USING btree ("owner_user_id","post_id");--> statement-breakpoint
CREATE INDEX "idx_image_assets_status_delete_after" ON "image_assets" USING btree ("status","delete_after");