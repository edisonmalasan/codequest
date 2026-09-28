CREATE TABLE "codequest"."quest_hint_uses" (
	"user_id" uuid NOT NULL,
	"quest_id" text NOT NULL,
	"quest_version_id" uuid NOT NULL,
	"hint_key" text NOT NULL,
	"used_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quest_hint_uses_primary" PRIMARY KEY("user_id","quest_id","quest_version_id","hint_key"),
	CONSTRAINT "quest_hint_uses_key_check" CHECK ("codequest"."quest_hint_uses"."hint_key" in ('question', 'concept', 'nextStep'))
);
--> statement-breakpoint
ALTER TABLE "codequest"."quest_hint_uses" ADD CONSTRAINT "quest_hint_uses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "codequest"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_hint_uses" ADD CONSTRAINT "quest_hint_uses_version_fk" FOREIGN KEY ("quest_version_id","quest_id") REFERENCES "codequest"."quest_versions"("id","quest_id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "quest_hint_uses_owner_time_idx" ON "codequest"."quest_hint_uses" USING btree ("user_id","used_at");--> statement-breakpoint
CREATE INDEX "quest_hint_uses_version_idx" ON "codequest"."quest_hint_uses" USING btree ("quest_version_id","quest_id");