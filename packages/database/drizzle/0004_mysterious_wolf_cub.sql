CREATE TABLE "open_house_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"open_house_id" uuid NOT NULL,
	"url" text NOT NULL,
	"public_id" text NOT NULL,
	"is_main" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "open_house_image" ADD CONSTRAINT "open_house_image_open_house_id_open_house_id_fk" FOREIGN KEY ("open_house_id") REFERENCES "public"."open_house"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "open_house" DROP COLUMN "listing_image_url";