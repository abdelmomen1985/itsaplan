CREATE TABLE "issue_web_link" (
	"id" serial PRIMARY KEY NOT NULL,
	"issue_id" integer NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issue_web_link" ADD CONSTRAINT "issue_web_link_issue_id_issue_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_web_link" ADD CONSTRAINT "issue_web_link_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issue_web_link_issue_idx" ON "issue_web_link" USING btree ("issue_id","id");--> statement-breakpoint
CREATE TRIGGER issue_web_link_rev AFTER INSERT OR UPDATE OR DELETE ON issue_web_link
  FOR EACH ROW EXECUTE FUNCTION rev_issue_child('issue_id', 'detail');
