CREATE TABLE "organization_form_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"questions" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "open_house" ALTER COLUMN "listing_price" SET DATA TYPE numeric(2, 2);--> statement-breakpoint
ALTER TABLE "open_house_lead" ADD COLUMN "responses" jsonb;--> statement-breakpoint
ALTER TABLE "organization_form_config" ADD CONSTRAINT "organization_form_config_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_form_config_organizationId_idx" ON "organization_form_config" USING btree ("organization_id");