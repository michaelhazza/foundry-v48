CREATE TYPE "public"."user_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."source_status" AS ENUM('connected', 'cached', 'expired', 'error');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('file', 'api');--> statement-breakpoint
CREATE TYPE "public"."job_trigger" AS ENUM('manual', 'scheduled');--> statement-breakpoint
CREATE TYPE "public"."processing_job_status" AS ENUM('queued', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."output_format" AS ENUM('conversationalJsonl', 'qaJson', 'structuredJson');--> statement-breakpoint
CREATE TABLE "organisations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" NOT NULL,
	"invite_token" text,
	"invite_token_expiry" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "canonical_schemas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"version" integer NOT NULL,
	"schema_definition" jsonb NOT NULL,
	"schema_definition_version" integer DEFAULT 1 NOT NULL,
	"description" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "idx_canonical_schemas_name_version" UNIQUE("name","version")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"created_by_user_id" uuid,
	"canonical_schema_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"processing_config" jsonb,
	"processing_config_version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"source_type" "source_type" NOT NULL,
	"file_upload_path" text,
	"file_mime_type" text,
	"file_size_bytes" bigint,
	"api_connection_config" jsonb,
	"api_connection_config_version" integer DEFAULT 1,
	"status" "source_status" DEFAULT 'connected' NOT NULL,
	"cached_data_path" text,
	"cached_at" timestamp,
	"cache_expiry_date" timestamp,
	"record_count" integer,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "processing_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"triggered_by" "job_trigger" NOT NULL,
	"triggered_by_user_id" uuid,
	"status" "processing_job_status" DEFAULT 'queued' NOT NULL,
	"config_snapshot" jsonb NOT NULL,
	"config_snapshot_version" integer DEFAULT 1 NOT NULL,
	"input_record_count" integer,
	"output_record_count" integer,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"processing_job_id" uuid NOT NULL,
	"name" text NOT NULL,
	"output_format" "output_format" NOT NULL,
	"output_storage_path" text NOT NULL,
	"record_count" integer NOT NULL,
	"file_size_bytes" bigint NOT NULL,
	"lineage_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_canonical_schema_id_canonical_schemas_id_fk" FOREIGN KEY ("canonical_schema_id") REFERENCES "public"."canonical_schemas"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "processing_jobs" ADD CONSTRAINT "processing_jobs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "processing_jobs" ADD CONSTRAINT "processing_jobs_triggered_by_user_id_users_id_fk" FOREIGN KEY ("triggered_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_processing_job_id_processing_jobs_id_fk" FOREIGN KEY ("processing_job_id") REFERENCES "public"."processing_jobs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_orgs_slug_active" ON "organisations" USING btree ("slug") WHERE "organisations"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_orgs_deleted_at" ON "organisations" USING btree ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email_active" ON "users" USING btree ("email") WHERE "users"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_users_org_deleted" ON "users" USING btree ("organisation_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_users_invite_token" ON "users" USING btree ("invite_token");--> statement-breakpoint
CREATE INDEX "idx_users_deleted_at" ON "users" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_canonical_schemas_published" ON "canonical_schemas" USING btree ("is_published");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_projects_org_name_active" ON "projects" USING btree ("organisation_id","name") WHERE "projects"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_projects_org_deleted" ON "projects" USING btree ("organisation_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_projects_status" ON "projects" USING btree ("status","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_projects_created_by" ON "projects" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_projects_canonical_schema" ON "projects" USING btree ("canonical_schema_id");--> statement-breakpoint
CREATE INDEX "idx_projects_deleted_at" ON "projects" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_sources_project" ON "sources" USING btree ("project_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_sources_status" ON "sources" USING btree ("status","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_sources_cache_expiry" ON "sources" USING btree ("cache_expiry_date");--> statement-breakpoint
CREATE INDEX "idx_sources_deleted_at" ON "sources" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_processing_jobs_project" ON "processing_jobs" USING btree ("project_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_processing_jobs_status" ON "processing_jobs" USING btree ("status","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_processing_jobs_triggered_by" ON "processing_jobs" USING btree ("triggered_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_processing_jobs_created_at" ON "processing_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_processing_jobs_deleted_at" ON "processing_jobs" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_datasets_project" ON "datasets" USING btree ("project_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_datasets_processing_job" ON "datasets" USING btree ("processing_job_id");--> statement-breakpoint
CREATE INDEX "idx_datasets_output_format" ON "datasets" USING btree ("output_format","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_datasets_created_at" ON "datasets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_datasets_deleted_at" ON "datasets" USING btree ("deleted_at");