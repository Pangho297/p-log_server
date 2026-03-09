CREATE TABLE "user_model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
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
CREATE INDEX "refresh_token_user_id_idx" ON "refresh_token_model" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_token_jti_uq" ON "refresh_token_model" USING btree ("jti");