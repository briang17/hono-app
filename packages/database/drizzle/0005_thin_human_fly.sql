ALTER TABLE "open_house" ADD COLUMN "bedrooms" integer;--> statement-breakpoint
ALTER TABLE "open_house" ADD COLUMN "bathrooms" numeric(3, 1);--> statement-breakpoint
ALTER TABLE "open_house" ADD COLUMN "features" text[];