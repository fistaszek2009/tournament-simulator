CREATE TABLE "tournament_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"tournament_id" integer NOT NULL,
	"round" integer NOT NULL,
	"position" integer NOT NULL,
	"winner_member_id" integer,
	"next_match_id" integer
);
--> statement-breakpoint
CREATE TABLE "tournament_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"tournament_id" integer NOT NULL,
	"player_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"pair_by" varchar(50) DEFAULT 'name' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"surname" varchar(255) NOT NULL,
	"age" integer NOT NULL,
	"country" varchar(255) NOT NULL,
	"register_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_winner_member_id_tournament_members_id_fk" FOREIGN KEY ("winner_member_id") REFERENCES "public"."tournament_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_next_match_id_tournament_matches_id_fk" FOREIGN KEY ("next_match_id") REFERENCES "public"."tournament_matches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_members" ADD CONSTRAINT "tournament_members_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_members" ADD CONSTRAINT "tournament_members_player_id_users_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;