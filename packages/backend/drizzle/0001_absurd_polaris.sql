CREATE TABLE "dlq_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outbox_id" uuid NOT NULL,
	"aggregate_id" text NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"delivery_count" integer NOT NULL,
	"error" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "outbox" ADD COLUMN "delivery_count" integer DEFAULT 0 NOT NULL;