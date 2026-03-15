CREATE TABLE "user_model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "user_model_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "refresh_token_model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"jti" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone
);
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
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "post_model" ADD CONSTRAINT "post_model_user_id_user_model_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "refresh_token_user_id_idx" ON "refresh_token_model" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_token_jti_uq" ON "refresh_token_model" USING btree ("jti");--> statement-breakpoint
CREATE INDEX "post_user_id_idx" ON "post_model" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_slug_uq" ON "post_model" USING btree ("slug") WHERE "post_model"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "post_created_at_idx" ON "post_model" USING btree ("created_at");