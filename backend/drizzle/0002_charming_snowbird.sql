ALTER TABLE "codequest"."xp_events" ADD COLUMN "source_type" text;--> statement-breakpoint
ALTER TABLE "codequest"."xp_events" ADD COLUMN "source_id" text;--> statement-breakpoint
UPDATE "codequest"."xp_events" SET "source_type" = 'quest_completion', "source_id" = "quest_id";--> statement-breakpoint
ALTER TABLE "codequest"."xp_events" ALTER COLUMN "source_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "codequest"."xp_events" ALTER COLUMN "source_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "codequest"."xp_events" ADD CONSTRAINT "xp_events_owner_source_unique" UNIQUE("user_id","source_type","source_id");--> statement-breakpoint
ALTER TABLE "codequest"."xp_events" ADD CONSTRAINT "xp_events_quest_source_consistent" CHECK ("codequest"."xp_events"."source_type" = 'quest_completion' AND "codequest"."xp_events"."source_id" = "codequest"."xp_events"."quest_id");
