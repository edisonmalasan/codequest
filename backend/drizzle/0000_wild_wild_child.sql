CREATE SCHEMA "codequest";
--> statement-breakpoint
CREATE TABLE "codequest"."chapters" (
	"id" text PRIMARY KEY NOT NULL,
	"journey_id" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chapters_journey_position_unique" UNIQUE("journey_id","position"),
	CONSTRAINT "chapters_id_nonempty" CHECK (length("codequest"."chapters"."id") > 0),
	CONSTRAINT "chapters_position_positive" CHECK ("codequest"."chapters"."position" > 0)
);
--> statement-breakpoint
CREATE TABLE "codequest"."concepts" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "concepts_id_nonempty" CHECK (length("codequest"."concepts"."id") > 0)
);
--> statement-breakpoint
CREATE TABLE "codequest"."journey_enrollments" (
	"user_id" uuid NOT NULL,
	"journey_id" text NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journey_enrollments_primary" PRIMARY KEY("user_id","journey_id")
);
--> statement-breakpoint
CREATE TABLE "codequest"."journeys" (
	"id" text PRIMARY KEY NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journeys_position_unique" UNIQUE("position"),
	CONSTRAINT "journeys_id_nonempty" CHECK (length("codequest"."journeys"."id") > 0),
	CONSTRAINT "journeys_position_positive" CHECK ("codequest"."journeys"."position" > 0)
);
--> statement-breakpoint
CREATE TABLE "codequest"."profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_timezone_nonempty" CHECK (length("codequest"."profiles"."timezone") > 0)
);
--> statement-breakpoint
CREATE TABLE "codequest"."quest_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quest_id" text NOT NULL,
	"quest_version_id" uuid NOT NULL,
	"client_event_id" uuid NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quest_attempts_owner_event_unique" UNIQUE("user_id","client_event_id"),
	CONSTRAINT "quest_attempts_id_owner_quest_unique" UNIQUE("id","user_id","quest_id")
);
--> statement-breakpoint
CREATE TABLE "codequest"."quest_completions" (
	"user_id" uuid NOT NULL,
	"quest_id" text NOT NULL,
	"accepted_attempt_id" uuid NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quest_completions_primary" PRIMARY KEY("user_id","quest_id"),
	CONSTRAINT "quest_completions_attempt_unique" UNIQUE("accepted_attempt_id")
);
--> statement-breakpoint
CREATE TABLE "codequest"."quest_concepts" (
	"quest_id" text NOT NULL,
	"concept_id" text NOT NULL,
	CONSTRAINT "quest_concepts_primary" PRIMARY KEY("quest_id","concept_id")
);
--> statement-breakpoint
CREATE TABLE "codequest"."quest_prerequisites" (
	"quest_id" text NOT NULL,
	"prerequisite_quest_id" text NOT NULL,
	CONSTRAINT "quest_prerequisites_primary" PRIMARY KEY("quest_id","prerequisite_quest_id"),
	CONSTRAINT "quest_prerequisites_not_self" CHECK ("codequest"."quest_prerequisites"."quest_id" <> "codequest"."quest_prerequisites"."prerequisite_quest_id")
);
--> statement-breakpoint
CREATE TABLE "codequest"."quest_starts" (
	"user_id" uuid NOT NULL,
	"quest_id" text NOT NULL,
	"quest_version_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quest_starts_primary" PRIMARY KEY("user_id","quest_id")
);
--> statement-breakpoint
CREATE TABLE "codequest"."quest_submissions" (
	"attempt_id" uuid PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"reported_result" jsonb NOT NULL,
	"explanation" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "codequest"."quest_version_compatibility" (
	"quest_id" text NOT NULL,
	"from_version_id" uuid NOT NULL,
	"to_version_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quest_version_compatibility_primary" PRIMARY KEY("from_version_id","to_version_id"),
	CONSTRAINT "quest_version_compatibility_not_self" CHECK ("codequest"."quest_version_compatibility"."from_version_id" <> "codequest"."quest_version_compatibility"."to_version_id")
);
--> statement-breakpoint
CREATE TABLE "codequest"."quest_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quest_id" text NOT NULL,
	"content_version" text NOT NULL,
	"assessment_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quest_versions_quest_content_unique" UNIQUE("quest_id","content_version"),
	CONSTRAINT "quest_versions_id_quest_unique" UNIQUE("id","quest_id"),
	CONSTRAINT "quest_versions_content_nonempty" CHECK (length("codequest"."quest_versions"."content_version") > 0),
	CONSTRAINT "quest_versions_assessment_nonempty" CHECK (length("codequest"."quest_versions"."assessment_version") > 0)
);
--> statement-breakpoint
CREATE TABLE "codequest"."quests" (
	"id" text PRIMARY KEY NOT NULL,
	"chapter_id" text NOT NULL,
	"position" integer NOT NULL,
	"kind" text DEFAULT 'instructional' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quests_chapter_position_unique" UNIQUE("chapter_id","position"),
	CONSTRAINT "quests_id_nonempty" CHECK (length("codequest"."quests"."id") > 0),
	CONSTRAINT "quests_position_positive" CHECK ("codequest"."quests"."position" > 0),
	CONSTRAINT "quests_kind_allowed" CHECK ("codequest"."quests"."kind" in ('instructional', 'capstone'))
);
--> statement-breakpoint
CREATE TABLE "codequest"."streak_activity_days" (
	"user_id" uuid NOT NULL,
	"activity_date" date NOT NULL,
	"timezone" text NOT NULL,
	"qualifying_quest_id" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "streak_activity_days_primary" PRIMARY KEY("user_id","activity_date"),
	CONSTRAINT "streak_activity_days_completion_unique" UNIQUE("user_id","qualifying_quest_id"),
	CONSTRAINT "streak_activity_days_timezone_nonempty" CHECK (length("codequest"."streak_activity_days"."timezone") > 0)
);
--> statement-breakpoint
CREATE TABLE "codequest"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "codequest"."xp_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quest_id" text NOT NULL,
	"amount" integer NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "xp_events_owner_quest_unique" UNIQUE("user_id","quest_id"),
	CONSTRAINT "xp_events_amount_positive" CHECK ("codequest"."xp_events"."amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "codequest"."chapters" ADD CONSTRAINT "chapters_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "codequest"."journeys"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."journey_enrollments" ADD CONSTRAINT "journey_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "codequest"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."journey_enrollments" ADD CONSTRAINT "journey_enrollments_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "codequest"."journeys"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "codequest"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_attempts" ADD CONSTRAINT "quest_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "codequest"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_attempts" ADD CONSTRAINT "quest_attempts_version_fk" FOREIGN KEY ("quest_version_id","quest_id") REFERENCES "codequest"."quest_versions"("id","quest_id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_completions" ADD CONSTRAINT "quest_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "codequest"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_completions" ADD CONSTRAINT "quest_completions_quest_id_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "codequest"."quests"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_completions" ADD CONSTRAINT "quest_completions_attempt_owner_quest_fk" FOREIGN KEY ("accepted_attempt_id","user_id","quest_id") REFERENCES "codequest"."quest_attempts"("id","user_id","quest_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_concepts" ADD CONSTRAINT "quest_concepts_quest_id_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "codequest"."quests"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_concepts" ADD CONSTRAINT "quest_concepts_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "codequest"."concepts"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_prerequisites" ADD CONSTRAINT "quest_prerequisites_quest_id_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "codequest"."quests"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_prerequisites" ADD CONSTRAINT "quest_prerequisites_prerequisite_quest_id_quests_id_fk" FOREIGN KEY ("prerequisite_quest_id") REFERENCES "codequest"."quests"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_starts" ADD CONSTRAINT "quest_starts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "codequest"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_starts" ADD CONSTRAINT "quest_starts_version_fk" FOREIGN KEY ("quest_version_id","quest_id") REFERENCES "codequest"."quest_versions"("id","quest_id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_submissions" ADD CONSTRAINT "quest_submissions_attempt_id_quest_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "codequest"."quest_attempts"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_version_compatibility" ADD CONSTRAINT "quest_version_compatibility_quest_id_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "codequest"."quests"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_version_compatibility" ADD CONSTRAINT "quest_version_compatibility_from_fk" FOREIGN KEY ("from_version_id","quest_id") REFERENCES "codequest"."quest_versions"("id","quest_id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_version_compatibility" ADD CONSTRAINT "quest_version_compatibility_to_fk" FOREIGN KEY ("to_version_id","quest_id") REFERENCES "codequest"."quest_versions"("id","quest_id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quest_versions" ADD CONSTRAINT "quest_versions_quest_id_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "codequest"."quests"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."quests" ADD CONSTRAINT "quests_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "codequest"."chapters"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."streak_activity_days" ADD CONSTRAINT "streak_activity_days_completion_fk" FOREIGN KEY ("user_id","qualifying_quest_id") REFERENCES "codequest"."quest_completions"("user_id","quest_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "codequest"."xp_events" ADD CONSTRAINT "xp_events_completion_fk" FOREIGN KEY ("user_id","quest_id") REFERENCES "codequest"."quest_completions"("user_id","quest_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "journey_enrollments_journey_idx" ON "codequest"."journey_enrollments" USING btree ("journey_id");--> statement-breakpoint
CREATE INDEX "quest_attempts_owner_time_idx" ON "codequest"."quest_attempts" USING btree ("user_id","submitted_at");--> statement-breakpoint
CREATE INDEX "quest_attempts_quest_time_idx" ON "codequest"."quest_attempts" USING btree ("quest_id","submitted_at");--> statement-breakpoint
CREATE INDEX "quest_attempts_version_idx" ON "codequest"."quest_attempts" USING btree ("quest_version_id","quest_id");--> statement-breakpoint
CREATE INDEX "quest_completions_quest_idx" ON "codequest"."quest_completions" USING btree ("quest_id");--> statement-breakpoint
CREATE INDEX "quest_completions_owner_time_idx" ON "codequest"."quest_completions" USING btree ("user_id","accepted_at");--> statement-breakpoint
CREATE INDEX "quest_concepts_concept_idx" ON "codequest"."quest_concepts" USING btree ("concept_id");--> statement-breakpoint
CREATE INDEX "quest_prerequisites_prerequisite_idx" ON "codequest"."quest_prerequisites" USING btree ("prerequisite_quest_id");--> statement-breakpoint
CREATE INDEX "quest_starts_quest_idx" ON "codequest"."quest_starts" USING btree ("quest_id");--> statement-breakpoint
CREATE INDEX "quest_starts_version_idx" ON "codequest"."quest_starts" USING btree ("quest_version_id","quest_id");--> statement-breakpoint
CREATE INDEX "quest_version_compatibility_to_idx" ON "codequest"."quest_version_compatibility" USING btree ("to_version_id","quest_id");--> statement-breakpoint
CREATE INDEX "quest_version_compatibility_quest_idx" ON "codequest"."quest_version_compatibility" USING btree ("quest_id");--> statement-breakpoint
CREATE INDEX "streak_activity_days_quest_idx" ON "codequest"."streak_activity_days" USING btree ("qualifying_quest_id");--> statement-breakpoint
CREATE INDEX "xp_events_quest_idx" ON "codequest"."xp_events" USING btree ("quest_id");--> statement-breakpoint
CREATE INDEX "xp_events_owner_time_idx" ON "codequest"."xp_events" USING btree ("user_id","awarded_at");