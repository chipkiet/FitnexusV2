--
-- PostgreSQL database dump
--

\restrict NVMTS7vpLnhsDIb5n6TfljJhlpnhMkRuLyWoxnZTYmXrip6Yn2oeWvJM7z7WMTo

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: enum_transactions_status; Type: TYPE; Schema: public; Owner: tu
--

CREATE TYPE public.enum_transactions_status AS ENUM (
    'pending',
    'completed',
    'failed'
);


ALTER TYPE public.enum_transactions_status OWNER TO tu;

--
-- Name: enum_users_gender; Type: TYPE; Schema: public; Owner: tu
--

CREATE TYPE public.enum_users_gender AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


ALTER TYPE public.enum_users_gender OWNER TO tu;

--
-- Name: enum_users_plan; Type: TYPE; Schema: public; Owner: tu
--

CREATE TYPE public.enum_users_plan AS ENUM (
    'FREE',
    'PREMIUM'
);


ALTER TYPE public.enum_users_plan OWNER TO tu;

--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: tu
--

CREATE TYPE public.enum_users_role AS ENUM (
    'USER',
    'TRAINER',
    'ADMIN'
);


ALTER TYPE public.enum_users_role OWNER TO tu;

--
-- Name: enum_users_status; Type: TYPE; Schema: public; Owner: tu
--

CREATE TYPE public.enum_users_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'BANNED'
);


ALTER TYPE public.enum_users_status OWNER TO tu;

--
-- Name: enum_workout_session_exercises_status; Type: TYPE; Schema: public; Owner: tu
--

CREATE TYPE public.enum_workout_session_exercises_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'skipped'
);


ALTER TYPE public.enum_workout_session_exercises_status OWNER TO tu;

--
-- Name: enum_workout_sessions_status; Type: TYPE; Schema: public; Owner: tu
--

CREATE TYPE public.enum_workout_sessions_status AS ENUM (
    'in_progress',
    'paused',
    'completed',
    'cancelled'
);


ALTER TYPE public.enum_workout_sessions_status OWNER TO tu;

--
-- Name: emg_after_row_change(); Type: FUNCTION; Schema: public; Owner: tu
--

CREATE FUNCTION public.emg_after_row_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF (TG_OP = 'INSERT') THEN
          PERFORM refresh_exercise_muscle_combination(NEW.exercise_id);
        ELSIF (TG_OP = 'UPDATE') THEN
          IF NEW.exercise_id IS DISTINCT FROM OLD.exercise_id THEN
            PERFORM refresh_exercise_muscle_combination(OLD.exercise_id);
            PERFORM refresh_exercise_muscle_combination(NEW.exercise_id);
          ELSE
            PERFORM refresh_exercise_muscle_combination(NEW.exercise_id);
          END IF;
        ELSIF (TG_OP = 'DELETE') THEN
          PERFORM refresh_exercise_muscle_combination(OLD.exercise_id);
        END IF;
        RETURN NULL;
      END;
      $$;


ALTER FUNCTION public.emg_after_row_change() OWNER TO tu;

--
-- Name: refresh_exercise_muscle_combination(integer); Type: FUNCTION; Schema: public; Owner: tu
--

CREATE FUNCTION public.refresh_exercise_muscle_combination(ex_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
      BEGIN
        WITH agg AS (
          SELECT
            COALESCE(array_agg(emg.muscle_group_id ORDER BY emg.muscle_group_id), ARRAY[]::int[]) AS ids,
            COALESCE(string_agg(emg.muscle_group_id::text, ',' ORDER BY emg.muscle_group_id), '') AS ids_sorted,
            COALESCE(string_agg(mg.slug, ',' ORDER BY emg.muscle_group_id), '') AS slugs_sorted,
            COUNT(*) FILTER (WHERE emg.impact_level = 'primary') AS primary_count,
            COUNT(*) FILTER (WHERE emg.impact_level = 'secondary') AS secondary_count,
            COUNT(*) AS total_count
          FROM exercise_muscle_group emg
          LEFT JOIN muscle_groups mg ON mg.muscle_group_id = emg.muscle_group_id
          WHERE emg.exercise_id = ex_id
        )
        INSERT INTO exercise_muscle_combinations (
          exercise_id,
          muscle_group_ids_array,
          muscle_group_ids_sorted,
          muscle_group_slugs_sorted,
          primary_muscle_count,
          secondary_muscle_count,
          total_muscle_count,
          created_at,
          updated_at
        )
        VALUES (
          ex_id,
          (SELECT ids FROM agg),
          (SELECT ids_sorted FROM agg),
          (SELECT slugs_sorted FROM agg),
          (SELECT primary_count FROM agg),
          (SELECT secondary_count FROM agg),
          (SELECT total_count FROM agg),
          NOW(),
          NOW()
        )
        ON CONFLICT (exercise_id) DO UPDATE SET
          muscle_group_ids_array = EXCLUDED.muscle_group_ids_array,
          muscle_group_ids_sorted = EXCLUDED.muscle_group_ids_sorted,
          muscle_group_slugs_sorted = EXCLUDED.muscle_group_slugs_sorted,
          primary_muscle_count = EXCLUDED.primary_muscle_count,
          secondary_muscle_count = EXCLUDED.secondary_muscle_count,
          total_muscle_count = EXCLUDED.total_muscle_count,
          updated_at = NOW();
      END;
      $$;


ALTER FUNCTION public.refresh_exercise_muscle_combination(ex_id integer) OWNER TO tu;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO tu;

--
-- Name: ai_usage; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.ai_usage (
    usage_id integer NOT NULL,
    user_id integer,
    anon_key character varying(128),
    feature character varying(64) NOT NULL,
    period_key character varying(16) NOT NULL,
    count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ai_usage OWNER TO tu;

--
-- Name: ai_usage_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.ai_usage_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_usage_usage_id_seq OWNER TO tu;

--
-- Name: ai_usage_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.ai_usage_usage_id_seq OWNED BY public.ai_usage.usage_id;


--
-- Name: bug_reports; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.bug_reports (
    report_id integer NOT NULL,
    user_id integer,
    contact_email character varying(255),
    title character varying(255) NOT NULL,
    description text,
    steps text,
    severity character varying(32) DEFAULT 'medium'::character varying NOT NULL,
    status character varying(32) DEFAULT 'open'::character varying NOT NULL,
    screenshot_url text,
    admin_response text,
    responded_by integer,
    responded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bug_reports OWNER TO tu;

--
-- Name: bug_reports_report_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.bug_reports_report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bug_reports_report_id_seq OWNER TO tu;

--
-- Name: bug_reports_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.bug_reports_report_id_seq OWNED BY public.bug_reports.report_id;


--
-- Name: dashboard_review_comments; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.dashboard_review_comments (
    comment_id integer NOT NULL,
    review_id integer NOT NULL,
    user_id integer NOT NULL,
    display_name character varying(120) NOT NULL,
    user_role character varying(20) DEFAULT 'USER'::character varying NOT NULL,
    content text NOT NULL,
    media_urls jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.dashboard_review_comments OWNER TO tu;

--
-- Name: dashboard_review_comments_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.dashboard_review_comments_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dashboard_review_comments_comment_id_seq OWNER TO tu;

--
-- Name: dashboard_review_comments_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.dashboard_review_comments_comment_id_seq OWNED BY public.dashboard_review_comments.comment_id;


--
-- Name: dashboard_review_votes; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.dashboard_review_votes (
    vote_id integer NOT NULL,
    review_id integer NOT NULL,
    user_id integer NOT NULL,
    helpful boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.dashboard_review_votes OWNER TO tu;

--
-- Name: dashboard_review_votes_vote_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.dashboard_review_votes_vote_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dashboard_review_votes_vote_id_seq OWNER TO tu;

--
-- Name: dashboard_review_votes_vote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.dashboard_review_votes_vote_id_seq OWNED BY public.dashboard_review_votes.vote_id;


--
-- Name: dashboard_reviews; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.dashboard_reviews (
    review_id integer NOT NULL,
    user_id integer NOT NULL,
    display_name character varying(120) NOT NULL,
    headline character varying(160),
    comment text NOT NULL,
    rating integer NOT NULL,
    status character varying(20) DEFAULT 'published'::character varying NOT NULL,
    ip_address character varying(64),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    program character varying(160),
    tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    media_urls jsonb DEFAULT '[]'::jsonb NOT NULL,
    helpful_count integer DEFAULT 0 NOT NULL,
    comment_count integer DEFAULT 0 NOT NULL,
    CONSTRAINT dashboard_reviews_rating_chk CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT dashboard_reviews_status_chk CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'published'::character varying, 'hidden'::character varying])::text[])))
);


ALTER TABLE public.dashboard_reviews OWNER TO tu;

--
-- Name: dashboard_reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.dashboard_reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dashboard_reviews_review_id_seq OWNER TO tu;

--
-- Name: dashboard_reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.dashboard_reviews_review_id_seq OWNED BY public.dashboard_reviews.review_id;


--
-- Name: exercise_favorites; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.exercise_favorites (
    favorite_id integer NOT NULL,
    user_id integer NOT NULL,
    exercise_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.exercise_favorites OWNER TO tu;

--
-- Name: exercise_favorites_favorite_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.exercise_favorites_favorite_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercise_favorites_favorite_id_seq OWNER TO tu;

--
-- Name: exercise_favorites_favorite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.exercise_favorites_favorite_id_seq OWNED BY public.exercise_favorites.favorite_id;


--
-- Name: exercise_muscle_combinations; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.exercise_muscle_combinations (
    combination_id integer NOT NULL,
    exercise_id integer NOT NULL,
    muscle_group_ids_array integer[] NOT NULL,
    muscle_group_ids_sorted character varying(255) NOT NULL,
    muscle_group_slugs_sorted character varying(500),
    primary_muscle_count integer DEFAULT 0 NOT NULL,
    secondary_muscle_count integer DEFAULT 0 NOT NULL,
    total_muscle_count integer NOT NULL,
    combination_type character varying(50),
    complexity_score integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.exercise_muscle_combinations OWNER TO tu;

--
-- Name: exercise_muscle_combinations_combination_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.exercise_muscle_combinations_combination_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercise_muscle_combinations_combination_id_seq OWNER TO tu;

--
-- Name: exercise_muscle_combinations_combination_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.exercise_muscle_combinations_combination_id_seq OWNED BY public.exercise_muscle_combinations.combination_id;


--
-- Name: exercise_muscle_group; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.exercise_muscle_group (
    id integer NOT NULL,
    exercise_id integer NOT NULL,
    muscle_group_id integer NOT NULL,
    impact_level character varying(20) DEFAULT 'primary'::character varying NOT NULL,
    intensity_percentage integer,
    activation_note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT emg_impact_level_chk CHECK (((impact_level)::text = ANY ((ARRAY['primary'::character varying, 'secondary'::character varying, 'stabilizer'::character varying])::text[]))),
    CONSTRAINT emg_intensity_percentage_chk CHECK (((intensity_percentage IS NULL) OR ((intensity_percentage >= 0) AND (intensity_percentage <= 100))))
);


ALTER TABLE public.exercise_muscle_group OWNER TO tu;

--
-- Name: exercise_muscle_group_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.exercise_muscle_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercise_muscle_group_id_seq OWNER TO tu;

--
-- Name: exercise_muscle_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.exercise_muscle_group_id_seq OWNED BY public.exercise_muscle_group.id;


--
-- Name: exercise_steps; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.exercise_steps (
    step_id integer NOT NULL,
    exercise_id integer NOT NULL,
    step_number integer NOT NULL,
    title character varying(150),
    instruction_text text NOT NULL,
    media_url character varying(255),
    media_type character varying(20),
    focused_muscle_ids integer[],
    duration_seconds integer,
    CONSTRAINT exsteps_duration_nonneg_chk CHECK (((duration_seconds IS NULL) OR (duration_seconds >= 0))),
    CONSTRAINT exsteps_media_type_chk CHECK (((media_type IS NULL) OR ((media_type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying, 'gif'::character varying])::text[]))))
);


ALTER TABLE public.exercise_steps OWNER TO tu;

--
-- Name: exercise_steps_json; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.exercise_steps_json (
    exercise_id integer NOT NULL,
    steps jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.exercise_steps_json OWNER TO tu;

--
-- Name: exercise_steps_step_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.exercise_steps_step_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercise_steps_step_id_seq OWNER TO tu;

--
-- Name: exercise_steps_step_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.exercise_steps_step_id_seq OWNED BY public.exercise_steps.step_id;


--
-- Name: exercise_tips; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.exercise_tips (
    tip_id integer NOT NULL,
    exercise_id integer NOT NULL,
    tip_type character varying(30),
    title character varying(150),
    content text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT extips_tip_type_chk CHECK (((tip_type IS NULL) OR ((tip_type)::text = ANY ((ARRAY['common_mistake'::character varying, 'pro_tip'::character varying, 'safety'::character varying, 'breathing'::character varying])::text[]))))
);


ALTER TABLE public.exercise_tips OWNER TO tu;

--
-- Name: exercise_tips_tip_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.exercise_tips_tip_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercise_tips_tip_id_seq OWNER TO tu;

--
-- Name: exercise_tips_tip_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.exercise_tips_tip_id_seq OWNED BY public.exercise_tips.tip_id;


--
-- Name: exercise_videos; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.exercise_videos (
    id integer NOT NULL,
    exercise_id integer NOT NULL,
    video_url character varying(500) NOT NULL,
    title character varying(255),
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.exercise_videos OWNER TO tu;

--
-- Name: exercise_videos_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.exercise_videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercise_videos_id_seq OWNER TO tu;

--
-- Name: exercise_videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.exercise_videos_id_seq OWNED BY public.exercise_videos.id;


--
-- Name: exercises; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.exercises (
    exercise_id integer NOT NULL,
    name character varying(255) NOT NULL,
    name_en character varying(255),
    slug character varying(255) NOT NULL,
    description text,
    difficulty_level character varying(50),
    exercise_type character varying(50),
    equipment_needed character varying(255),
    primary_video_url character varying(255),
    thumbnail_url character varying(255),
    gif_demo_url character varying(255),
    duration_minutes integer,
    calories_per_rep numeric(4,2),
    popularity_score integer DEFAULT 0 NOT NULL,
    is_public boolean DEFAULT true NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    source_name character varying(150),
    source_url character varying(500),
    is_verified boolean DEFAULT false NOT NULL,
    video_url character varying(500),
    instructions jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT exercises_calories_nonneg_chk CHECK (((calories_per_rep IS NULL) OR (calories_per_rep >= (0)::numeric))),
    CONSTRAINT exercises_difficulty_level_chk CHECK (((difficulty_level IS NULL) OR ((difficulty_level)::text = ANY ((ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying])::text[])))),
    CONSTRAINT exercises_duration_nonneg_chk CHECK (((duration_minutes IS NULL) OR (duration_minutes >= 0))),
    CONSTRAINT exercises_exercise_type_chk CHECK (((exercise_type IS NULL) OR ((exercise_type)::text = ANY ((ARRAY['compound'::character varying, 'isolation'::character varying, 'cardio'::character varying, 'flexibility'::character varying])::text[]))))
);


ALTER TABLE public.exercises OWNER TO tu;

--
-- Name: COLUMN exercises.video_url; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.exercises.video_url IS 'Link video MP4/M3U8 được host trên Cloud (AWS/Cloudinary)';


--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.exercises_exercise_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercises_exercise_id_seq OWNER TO tu;

--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.exercises_exercise_id_seq OWNED BY public.exercises.exercise_id;


--
-- Name: image_exercise; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.image_exercise (
    image_id integer NOT NULL,
    exercise_id integer NOT NULL,
    image_url character varying(255) NOT NULL,
    image_type character varying(30),
    alt_text character varying(255),
    width integer,
    height integer,
    display_order integer DEFAULT 0 NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT img_ex_display_nonneg_chk CHECK ((display_order >= 0)),
    CONSTRAINT img_ex_type_chk CHECK (((image_type IS NULL) OR ((image_type)::text = ANY ((ARRAY['cover'::character varying, 'gallery'::character varying, 'gif'::character varying, 'thumbnail'::character varying])::text[])))),
    CONSTRAINT img_ex_wh_nonneg_chk CHECK ((((width IS NULL) OR (width >= 0)) AND ((height IS NULL) OR (height >= 0))))
);


ALTER TABLE public.image_exercise OWNER TO tu;

--
-- Name: image_exercise_image_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.image_exercise_image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.image_exercise_image_id_seq OWNER TO tu;

--
-- Name: image_exercise_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.image_exercise_image_id_seq OWNED BY public.image_exercise.image_id;


--
-- Name: login_history; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.login_history (
    login_id integer NOT NULL,
    user_id integer NOT NULL,
    ip_address character varying(64),
    user_agent text,
    os character varying(64),
    browser character varying(64),
    device character varying(64),
    city character varying(128),
    country character varying(64),
    success boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.login_history OWNER TO tu;

--
-- Name: login_history_login_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.login_history_login_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_history_login_id_seq OWNER TO tu;

--
-- Name: login_history_login_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.login_history_login_id_seq OWNED BY public.login_history.login_id;


--
-- Name: muscle_groups; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.muscle_groups (
    muscle_group_id integer NOT NULL,
    name character varying(100) NOT NULL,
    name_en character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    model_identifier character varying(100),
    mesh_ids jsonb,
    highlight_color character varying(7),
    model_position jsonb,
    parent_id integer,
    level integer DEFAULT 0 NOT NULL,
    display_priority integer DEFAULT 0 NOT NULL,
    is_selectable boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.muscle_groups OWNER TO tu;

--
-- Name: muscle_groups_muscle_group_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.muscle_groups_muscle_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.muscle_groups_muscle_group_id_seq OWNER TO tu;

--
-- Name: muscle_groups_muscle_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.muscle_groups_muscle_group_id_seq OWNED BY public.muscle_groups.muscle_group_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(64) DEFAULT 'general'::character varying NOT NULL,
    title character varying(255) NOT NULL,
    body text,
    metadata jsonb,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO tu;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO tu;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: onboarding_answers; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.onboarding_answers (
    answer_id integer NOT NULL,
    session_id uuid NOT NULL,
    step_id integer NOT NULL,
    answers jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.onboarding_answers OWNER TO tu;

--
-- Name: onboarding_answers_answer_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.onboarding_answers_answer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.onboarding_answers_answer_id_seq OWNER TO tu;

--
-- Name: onboarding_answers_answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.onboarding_answers_answer_id_seq OWNED BY public.onboarding_answers.answer_id;


--
-- Name: onboarding_fields; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.onboarding_fields (
    field_id integer NOT NULL,
    step_id integer NOT NULL,
    field_key character varying(50) NOT NULL,
    label character varying(120) NOT NULL,
    input_type character varying(30) NOT NULL,
    required boolean DEFAULT true NOT NULL,
    order_index integer,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.onboarding_fields OWNER TO tu;

--
-- Name: onboarding_fields_field_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.onboarding_fields_field_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.onboarding_fields_field_id_seq OWNER TO tu;

--
-- Name: onboarding_fields_field_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.onboarding_fields_field_id_seq OWNED BY public.onboarding_fields.field_id;


--
-- Name: onboarding_sessions; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.onboarding_sessions (
    session_id uuid NOT NULL,
    user_id integer NOT NULL,
    current_step_key character varying(50),
    is_completed boolean DEFAULT false NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.onboarding_sessions OWNER TO tu;

--
-- Name: onboarding_steps; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.onboarding_steps (
    step_id integer NOT NULL,
    step_key character varying(50) NOT NULL,
    title character varying(120) NOT NULL,
    order_index integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.onboarding_steps OWNER TO tu;

--
-- Name: onboarding_steps_step_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.onboarding_steps_step_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.onboarding_steps_step_id_seq OWNER TO tu;

--
-- Name: onboarding_steps_step_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.onboarding_steps_step_id_seq OWNED BY public.onboarding_steps.step_id;


--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.password_resets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_resets OWNER TO tu;

--
-- Name: password_resets_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.password_resets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_resets_id_seq OWNER TO tu;

--
-- Name: password_resets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.password_resets_id_seq OWNED BY public.password_resets.id;


--
-- Name: plan_exercise_details; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.plan_exercise_details (
    plan_exercise_id integer NOT NULL,
    plan_id integer NOT NULL,
    exercise_id integer NOT NULL,
    session_order integer,
    sets_recommended integer,
    reps_recommended character varying(50),
    rest_period_seconds integer
);


ALTER TABLE public.plan_exercise_details OWNER TO tu;

--
-- Name: plan_exercise_details_plan_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.plan_exercise_details_plan_exercise_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plan_exercise_details_plan_exercise_id_seq OWNER TO tu;

--
-- Name: plan_exercise_details_plan_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.plan_exercise_details_plan_exercise_id_seq OWNED BY public.plan_exercise_details.plan_exercise_id;


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.subscription_plans (
    plan_id integer NOT NULL,
    name character varying(120) NOT NULL,
    slug character varying(120) NOT NULL,
    price integer NOT NULL,
    duration_days integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subscription_plans OWNER TO tu;

--
-- Name: subscription_plans_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.subscription_plans_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscription_plans_plan_id_seq OWNER TO tu;

--
-- Name: subscription_plans_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.subscription_plans_plan_id_seq OWNED BY public.subscription_plans.plan_id;


--
-- Name: system_content; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.system_content (
    key character varying(50) NOT NULL,
    type character varying(20) DEFAULT 'json'::character varying,
    content jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by integer
);


ALTER TABLE public.system_content OWNER TO tu;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.transactions (
    transaction_id integer NOT NULL,
    user_id integer NOT NULL,
    plan_id integer NOT NULL,
    amount integer NOT NULL,
    status public.enum_transactions_status DEFAULT 'pending'::public.enum_transactions_status NOT NULL,
    payos_order_code character varying(64) NOT NULL,
    payos_payment_id character varying(64),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transactions OWNER TO tu;

--
-- Name: transactions_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.transactions_transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_transaction_id_seq OWNER TO tu;

--
-- Name: transactions_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.transactions_transaction_id_seq OWNED BY public.transactions.transaction_id;


--
-- Name: user_screenshots; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.user_screenshots (
    id integer NOT NULL,
    user_id integer NOT NULL,
    object_key character varying(500) NOT NULL,
    feature character varying(50) NOT NULL,
    description text,
    metadata jsonb,
    is_favorite boolean DEFAULT false NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_screenshots OWNER TO tu;

--
-- Name: user_screenshots_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.user_screenshots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_screenshots_id_seq OWNER TO tu;

--
-- Name: user_screenshots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.user_screenshots_id_seq OWNED BY public.user_screenshots.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    full_name character varying(100),
    avatar_url character varying(255),
    date_of_birth timestamp with time zone,
    gender public.enum_users_gender,
    provider character varying(50) DEFAULT 'local'::character varying NOT NULL,
    provider_id character varying(255),
    role public.enum_users_role DEFAULT 'USER'::public.enum_users_role NOT NULL,
    status public.enum_users_status DEFAULT 'ACTIVE'::public.enum_users_status NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    phone character varying(20),
    plan public.enum_users_plan DEFAULT 'FREE'::public.enum_users_plan NOT NULL,
    onboarding_completed_at timestamp with time zone,
    is_locked boolean DEFAULT false NOT NULL,
    locked_at timestamp with time zone,
    lock_reason character varying(255),
    is_super_admin boolean DEFAULT false NOT NULL,
    parent_admin_id integer,
    last_active_at timestamp with time zone,
    user_exp_date timestamp with time zone,
    user_type character varying(32) DEFAULT 'free'::character varying NOT NULL,
    login_streak integer DEFAULT 0 NOT NULL,
    max_login_streak integer DEFAULT 0 NOT NULL,
    login_streak_updated_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO tu;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO tu;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: workout_plans; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.workout_plans (
    plan_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    creator_id integer,
    difficulty_level character varying(50),
    is_public boolean
);


ALTER TABLE public.workout_plans OWNER TO tu;

--
-- Name: workout_plans_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.workout_plans_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workout_plans_plan_id_seq OWNER TO tu;

--
-- Name: workout_plans_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.workout_plans_plan_id_seq OWNED BY public.workout_plans.plan_id;


--
-- Name: workout_session_exercises; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.workout_session_exercises (
    session_exercise_id integer NOT NULL,
    session_id integer NOT NULL,
    plan_exercise_id integer,
    exercise_id integer NOT NULL,
    session_order integer NOT NULL,
    target_sets integer,
    target_reps character varying(50),
    target_rest_seconds integer,
    completed_sets integer DEFAULT 0 NOT NULL,
    status public.enum_workout_session_exercises_status DEFAULT 'pending'::public.enum_workout_session_exercises_status NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT wse_completed_sets_nonneg CHECK ((completed_sets >= 0)),
    CONSTRAINT wse_target_rest_nonneg CHECK (((target_rest_seconds IS NULL) OR (target_rest_seconds >= 0))),
    CONSTRAINT wse_target_sets_nonneg CHECK (((target_sets IS NULL) OR (target_sets >= 0)))
);


ALTER TABLE public.workout_session_exercises OWNER TO tu;

--
-- Name: COLUMN workout_session_exercises.plan_exercise_id; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_session_exercises.plan_exercise_id IS 'Link back to original plan exercise for history tracking';


--
-- Name: COLUMN workout_session_exercises.session_order; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_session_exercises.session_order IS 'Order of exercise in this session (1, 2, 3, ...)';


--
-- Name: COLUMN workout_session_exercises.target_sets; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_session_exercises.target_sets IS 'Planned number of sets';


--
-- Name: COLUMN workout_session_exercises.target_reps; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_session_exercises.target_reps IS 'Planned reps (e.g., "10-12", "8", "AMRAP")';


--
-- Name: COLUMN workout_session_exercises.target_rest_seconds; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_session_exercises.target_rest_seconds IS 'Planned rest time between sets';


--
-- Name: COLUMN workout_session_exercises.completed_sets; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_session_exercises.completed_sets IS 'Number of sets actually completed';


--
-- Name: workout_session_exercises_session_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.workout_session_exercises_session_exercise_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workout_session_exercises_session_exercise_id_seq OWNER TO tu;

--
-- Name: workout_session_exercises_session_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.workout_session_exercises_session_exercise_id_seq OWNED BY public.workout_session_exercises.session_exercise_id;


--
-- Name: workout_session_sets; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.workout_session_sets (
    set_id integer NOT NULL,
    session_exercise_id integer NOT NULL,
    set_index integer NOT NULL,
    actual_reps integer,
    actual_weight_kg numeric(10,2),
    rest_seconds integer,
    completed_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT wss_actual_reps_nonneg CHECK (((actual_reps IS NULL) OR (actual_reps >= 0))),
    CONSTRAINT wss_actual_weight_nonneg CHECK (((actual_weight_kg IS NULL) OR (actual_weight_kg >= (0)::numeric))),
    CONSTRAINT wss_rest_nonneg CHECK (((rest_seconds IS NULL) OR (rest_seconds >= 0))),
    CONSTRAINT wss_set_index_pos CHECK ((set_index > 0))
);


ALTER TABLE public.workout_session_sets OWNER TO tu;

--
-- Name: COLUMN workout_session_sets.set_index; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_session_sets.set_index IS 'Set number (1, 2, 3, ...)';


--
-- Name: COLUMN workout_session_sets.actual_reps; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_session_sets.actual_reps IS 'Actual reps completed';


--
-- Name: COLUMN workout_session_sets.actual_weight_kg; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_session_sets.actual_weight_kg IS 'Actual weight used in kg';


--
-- Name: COLUMN workout_session_sets.rest_seconds; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_session_sets.rest_seconds IS 'Actual rest time taken after this set';


--
-- Name: COLUMN workout_session_sets.completed_at; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_session_sets.completed_at IS 'Timestamp when set was completed';


--
-- Name: COLUMN workout_session_sets.notes; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_session_sets.notes IS 'Optional notes for this set';


--
-- Name: workout_session_sets_set_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.workout_session_sets_set_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workout_session_sets_set_id_seq OWNER TO tu;

--
-- Name: workout_session_sets_set_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.workout_session_sets_set_id_seq OWNED BY public.workout_session_sets.set_id;


--
-- Name: workout_sessions; Type: TABLE; Schema: public; Owner: tu
--

CREATE TABLE public.workout_sessions (
    session_id integer NOT NULL,
    user_id integer NOT NULL,
    plan_id integer,
    status public.enum_workout_sessions_status DEFAULT 'in_progress'::public.enum_workout_sessions_status NOT NULL,
    started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at timestamp with time zone,
    total_duration_seconds integer,
    current_exercise_index integer DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ws_current_index_nonneg CHECK (((current_exercise_index IS NULL) OR (current_exercise_index >= 0))),
    CONSTRAINT ws_total_duration_nonneg CHECK (((total_duration_seconds IS NULL) OR (total_duration_seconds >= 0)))
);


ALTER TABLE public.workout_sessions OWNER TO tu;

--
-- Name: COLUMN workout_sessions.total_duration_seconds; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_sessions.total_duration_seconds IS 'Total workout duration in seconds';


--
-- Name: COLUMN workout_sessions.current_exercise_index; Type: COMMENT; Schema: public; Owner: tu
--

COMMENT ON COLUMN public.workout_sessions.current_exercise_index IS 'Index of current exercise being performed (0-based)';


--
-- Name: workout_sessions_session_id_seq; Type: SEQUENCE; Schema: public; Owner: tu
--

CREATE SEQUENCE public.workout_sessions_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workout_sessions_session_id_seq OWNER TO tu;

--
-- Name: workout_sessions_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tu
--

ALTER SEQUENCE public.workout_sessions_session_id_seq OWNED BY public.workout_sessions.session_id;


--
-- Name: ai_usage usage_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.ai_usage ALTER COLUMN usage_id SET DEFAULT nextval('public.ai_usage_usage_id_seq'::regclass);


--
-- Name: bug_reports report_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.bug_reports ALTER COLUMN report_id SET DEFAULT nextval('public.bug_reports_report_id_seq'::regclass);


--
-- Name: dashboard_review_comments comment_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.dashboard_review_comments ALTER COLUMN comment_id SET DEFAULT nextval('public.dashboard_review_comments_comment_id_seq'::regclass);


--
-- Name: dashboard_review_votes vote_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.dashboard_review_votes ALTER COLUMN vote_id SET DEFAULT nextval('public.dashboard_review_votes_vote_id_seq'::regclass);


--
-- Name: dashboard_reviews review_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.dashboard_reviews ALTER COLUMN review_id SET DEFAULT nextval('public.dashboard_reviews_review_id_seq'::regclass);


--
-- Name: exercise_favorites favorite_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_favorites ALTER COLUMN favorite_id SET DEFAULT nextval('public.exercise_favorites_favorite_id_seq'::regclass);


--
-- Name: exercise_muscle_combinations combination_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_muscle_combinations ALTER COLUMN combination_id SET DEFAULT nextval('public.exercise_muscle_combinations_combination_id_seq'::regclass);


--
-- Name: exercise_muscle_group id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_muscle_group ALTER COLUMN id SET DEFAULT nextval('public.exercise_muscle_group_id_seq'::regclass);


--
-- Name: exercise_steps step_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_steps ALTER COLUMN step_id SET DEFAULT nextval('public.exercise_steps_step_id_seq'::regclass);


--
-- Name: exercise_tips tip_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_tips ALTER COLUMN tip_id SET DEFAULT nextval('public.exercise_tips_tip_id_seq'::regclass);


--
-- Name: exercise_videos id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_videos ALTER COLUMN id SET DEFAULT nextval('public.exercise_videos_id_seq'::regclass);


--
-- Name: exercises exercise_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercises ALTER COLUMN exercise_id SET DEFAULT nextval('public.exercises_exercise_id_seq'::regclass);


--
-- Name: image_exercise image_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.image_exercise ALTER COLUMN image_id SET DEFAULT nextval('public.image_exercise_image_id_seq'::regclass);


--
-- Name: login_history login_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.login_history ALTER COLUMN login_id SET DEFAULT nextval('public.login_history_login_id_seq'::regclass);


--
-- Name: muscle_groups muscle_group_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.muscle_groups ALTER COLUMN muscle_group_id SET DEFAULT nextval('public.muscle_groups_muscle_group_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: onboarding_answers answer_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_answers ALTER COLUMN answer_id SET DEFAULT nextval('public.onboarding_answers_answer_id_seq'::regclass);


--
-- Name: onboarding_fields field_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_fields ALTER COLUMN field_id SET DEFAULT nextval('public.onboarding_fields_field_id_seq'::regclass);


--
-- Name: onboarding_steps step_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_steps ALTER COLUMN step_id SET DEFAULT nextval('public.onboarding_steps_step_id_seq'::regclass);


--
-- Name: password_resets id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.password_resets ALTER COLUMN id SET DEFAULT nextval('public.password_resets_id_seq'::regclass);


--
-- Name: plan_exercise_details plan_exercise_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.plan_exercise_details ALTER COLUMN plan_exercise_id SET DEFAULT nextval('public.plan_exercise_details_plan_exercise_id_seq'::regclass);


--
-- Name: subscription_plans plan_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN plan_id SET DEFAULT nextval('public.subscription_plans_plan_id_seq'::regclass);


--
-- Name: transactions transaction_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.transactions ALTER COLUMN transaction_id SET DEFAULT nextval('public.transactions_transaction_id_seq'::regclass);


--
-- Name: user_screenshots id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.user_screenshots ALTER COLUMN id SET DEFAULT nextval('public.user_screenshots_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: workout_plans plan_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_plans ALTER COLUMN plan_id SET DEFAULT nextval('public.workout_plans_plan_id_seq'::regclass);


--
-- Name: workout_session_exercises session_exercise_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_session_exercises ALTER COLUMN session_exercise_id SET DEFAULT nextval('public.workout_session_exercises_session_exercise_id_seq'::regclass);


--
-- Name: workout_session_sets set_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_session_sets ALTER COLUMN set_id SET DEFAULT nextval('public.workout_session_sets_set_id_seq'::regclass);


--
-- Name: workout_sessions session_id; Type: DEFAULT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_sessions ALTER COLUMN session_id SET DEFAULT nextval('public.workout_sessions_session_id_seq'::regclass);


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public."SequelizeMeta" (name) FROM stdin;
20250918064015-create-users-table.js
20250920091500-add-phone-to-users.js
20250923130122-add-trainer-role-and-plan-to-users.js
20250924061004-insert-admin.js
20250925080000-create-password-resets.js
20250927182743-create-onboarding-steps.js
20250927183433-create-onboarding-fields.js
20250927183603-create-onboarding-sessions.js
20250927183714-create-onboarding-answers.js
20250927185345-add-onboarding-completed-to-users.js
20250927185533-enable-pgcrypto.js
20250928060355-seed-onboarding-age.js
20250928070000-seed-onboarding-core-steps.js
20250930000000-add-lock-fields-to-users.js
20250930123274-add-isLocked-to-users.js
20251000318429-add-subadmin-fields.js
20251001000000-remove-isLocked-from-users.js
20251001090000-create-exercise-and-workout-schema.js
20251001090500-seed-parent-muscle-groups.js
20251001091500-seed-child-muscle-groups.js
20251002113000-promote-super-admin.js
20251005-add-last-active-at-to-users.js
20251012000000-create-exercises-table.js
20251013090000-add-exercise-steps-json.js
20251023093000-create-image-exercise.js
20251023113000-add-exercise-source-fields.js
20251026090000-create-login-history.js
20251026094500-drop-user-workout-log-tables.js
20251027002049-create-workout-tracking-table.js
20251027013000-alter-workout-tracking-tables.js
20251028000000-create-exercise-favorites.js
20251028034602-create-exercise-favorites.js
20251028145000-create-ai-usage.js
20251029090000-add-user-exp-date-and-user-type.js
20251029090500-create-subscription-plans.js
20251029091000-create-transactions.js
20251029092000-seed-subscription-plans.js
20251031125000-create-dashboard-reviews.js
20251101090000-add-login-streak-columns.js
20251101090000-create-bug-reports.js
20251101093000-create-notifications.js
20251106090000-add-unique-index-exercise-favorites.js
20251115181419-create-user-secreenshots.js
202511160001-alter-dashboard-reviews-add-columns.js
202511160002-create-dashboard-review-comments.js
202511160003-create-dashboard-review-votes.js
20251130082759-add-video-to-exercise.js
20251202113646-create-table-video-exercise.js
20251210040817-create-table-system-content.js
20260225000000-add-instructions-column.js
\.


--
-- Data for Name: ai_usage; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.ai_usage (usage_id, user_id, anon_key, feature, period_key, count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: bug_reports; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.bug_reports (report_id, user_id, contact_email, title, description, steps, severity, status, screenshot_url, admin_response, responded_by, responded_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dashboard_review_comments; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.dashboard_review_comments (comment_id, review_id, user_id, display_name, user_role, content, media_urls, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dashboard_review_votes; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.dashboard_review_votes (vote_id, review_id, user_id, helpful, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dashboard_reviews; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.dashboard_reviews (review_id, user_id, display_name, headline, comment, rating, status, ip_address, created_at, updated_at, program, tags, media_urls, helpful_count, comment_count) FROM stdin;
\.


--
-- Data for Name: exercise_favorites; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.exercise_favorites (favorite_id, user_id, exercise_id, created_at) FROM stdin;
\.


--
-- Data for Name: exercise_muscle_combinations; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.exercise_muscle_combinations (combination_id, exercise_id, muscle_group_ids_array, muscle_group_ids_sorted, muscle_group_slugs_sorted, primary_muscle_count, secondary_muscle_count, total_muscle_count, combination_type, complexity_score, created_at, updated_at) FROM stdin;
1263	415	{17}	17	posterior-delts	1	0	1	\N	\N	2026-03-05 10:10:48.037387+00	2026-03-06 11:05:10.251957+00
64	16	{29,31}	29,31	quads,glutes	2	0	2	\N	\N	2026-03-03 13:51:52.752727+00	2026-03-05 10:41:48.760535+00
1266	417	{9}	9	lower-chest	1	0	1	\N	\N	2026-03-05 10:10:48.069385+00	2026-03-06 11:09:09.95778+00
88	21	{30,31}	30,31	hamstrings,glutes	2	0	2	\N	\N	2026-03-03 13:52:39.459835+00	2026-03-05 10:41:48.779533+00
1260	413	{26,27}	26,27	abs,obliques	2	0	2	\N	\N	2026-03-05 10:10:48.005662+00	2026-03-06 11:10:02.753674+00
180	39	{31}	31	glutes	1	0	1	\N	\N	2026-03-03 13:55:47.568811+00	2026-03-05 10:41:48.798872+00
181	40	{10}	10	lats	1	0	1	\N	\N	2026-03-03 13:55:47.589073+00	2026-03-05 10:41:48.81871+00
1264	416	{7,15}	7,15	upper-chest,anterior-delts	1	1	2	\N	\N	2026-03-05 10:10:48.05173+00	2026-03-06 11:11:04.063496+00
182	41	{10}	10	lats	1	0	1	\N	\N	2026-03-03 13:55:47.610491+00	2026-03-05 10:41:48.835375+00
1262	414	{27}	27	obliques	1	0	1	\N	\N	2026-03-05 10:10:48.02263+00	2026-03-06 11:12:33.761133+00
337	97	{8}	8	mid-chest	1	0	1	\N	\N	2026-03-03 15:03:59.171185+00	2026-03-06 11:21:38.643433+00
183	42	{15,16}	15,16	anterior-delts,lateral-delts	2	0	2	\N	\N	2026-03-03 13:55:47.630756+00	2026-03-05 10:41:48.85027+00
1	1	{8,15,23}	8,15,23	mid-chest,anterior-delts,triceps	1	2	3	\N	\N	2026-03-03 13:39:02.028723+00	2026-03-05 10:41:48.67715+00
185	43	{16}	16	lateral-delts	1	0	1	\N	\N	2026-03-03 13:55:47.654401+00	2026-03-05 10:41:48.869254+00
4	2	{8,15,23}	8,15,23	mid-chest,anterior-delts,triceps	1	2	3	\N	\N	2026-03-03 13:39:02.193828+00	2026-03-05 10:41:48.716098+00
262	64	{20}	20	biceps	1	0	1	\N	\N	2026-03-03 14:19:55.875609+00	2026-03-05 10:41:48.884362+00
7	3	{8,15,23}	8,15,23	mid-chest,anterior-delts,triceps	1	2	3	\N	\N	2026-03-03 13:39:02.222186+00	2026-03-05 10:41:48.73997+00
263	65	{20}	20	biceps	1	0	1	\N	\N	2026-03-03 14:19:55.88478+00	2026-03-05 10:41:48.896256+00
264	66	{23}	23	triceps	1	0	1	\N	\N	2026-03-03 14:19:55.893082+00	2026-03-05 10:41:48.908414+00
265	67	{23}	23	triceps	1	0	1	\N	\N	2026-03-03 14:19:55.903393+00	2026-03-06 10:17:48.283398+00
266	68	{26}	26	abs	1	0	1	\N	\N	2026-03-03 14:19:55.913527+00	2026-03-05 10:41:48.932472+00
330	94	{7,15}	7,15	upper-chest,anterior-delts	1	1	2	\N	\N	2026-03-03 15:03:59.130204+00	2026-03-06 10:27:31.79551+00
268	70	{24}	24	forearms	1	0	1	\N	\N	2026-03-03 14:19:55.93073+00	2026-03-05 10:41:48.963249+00
434	133	{30}	30	hamstrings	1	0	1	\N	\N	2026-03-03 15:04:42.210002+00	2026-03-06 10:34:14.556592+00
269	71	{24}	24	forearms	1	0	1	\N	\N	2026-03-03 14:19:55.938418+00	2026-03-05 10:41:48.976625+00
439	136	{26}	26	abs	1	0	1	\N	\N	2026-03-03 15:04:42.247679+00	2026-03-06 10:38:57.601649+00
270	72	{36}	36	calves	1	0	1	\N	\N	2026-03-03 14:19:55.946448+00	2026-03-05 10:41:48.987592+00
578	180	{8}	8	mid-chest	1	0	1	\N	\N	2026-03-05 09:45:04.815755+00	2026-03-06 11:14:56.007649+00
271	73	{36}	36	calves	1	0	1	\N	\N	2026-03-03 14:19:55.954902+00	2026-03-05 10:41:49.000904+00
437	135	{29,31}	29,31	quads,glutes	2	0	2	\N	\N	2026-03-03 15:04:42.231921+00	2026-03-06 10:43:52.323831+00
433	132	{11}	11	traps	1	0	1	\N	\N	2026-03-03 15:04:42.199705+00	2026-03-06 10:45:42.398005+00
332	95	{10}	10	lats	1	0	1	\N	\N	2026-03-03 15:03:59.143652+00	2026-03-05 10:41:49.0253+00
435	134	{9,23}	9,23	lower-chest,triceps	1	1	2	\N	\N	2026-03-03 15:04:42.22051+00	2026-03-06 10:48:14.033983+00
339	99	{29,31}	29,31	quads,glutes	1	1	2	\N	\N	2026-03-03 15:03:59.195031+00	2026-03-05 10:41:49.076001+00
267	69	{26}	26	abs	1	0	1	\N	\N	2026-03-03 14:19:55.922424+00	2026-03-06 10:49:45.63347+00
334	96	{13,30,31}	13,30,31	lower-back,hamstrings,glutes	2	1	3	\N	\N	2026-03-03 15:03:59.156285+00	2026-03-05 10:41:49.035892+00
338	98	{15}	15	anterior-delts	1	0	1	\N	\N	2026-03-03 15:03:59.183777+00	2026-03-05 10:41:49.065106+00
341	100	{29}	29	quads	1	0	1	\N	\N	2026-03-03 15:03:59.207761+00	2026-03-05 10:41:49.089611+00
342	101	{27}	27	obliques	1	0	1	\N	\N	2026-03-03 15:03:59.21883+00	2026-03-05 10:41:49.102135+00
343	102	{11,17}	11,17	traps,posterior-delts	1	1	2	\N	\N	2026-03-03 15:03:59.232763+00	2026-03-05 10:41:49.118872+00
568	175	{10}	10	lats	1	0	1	\N	\N	2026-03-05 09:45:04.719885+00	2026-03-05 10:41:49.283806+00
560	171	{15,16,23}	15,16,23	anterior-delts,lateral-delts,triceps	2	1	3	\N	\N	2026-03-05 09:45:04.64905+00	2026-03-05 10:41:49.213383+00
563	172	{16}	16	lateral-delts	1	0	1	\N	\N	2026-03-05 09:45:04.670356+00	2026-03-05 10:41:49.232443+00
564	173	{11,15}	11,15	traps,anterior-delts	1	1	2	\N	\N	2026-03-05 09:45:04.686736+00	2026-03-05 10:41:49.24901+00
566	174	{11,17}	11,17	traps,posterior-delts	1	1	2	\N	\N	2026-03-05 09:45:04.703872+00	2026-03-05 10:41:49.266578+00
569	176	{13,30,31}	13,30,31	lower-back,hamstrings,glutes	2	1	3	\N	\N	2026-03-05 09:45:04.734786+00	2026-03-05 10:41:49.29847+00
572	177	{10,11}	10,11	lats,traps	2	0	2	\N	\N	2026-03-05 09:45:04.753968+00	2026-03-05 10:41:49.316936+00
575	178	{7,15}	7,15	upper-chest,anterior-delts	1	1	2	\N	\N	2026-03-05 09:45:04.778313+00	2026-03-05 10:41:49.333625+00
577	179	{8}	8	mid-chest	1	0	1	\N	\N	2026-03-05 09:45:04.798049+00	2026-03-05 10:41:49.348923+00
603	198	{23}	23	triceps	1	0	1	\N	\N	2026-03-05 09:45:05.102174+00	2026-03-06 10:55:05.365626+00
600	195	{26}	26	abs	1	0	1	\N	\N	2026-03-05 09:45:05.055822+00	2026-03-05 10:41:49.567072+00
579	181	{9,15,23}	9,15,23	lower-chest,anterior-delts,triceps	1	2	3	\N	\N	2026-03-05 09:45:04.831398+00	2026-03-06 11:18:05.777597+00
821	269	{1,26,29}	1,26,29	chest,abs,quads	2	1	3	\N	\N	2026-03-05 09:46:14.957554+00	2026-03-06 10:56:04.041206+00
601	196	{36}	36	calves	1	0	1	\N	\N	2026-03-05 09:45:05.068758+00	2026-03-05 10:41:49.579143+00
582	182	{20,24}	20,24	biceps,forearms	2	0	2	\N	\N	2026-03-05 09:45:04.855661+00	2026-03-05 10:41:49.390371+00
588	185	{20}	20	biceps	1	0	1	\N	\N	2026-03-05 09:45:04.909323+00	2026-03-06 10:57:41.595074+00
602	197	{20}	20	biceps	1	0	1	\N	\N	2026-03-05 09:45:05.085823+00	2026-03-06 10:59:00.401545+00
585	183	{15,23}	15,23	anterior-delts,triceps	1	1	2	\N	\N	2026-03-05 09:45:04.874565+00	2026-03-05 10:41:49.405574+00
827	272	{31}	31	glutes	1	0	1	\N	\N	2026-03-05 09:46:15.004792+00	2026-03-06 11:01:57.515981+00
587	184	{23}	23	triceps	1	0	1	\N	\N	2026-03-05 09:45:04.893997+00	2026-03-06 11:06:36.406263+00
609	201	{10}	10	lats	1	0	1	\N	\N	2026-03-05 09:45:05.155191+00	2026-03-06 11:13:53.420372+00
589	186	{26}	26	abs	1	0	1	\N	\N	2026-03-05 09:45:04.923048+00	2026-03-05 10:41:49.453218+00
596	192	{23}	23	triceps	1	0	1	\N	\N	2026-03-05 09:45:05.00805+00	2026-03-06 11:16:24.048501+00
590	187	{26}	26	abs	1	0	1	\N	\N	2026-03-05 09:45:04.938431+00	2026-03-05 10:41:49.466869+00
591	188	{36}	36	calves	1	0	1	\N	\N	2026-03-05 09:45:04.952153+00	2026-03-05 10:41:49.479745+00
824	270	{13,31}	13,31	lower-back,glutes	1	1	2	\N	\N	2026-03-05 09:46:14.976745+00	2026-03-06 11:17:03.918314+00
592	189	{11}	11	traps	1	0	1	\N	\N	2026-03-05 09:45:04.964172+00	2026-03-05 10:41:49.491481+00
593	190	{11,16}	11,16	traps,lateral-delts	1	1	2	\N	\N	2026-03-05 09:45:04.976215+00	2026-03-05 10:41:49.503628+00
595	191	{24}	24	forearms	1	0	1	\N	\N	2026-03-05 09:45:04.992688+00	2026-03-05 10:41:49.517554+00
597	193	{26}	26	abs	1	0	1	\N	\N	2026-03-05 09:45:05.024217+00	2026-03-05 10:41:49.541108+00
598	194	{5,26}	5,26	core,abs	2	0	2	\N	\N	2026-03-05 09:45:05.039658+00	2026-03-05 10:41:49.553741+00
604	199	{13,30,31}	13,30,31	lower-back,hamstrings,glutes	2	1	3	\N	\N	2026-03-05 09:45:05.116547+00	2026-03-05 10:41:49.616165+00
607	200	{29,31}	29,31	quads,glutes	2	0	2	\N	\N	2026-03-05 09:45:05.137276+00	2026-03-05 10:41:49.633517+00
611	202	{8,10}	8,10	mid-chest,lats	2	0	2	\N	\N	2026-03-05 09:45:05.172182+00	2026-03-05 10:41:49.659653+00
826	271	{31}	31	glutes	1	0	1	\N	\N	2026-03-05 09:46:14.990183+00	2026-03-05 10:41:49.702882+00
\.


--
-- Data for Name: exercise_muscle_group; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.exercise_muscle_group (id, exercise_id, muscle_group_id, impact_level, intensity_percentage, activation_note, created_at) FROM stdin;
933	67	23	primary	\N	\N	2026-03-06 10:17:48.283398+00
934	94	7	primary	\N	\N	2026-03-06 10:27:31.79551+00
935	94	15	secondary	\N	\N	2026-03-06 10:27:31.79551+00
936	133	30	primary	\N	\N	2026-03-06 10:34:14.556592+00
937	136	26	primary	\N	\N	2026-03-06 10:38:57.601649+00
938	135	29	primary	\N	\N	2026-03-06 10:43:52.323831+00
939	135	31	primary	\N	\N	2026-03-06 10:43:52.323831+00
940	132	11	primary	\N	\N	2026-03-06 10:45:42.398005+00
941	134	9	primary	\N	\N	2026-03-06 10:48:14.033983+00
942	134	23	secondary	\N	\N	2026-03-06 10:48:14.033983+00
943	69	26	primary	\N	\N	2026-03-06 10:49:45.63347+00
944	198	23	primary	\N	\N	2026-03-06 10:55:05.365626+00
945	269	1	secondary	\N	\N	2026-03-06 10:56:04.041206+00
946	269	26	primary	\N	\N	2026-03-06 10:56:04.041206+00
947	269	29	primary	\N	\N	2026-03-06 10:56:04.041206+00
948	185	20	primary	\N	\N	2026-03-06 10:57:41.595074+00
949	197	20	primary	\N	\N	2026-03-06 10:59:00.401545+00
950	272	31	primary	\N	\N	2026-03-06 11:01:57.515981+00
951	415	17	primary	\N	\N	2026-03-06 11:05:10.251957+00
952	184	23	primary	\N	\N	2026-03-06 11:06:36.406263+00
953	417	9	primary	\N	\N	2026-03-06 11:09:09.95778+00
954	413	26	primary	\N	\N	2026-03-06 11:10:02.753674+00
955	413	27	primary	\N	\N	2026-03-06 11:10:02.753674+00
956	416	7	primary	\N	\N	2026-03-06 11:11:04.063496+00
957	416	15	secondary	\N	\N	2026-03-06 11:11:04.063496+00
958	414	27	primary	\N	\N	2026-03-06 11:12:33.761133+00
959	201	10	primary	\N	\N	2026-03-06 11:13:53.420372+00
960	180	8	primary	\N	\N	2026-03-06 11:14:56.007649+00
961	192	23	primary	\N	\N	2026-03-06 11:16:24.048501+00
962	270	13	primary	\N	\N	2026-03-06 11:17:03.918314+00
963	270	31	secondary	\N	\N	2026-03-06 11:17:03.918314+00
964	181	9	primary	\N	\N	2026-03-06 11:18:05.777597+00
965	181	15	secondary	\N	\N	2026-03-06 11:18:05.777597+00
966	181	23	secondary	\N	\N	2026-03-06 11:18:05.777597+00
967	97	8	primary	\N	\N	2026-03-06 11:21:38.643433+00
808	1	8	primary	60	Tác động chính vào phần lớn cơ ngực	2026-03-05 10:41:48.67715+00
809	1	15	secondary	25	Hỗ trợ đẩy tạ lên	2026-03-05 10:41:48.67715+00
810	1	23	secondary	15	Hỗ trợ duỗi thẳng tay ở điểm cao nhất	2026-03-05 10:41:48.67715+00
811	2	8	primary	70	Tác động chính vào cơ ngực	2026-03-05 10:41:48.716098+00
812	2	23	secondary	20	Hỗ trợ đẩy tạ	2026-03-05 10:41:48.716098+00
813	2	15	secondary	10	Hỗ trợ ổn định vai	2026-03-05 10:41:48.716098+00
814	3	8	primary	50	Tác động chính vào cơ ngực	2026-03-05 10:41:48.73997+00
815	3	15	secondary	30	Hỗ trợ đẩy thân người	2026-03-05 10:41:48.73997+00
816	3	23	secondary	20	Hỗ trợ duỗi tay	2026-03-05 10:41:48.73997+00
817	16	29	primary	\N	\N	2026-03-05 10:41:48.760535+00
818	16	31	primary	\N	\N	2026-03-05 10:41:48.760535+00
819	21	30	primary	\N	\N	2026-03-05 10:41:48.779533+00
820	21	31	primary	\N	\N	2026-03-05 10:41:48.779533+00
821	39	31	primary	\N	\N	2026-03-05 10:41:48.798872+00
822	40	10	primary	\N	\N	2026-03-05 10:41:48.81871+00
823	41	10	primary	\N	\N	2026-03-05 10:41:48.835375+00
824	42	15	primary	\N	\N	2026-03-05 10:41:48.85027+00
825	42	16	primary	\N	\N	2026-03-05 10:41:48.85027+00
826	43	16	primary	\N	\N	2026-03-05 10:41:48.869254+00
827	64	20	primary	\N	\N	2026-03-05 10:41:48.884362+00
828	65	20	primary	\N	\N	2026-03-05 10:41:48.896256+00
829	66	23	primary	\N	\N	2026-03-05 10:41:48.908414+00
831	68	26	primary	\N	\N	2026-03-05 10:41:48.932472+00
833	70	24	primary	\N	\N	2026-03-05 10:41:48.963249+00
834	71	24	primary	\N	\N	2026-03-05 10:41:48.976625+00
835	72	36	primary	\N	\N	2026-03-05 10:41:48.987592+00
836	73	36	primary	\N	\N	2026-03-05 10:41:49.000904+00
839	95	10	primary	\N	\N	2026-03-05 10:41:49.0253+00
840	96	13	primary	\N	\N	2026-03-05 10:41:49.035892+00
841	96	31	primary	\N	\N	2026-03-05 10:41:49.035892+00
842	96	30	secondary	\N	\N	2026-03-05 10:41:49.035892+00
844	98	15	primary	\N	\N	2026-03-05 10:41:49.065106+00
845	99	29	primary	\N	\N	2026-03-05 10:41:49.076001+00
846	99	31	secondary	\N	\N	2026-03-05 10:41:49.076001+00
847	100	29	primary	\N	\N	2026-03-05 10:41:49.089611+00
848	101	27	primary	\N	\N	2026-03-05 10:41:49.102135+00
849	102	17	primary	\N	\N	2026-03-05 10:41:49.118872+00
850	102	11	secondary	\N	\N	2026-03-05 10:41:49.118872+00
858	171	15	primary	\N	\N	2026-03-05 10:41:49.213383+00
859	171	16	primary	\N	\N	2026-03-05 10:41:49.213383+00
860	171	23	secondary	\N	\N	2026-03-05 10:41:49.213383+00
861	172	16	primary	\N	\N	2026-03-05 10:41:49.232443+00
862	173	15	primary	\N	\N	2026-03-05 10:41:49.24901+00
863	173	11	secondary	\N	\N	2026-03-05 10:41:49.24901+00
864	174	17	primary	\N	\N	2026-03-05 10:41:49.266578+00
865	174	11	secondary	\N	\N	2026-03-05 10:41:49.266578+00
866	175	10	primary	\N	\N	2026-03-05 10:41:49.283806+00
867	176	13	primary	\N	\N	2026-03-05 10:41:49.29847+00
868	176	31	primary	\N	\N	2026-03-05 10:41:49.29847+00
869	176	30	secondary	\N	\N	2026-03-05 10:41:49.29847+00
870	177	10	primary	\N	\N	2026-03-05 10:41:49.316936+00
871	177	11	primary	\N	\N	2026-03-05 10:41:49.316936+00
872	178	7	primary	\N	\N	2026-03-05 10:41:49.333625+00
873	178	15	secondary	\N	\N	2026-03-05 10:41:49.333625+00
874	179	8	primary	\N	\N	2026-03-05 10:41:49.348923+00
879	182	20	primary	\N	\N	2026-03-05 10:41:49.390371+00
880	182	24	primary	\N	\N	2026-03-05 10:41:49.390371+00
881	183	23	primary	\N	\N	2026-03-05 10:41:49.405574+00
882	183	15	secondary	\N	\N	2026-03-05 10:41:49.405574+00
885	186	26	primary	\N	\N	2026-03-05 10:41:49.453218+00
886	187	26	primary	\N	\N	2026-03-05 10:41:49.466869+00
887	188	36	primary	\N	\N	2026-03-05 10:41:49.479745+00
888	189	11	primary	\N	\N	2026-03-05 10:41:49.491481+00
889	190	11	primary	\N	\N	2026-03-05 10:41:49.503628+00
890	190	16	secondary	\N	\N	2026-03-05 10:41:49.503628+00
891	191	24	primary	\N	\N	2026-03-05 10:41:49.517554+00
893	193	26	primary	\N	\N	2026-03-05 10:41:49.541108+00
894	194	26	primary	\N	\N	2026-03-05 10:41:49.553741+00
895	194	5	primary	\N	\N	2026-03-05 10:41:49.553741+00
896	195	26	primary	\N	\N	2026-03-05 10:41:49.567072+00
897	196	36	primary	\N	\N	2026-03-05 10:41:49.579143+00
900	199	13	primary	\N	\N	2026-03-05 10:41:49.616165+00
901	199	31	primary	\N	\N	2026-03-05 10:41:49.616165+00
902	199	30	secondary	\N	\N	2026-03-05 10:41:49.616165+00
903	200	29	primary	\N	\N	2026-03-05 10:41:49.633517+00
904	200	31	primary	\N	\N	2026-03-05 10:41:49.633517+00
906	202	8	primary	\N	\N	2026-03-05 10:41:49.659653+00
907	202	10	primary	\N	\N	2026-03-05 10:41:49.659653+00
913	271	31	primary	\N	\N	2026-03-05 10:41:49.702882+00
1000	94	23	secondary	\N	\N	2026-03-11 06:15:41+00
1001	134	15	secondary	\N	\N	2026-03-11 06:15:41+00
1002	97	15	secondary	\N	\N	2026-03-11 06:15:41+00
1003	178	23	secondary	\N	\N	2026-03-11 06:15:41+00
1004	179	15	secondary	\N	\N	2026-03-11 06:15:41+00
1005	180	15	secondary	\N	\N	2026-03-11 06:15:41+00
1006	202	15	secondary	\N	\N	2026-03-11 06:15:41+00
1007	416	23	secondary	\N	\N	2026-03-11 06:15:41+00
1008	417	15	secondary	\N	\N	2026-03-11 06:15:41+00
1009	40	20	secondary	\N	\N	2026-03-11 06:15:41+00
1010	40	11	secondary	\N	\N	2026-03-11 06:15:41+00
1011	41	20	secondary	\N	\N	2026-03-11 06:15:41+00
1012	41	11	secondary	\N	\N	2026-03-11 06:15:41+00
1013	95	11	secondary	\N	\N	2026-03-11 06:15:41+00
1014	95	20	secondary	\N	\N	2026-03-11 06:15:41+00
1015	175	11	secondary	\N	\N	2026-03-11 06:15:41+00
1016	177	20	secondary	\N	\N	2026-03-11 06:15:41+00
1017	199	29	secondary	\N	\N	2026-03-11 06:15:41+00
1018	201	11	secondary	\N	\N	2026-03-11 06:15:41+00
1019	201	20	secondary	\N	\N	2026-03-11 06:15:41+00
1020	270	11	secondary	\N	\N	2026-03-11 06:15:41+00
1021	42	23	secondary	\N	\N	2026-03-11 06:15:41+00
1022	42	11	secondary	\N	\N	2026-03-11 06:15:41+00
1023	43	15	secondary	\N	\N	2026-03-11 06:15:41+00
1024	98	16	secondary	\N	\N	2026-03-11 06:15:41+00
1025	102	16	secondary	\N	\N	2026-03-11 06:15:41+00
1026	171	11	secondary	\N	\N	2026-03-11 06:15:41+00
1027	172	15	secondary	\N	\N	2026-03-11 06:15:41+00
1028	173	23	secondary	\N	\N	2026-03-11 06:15:41+00
1029	174	16	secondary	\N	\N	2026-03-11 06:15:41+00
1030	190	15	secondary	\N	\N	2026-03-11 06:15:41+00
1031	415	11	secondary	\N	\N	2026-03-11 06:15:41+00
1032	64	24	secondary	\N	\N	2026-03-11 06:15:41+00
1033	65	24	secondary	\N	\N	2026-03-11 06:15:41+00
1034	183	9	secondary	\N	\N	2026-03-11 06:15:41+00
1035	185	24	secondary	\N	\N	2026-03-11 06:15:41+00
1036	197	24	secondary	\N	\N	2026-03-11 06:15:41+00
1037	198	15	secondary	\N	\N	2026-03-11 06:15:41+00
1038	198	9	secondary	\N	\N	2026-03-11 06:15:41+00
1039	132	16	secondary	\N	\N	2026-03-11 06:15:41+00
1040	68	27	secondary	\N	\N	2026-03-11 06:15:41+00
1041	69	27	secondary	\N	\N	2026-03-11 06:15:41+00
1042	101	26	secondary	\N	\N	2026-03-11 06:15:41+00
1043	136	27	secondary	\N	\N	2026-03-11 06:15:41+00
1044	186	27	secondary	\N	\N	2026-03-11 06:15:41+00
1045	187	27	secondary	\N	\N	2026-03-11 06:15:41+00
1046	193	27	secondary	\N	\N	2026-03-11 06:15:41+00
1047	195	27	secondary	\N	\N	2026-03-11 06:15:41+00
1048	414	26	secondary	\N	\N	2026-03-11 06:15:41+00
1049	194	27	secondary	\N	\N	2026-03-11 06:15:41+00
1050	16	30	secondary	\N	\N	2026-03-11 06:15:41+00
1051	21	13	secondary	\N	\N	2026-03-11 06:15:41+00
1052	39	30	secondary	\N	\N	2026-03-11 06:15:41+00
1053	96	29	secondary	\N	\N	2026-03-11 06:15:41+00
1054	96	11	secondary	\N	\N	2026-03-11 06:15:41+00
1055	99	30	secondary	\N	\N	2026-03-11 06:15:41+00
1056	133	31	secondary	\N	\N	2026-03-11 06:15:41+00
1057	135	30	secondary	\N	\N	2026-03-11 06:15:41+00
1058	200	30	secondary	\N	\N	2026-03-11 06:15:41+00
1059	271	30	secondary	\N	\N	2026-03-11 06:15:41+00
1060	271	13	secondary	\N	\N	2026-03-11 06:15:41+00
1061	272	29	secondary	\N	\N	2026-03-11 06:15:41+00
1062	269	31	secondary	\N	\N	2026-03-11 06:15:41+00
1063	269	8	secondary	\N	\N	2026-03-11 06:15:41+00
\.



--
-- Data for Name: exercise_steps; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.exercise_steps (step_id, exercise_id, step_number, title, instruction_text, media_url, media_type, focused_muscle_ids, duration_seconds) FROM stdin;
\.


--
-- Data for Name: exercise_steps_json; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.exercise_steps_json (exercise_id, steps, updated_at) FROM stdin;
\.


--
-- Data for Name: exercise_tips; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.exercise_tips (tip_id, exercise_id, tip_type, title, content, display_order, created_at) FROM stdin;
\.


--
-- Data for Name: exercise_videos; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.exercise_videos (id, exercise_id, video_url, title, display_order, created_at, updated_at) FROM stdin;
135	1	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bench-press-side_KciuhbB.mp4	Góc nhìn ngang	0	2026-03-05 10:41:48.67715+00	2026-03-05 10:41:48.67715+00
136	1	https://www.youtube.com/watch?v=YzA3rsX3znQ	Video hướng dẫn YouTube	1	2026-03-05 10:41:48.67715+00	2026-03-05 10:41:48.67715+00
137	2	https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-bench-press-side_rqe1iTe.mp4	Góc nhìn ngang	0	2026-03-05 10:41:48.716098+00	2026-03-05 10:41:48.716098+00
138	3	https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-push-up-side.mp4	Góc nhìn ngang	0	2026-03-05 10:41:48.73997+00	2026-03-05 10:41:48.73997+00
139	16	https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-squat-side.mp4	Góc nhìn ngang	0	2026-03-05 10:41:48.760535+00	2026-03-05 10:41:48.760535+00
140	21	https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-romanian-deadlift-side_dnNh5UH.mp4	Góc nhìn ngang	0	2026-03-05 10:41:48.779533+00	2026-03-05 10:41:48.779533+00
141	39	https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-hip-thrust-side.mp4	Góc nhìn ngang	0	2026-03-05 10:41:48.798872+00	2026-03-05 10:41:48.798872+00
142	40	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-pullup-side.mp4	Góc nhìn ngang	0	2026-03-05 10:41:48.81871+00	2026-03-05 10:41:48.81871+00
143	41	https://media.musclewiki.com/media/uploads/videos/branded/male-machine-pulldown-side.mp4	Góc nhìn ngang	0	2026-03-05 10:41:48.835375+00	2026-03-05 10:41:48.835375+00
144	42	https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-overhead-press-side.mp4	Góc nhìn ngang	0	2026-03-05 10:41:48.85027+00	2026-03-05 10:41:48.85027+00
145	43	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-lateral-raise-side.mp4	Góc nhìn ngang	0	2026-03-05 10:41:48.869254+00	2026-03-05 10:41:48.869254+00
146	135	/uploads/exercises_image/videos/15079561_1080_1920_30fps-1772793830150.mp4	Góc quay khác	1	2026-03-06 10:43:52.323831+00	2026-03-06 10:43:52.323831+00
147	134	/uploads/exercises_image/videos/5320007-uhd_3840_2160_25fps-1772794091856.mp4	Góc quay khác	1	2026-03-06 10:48:14.033983+00	2026-03-06 10:48:14.033983+00
\.


--
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.exercises (exercise_id, name, name_en, slug, description, difficulty_level, exercise_type, equipment_needed, primary_video_url, thumbnail_url, gif_demo_url, duration_minutes, calories_per_rep, popularity_score, is_public, is_featured, created_at, updated_at, source_name, source_url, is_verified, video_url, instructions) FROM stdin;
39	Hip Thrust Với Tạ Đòn	Barbell Hip Thrust	barbell-hip-thrust	Bài tập cô lập hiệu quả nhất cho nhóm cơ mông.	beginner	isolation	barbell, bench	https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-hip-thrust-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Barbell-barbell-hip-thrust-front.jpg	\N	\N	\N	98	t	f	2026-03-03 13:55:47.568811+00	2026-03-05 10:41:48.798872+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-hip-thrust-front.mp4	[{"step_number": 1, "instruction_text": "Ngồi cạnh ghế, đặt tạ lên hông."}, {"step_number": 2, "instruction_text": "Nâng hông lên cho đến khi cơ thể tạo đường thẳng."}, {"step_number": 3, "instruction_text": "Hạ hông xuống có kiểm soát."}]
271	Cầu Mông (Glute Bridge)	Bodyweight Glute Bridge	bodyweight-glute-bridge	Bài tập kích hoạt cơ mông và bảo vệ lưng dưới.	beginner	isolation	body-weight	\N	https://media.musclewiki.com/media/uploads/og-male-bodyweight-glute-bridge-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:46:14.990183+00	2026-03-05 10:41:49.702882+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-glute-bridge-front.mp4	[{"step_number": 1, "instruction_text": "Nằm ngửa, đầu gối gập và bàn chân đặt phẳng trên sàn."}, {"step_number": 2, "instruction_text": "Đẩy gót chân để nâng hông lên cho đến khi cơ thể tạo đường thẳng từ vai đến đầu gối."}, {"step_number": 3, "instruction_text": "Siết chặt mông ở đỉnh và từ từ hạ xuống."}]
272	Đá Chân Sang Bên (Fire Hydrant)	Fire Hydrant	bodyweight-fire-hydrants	Bài tập tuyệt vời để tác động vào cơ mông nhỡ và mông nhỏ.	beginner	isolation	body-weight	\N	/uploads/exercises_image/images/OIP-1772794915720.jpg	\N	\N	\N	0	t	f	2026-03-05 09:46:15.004792+00	2026-03-06 11:01:55.722+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-fire-hydrant-side.mp4	[{"step_number": 1, "instruction_text": "Bắt đầu ở tư thế quỳ bằng hai tay và hai đầu gối."}, {"step_number": 2, "instruction_text": "Nâng một chân sang bên cạnh trong khi vẫn giữ đầu gối gập 90 độ."}, {"step_number": 3, "instruction_text": "Hạ chân xuống và lặp lại."}]
1	Đẩy Ngực Ngang Thanh Đòn	Barbell Bench Press	barbell-bench-press	Bài tập compound quan trọng nhất cho cơ ngực, vai và bắp tay sau.	intermediate	compound	barbell, bench	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bench-press-front.mp4	https://media.musclewiki.com/media/uploads/og-male-barbell-bench-press-front.jpg	\N	\N	0.50	100	t	t	2026-03-03 13:39:02.028723+00	2026-03-05 10:41:48.67715+00	MuscleWiki		t	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bench-press-front.mp4	[{"step_number": 1, "instruction_text": "Nằm ngửa trên ghế phẳng, chân đặt trên sàn. Nhấc thanh tạ ra khỏi giá tạ với cánh tay thẳng."}, {"step_number": 2, "instruction_text": "Hạ thanh tạ xuống vùng ngực giữa (mid-chest)."}, {"step_number": 3, "instruction_text": "Đẩy thanh tạ lên cho đến khi khóa khớp khuỷu tay và thở ra."}]
270	Siêu Nhân (Superman)	Superman	superman	Bài tập tuyệt vời cho lưng dưới và mông mà không cần thiết bị.	beginner	isolation	body-weight	\N	/uploads/exercises_image/images/OIP (8)-1772795821257.jpg	\N	\N	\N	0	t	f	2026-03-05 09:46:14.976745+00	2026-03-06 11:17:01.259+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-supermans-front.mp4	[{"step_number": 1, "instruction_text": "Nằm sấp trên sàn, hai tay duỗi thẳng về phía trước."}, {"step_number": 2, "instruction_text": "Đồng thời nhấc tay, ngực và chân lên khỏi sàn cao nhất có thể."}, {"step_number": 3, "instruction_text": "Giữ trong 2-3 giây rồi từ từ hạ xuống."}]
3	Hít Đất	Push Up	push-up	Bài tập trọng lượng cơ thể kinh điển giúp phát triển cơ ngực, vai và tay sau.	beginner	compound	body-weight	https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-push-up-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Bodyweight-push-up-front.jpg	\N	\N	0.30	95	t	t	2026-03-03 13:39:02.222186+00	2026-03-05 10:41:48.73997+00	MuscleWiki	\N	t	https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-push-up-front.mp4	[{"step_number": 1, "instruction_text": "Đặt hai tay chắc chắn trên sàn, ngay dưới vai."}, {"step_number": 2, "instruction_text": "Giữ lưng thẳng sao cho toàn bộ cơ thể tạo thành một đường thẳng và từ từ hạ thấp người xuống."}, {"step_number": 3, "instruction_text": "Kéo xương bả vai ra sau và xuống dưới, giữ khuỷu tay áp sát vào cơ thể."}, {"step_number": 4, "instruction_text": "Thở ra khi đẩy người trở lại vị trí ban đầu."}]
21	Romanian Deadlift Với Tạ Đòn	Barbell Romanian Deadlift	barbell-romanian-deadlift	Bài tập tốt nhất cho đùi sau.	intermediate	compound	barbell	\N	https://media.musclewiki.com/media/uploads/og-male-Barbell-barbell-romanian-deadlift-side.jpg	\N	\N	\N	95	t	f	2026-03-03 13:52:39.459835+00	2026-03-05 10:41:48.779533+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-romanian-deadlift-front.mp4	[{"step_number": 1, "instruction_text": "Cầm thanh đòn rộng bằng vai."}, {"step_number": 2, "instruction_text": "Đẩy hông ra sau trong khi giữ đầu gối gần thẳng."}, {"step_number": 3, "instruction_text": "Trở lại tư thế đứng."}]
64	Cuốn Tạ Đòn	Barbell Curl	barbell-curl	Bài tập cơ bản tốt nhất để phát triển cơ nhị đầu (biceps).	intermediate	isolation	barbell	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-curl-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Barbell-barbell-curl-front.jpg	\N	\N	\N	95	t	f	2026-03-03 14:19:55.875609+00	2026-03-05 10:41:48.884362+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-curl-front.mp4	[{"step_number": 1, "instruction_text": "Đứng thẳng, cầm thanh tạ đòn với lòng bàn tay hướng về phía trước."}, {"step_number": 2, "instruction_text": "Giữ cánh tay trên cố định, cuốn tạ lên trong khi co bóp cơ nhị đầu."}, {"step_number": 3, "instruction_text": "Tiếp tục nâng tạ cho đến khi cơ nhị đầu co hết mức và thanh tạ ở ngang vai."}, {"step_number": 4, "instruction_text": "Từ từ hạ thanh tạ về vị trí bắt đầu."}]
65	Cuốn Tạ Đơn	Dumbbell Curl	dumbbell-curl	Bài tập linh hoạt cho cơ nhị đầu, giúp cân bằng sức mạnh hai tay.	beginner	isolation	dumbbell	https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-curl-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Dumbbells-dumbbell-curl-front.jpg	\N	\N	\N	90	t	f	2026-03-03 14:19:55.88478+00	2026-03-05 10:41:48.896256+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-curl-front.mp4	[{"step_number": 1, "instruction_text": "Đứng thẳng, mỗi tay cầm một quả tạ đơn."}, {"step_number": 2, "instruction_text": "Cuốn một quả tạ lên và xoay cẳng tay cho đến khi lòng bàn tay hướng về phía vai."}, {"step_number": 3, "instruction_text": "Hạ tạ về vị trí ban đầu và lặp lại với tay kia."}]
40	Hít Xà Đơn	Pull Ups	pull-ups	Bài tập cho cơ lưng rộng.	intermediate	compound	body-weight	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-pullup-front.mp4	https://media.musclewiki.com/media/uploads/og-male-bodyweight-pullup-front.jpg	\N	\N	\N	98	t	f	2026-03-03 13:55:47.589073+00	2026-03-05 10:41:48.81871+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-pullup-front.mp4	[{"step_number": 1, "instruction_text": "Cầm xà tay úp."}, {"step_number": 2, "instruction_text": "Kéo cằm vượt thanh xà."}, {"step_number": 3, "instruction_text": "Hạ xuống có kiểm soát."}]
42	Đẩy Tạ Đòn Qua Đầu	Barbell Overhead Press	barbell-overhead-press	Bài tập cho cơ vai.	intermediate	compound	barbell	https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-overhead-press-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Barbell-barbell-overhead-press-front.jpg	\N	\N	\N	95	t	f	2026-03-03 13:55:47.630756+00	2026-03-05 10:41:48.85027+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-overhead-press-front.mp4	[{"step_number": 1, "instruction_text": "Cầm tạ ngang vai."}, {"step_number": 2, "instruction_text": "Đẩy tạ lên cao qua đầu."}, {"step_number": 3, "instruction_text": "Hạ xuống có kiểm soát."}]
43	Dang Tạ Tay Sang Bên	Dumbbell Lateral Raise	dumbbell-lateral-raise	Bài tập cho cơ vai giữa.	beginner	isolation	dumbbell	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-lateral-raise-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Dumbbells-dumbbell-lateral-raise-front.jpg	\N	\N	\N	92	t	f	2026-03-03 13:55:47.654401+00	2026-03-05 10:41:48.869254+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-lateral-raise-front.mp4	[{"step_number": 1, "instruction_text": "Cầm tạ dang hai tay sang bên."}, {"step_number": 2, "instruction_text": "Nâng cánh tay cho đến khi song song với sàn."}, {"step_number": 3, "instruction_text": "Từ từ hạ tay về vị trí ban đầu."}]
41	Kéo Xô Máy	Machine Pulldown	machine-pulldown	Bài tập kéo xô với máy.	beginner	compound	machine	https://media.musclewiki.com/media/uploads/videos/branded/male-machine-pulldown-front.mp4	https://media.musclewiki.com/media/uploads/og-male-machine-pulldown-front.jpg	\N	\N	\N	90	t	f	2026-03-03 13:55:47.610491+00	2026-03-05 10:41:48.835375+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-machine-pulldown-front.mp4	[{"step_number": 1, "instruction_text": "Ứp tay nắm thanh xà."}, {"step_number": 2, "instruction_text": "Kéo thanh xà xuống ngang cằm."}, {"step_number": 3, "instruction_text": "Trở lại vị trí cũ."}]
70	Cuốn Cổ Tay Tạ Đơn	Dumbbell Wrist Curl	dumbbell-wrist-curl	Bài tập phát triển cơ cẳng tay và sức mạnh nắm tay.	beginner	isolation	dumbbell	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-wrist-curl-side.mp4	https://media.musclewiki.com/media/uploads/og-male-Dumbbells-dumbbell-wrist-curl-side.jpg	\N	\N	\N	80	t	f	2026-03-03 14:19:55.93073+00	2026-03-05 10:41:48.963249+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-wrist-curl-side.mp4	[{"step_number": 1, "instruction_text": "Cầm tạ đơn với lòng bàn tay hướng lên, tựa cẳng tay lên ghế hoặc đùi."}, {"step_number": 2, "instruction_text": "Từ từ cuốn cổ tay lên trên."}, {"step_number": 3, "instruction_text": "Hạ tạ về vị trí ban đầu."}]
72	Nhón Bắp Chân Ngồi	Seated Calf Raise	seated-calf-raise	Bài tập tập trung vào cơ dép (soleus) của bắp chân.	beginner	isolation	machine	https://media.musclewiki.com/media/uploads/videos/branded/male-Vitruvian-seated-calf-raise-side.mp4	https://media.musclewiki.com/media/uploads/og-male-Vitruvian-seated-calf-raise-side.jpg	\N	\N	\N	85	t	f	2026-03-03 14:19:55.946448+00	2026-03-05 10:41:48.987592+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Vitruvian-seated-calf-raise-side.mp4	[{"step_number": 1, "instruction_text": "Ngồi vào máy và đặt đệm lên trên đùi."}, {"step_number": 2, "instruction_text": "Nhón gót chân lên cao hết mức có thể."}, {"step_number": 3, "instruction_text": "Hạ gót chân xuống dưới mức song song và lặp lại."}]
69	Plank Với Bóng	Medicine Ball Plank	medicine-ball-plank	Bài tập ổn định cơ trọng tâm (core) nâng cao với bóng tập.	intermediate	isolation	medicine-ball	https://www.pexels.com/video/man-working-out-at-the-gym-4745626/	/uploads/exercises_image/images/pexels-ketut-subiyanto-4720538-1772794182765.jpg	\N	\N	\N	85	t	f	2026-03-03 14:19:55.922424+00	2026-03-06 10:49:42.804+00	MuscleWiki	\N	f	/uploads/exercises_image/videos/4745626-uhd_3840_2160_25fps-1772794182768.mp4	[{"step_number": 1, "instruction_text": "Đặt bóng tập trên sàn."}, {"step_number": 2, "instruction_text": "Đặt hai tay lên bóng và duỗi chân ra sau tư thế chống đẩy."}, {"step_number": 3, "instruction_text": "Giữ lưng thẳng và gồng cơ bụng. Giữ tư thế trong thời gian yêu cầu."}]
16	Squat Với Tạ Đòn	Barbell Squat	barbell-squat	Bài tập nền tảng cho đùi trước và mông.	intermediate	compound	barbell	https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-squat-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Barbell-barbell-squat-side.jpg	\N	\N	0.80	100	t	t	2026-03-03 13:51:52.752727+00	2026-03-05 10:41:48.760535+00	MuscleWiki	\N	t	https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-squat-front.mp4	[{"step_number": 1, "instruction_text": "Đứng chân rộng bằng vai, giữ lưng thẳng tự nhiên."}, {"step_number": 2, "instruction_text": "Hạ thấp trọng lượng cho đến khi hông thấp hơn đầu gối."}, {"step_number": 3, "instruction_text": "Nâng thanh đòn trở lại vị trí bắt đầu."}]
71	Cuốn Cổ Tay Tạ Đòn	Barbell Wrist Curl	barbell-wrist-curl	Bài tập tăng kích thước và sức bền cho cẳng tay.	beginner	isolation	barbell	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-wrist-curl-side.mp4	https://media.musclewiki.com/media/uploads/og-male-Barbell-barbell-wrist-curl-front.jpg	\N	\N	\N	82	t	f	2026-03-03 14:19:55.938418+00	2026-03-05 10:41:48.976625+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-wrist-curl-side.mp4	[{"step_number": 1, "instruction_text": "Nắm thanh tạ đòn với lòng bàn tay hướng lên."}, {"step_number": 2, "instruction_text": "Quỳ cạnh ghế, đặt cẳng tay lên ghế sao cho cổ tay ở ngoài mép ghế."}, {"step_number": 3, "instruction_text": "Để thanh tạ kéo cổ tay xuống, sau đó cuốn ngược lên trên."}]
97	Ép Ngực Với Cáp	Cable Pec Fly	cable-pec-fly	Bài tập cô lập giúp tạo nét và cảm nhận cơ ngực tốt nhất.	beginner	isolation	machine	https://media.musclewiki.com/media/uploads/videos/branded/male-cable-pec-fly-front.mp4	/uploads/exercises_image/images/a9817152-39cc-4190-9bca-a52c934c71ab-1772796097151.png	\N	\N	\N	88	t	f	2026-03-03 15:03:59.171185+00	2026-03-06 11:21:37.153+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-cable-pec-fly-front.mp4	[{"step_number": 1, "instruction_text": "Đứng giữa hai máy cáp, cầm tay nắm cáp ở độ cao ngang ngực."}, {"step_number": 2, "instruction_text": "Bước một chân lên trước để tạo sự ổn định, hơi gập khuỷu tay."}, {"step_number": 3, "instruction_text": "Ép hai tay lại với nhau ở trước mặt, cảm nhận sự co bóp của cơ ngực."}]
132	Nhún Cầu Vai Thanh Đòn	Barbell Shrugs	barbell-shrugs	Bài tập phát triển sức mạnh và kích thước cho nhóm cơ cầu vai (traps).	beginner	isolation	barbell	https://www.pexels.com/video/side-view-of-a-man-doing-barbell-squats-5319759/	/uploads/exercises_image/images/pexels-leonmart-1552106-1772793941271.jpg	\N	\N	\N	88	t	f	2026-03-03 15:04:42.199705+00	2026-03-06 10:45:41.327+00	MuscleWiki	\N	f	/uploads/exercises_image/videos/5319759-uhd_3840_2160_25fps-1772793941273.mp4	[{"step_number": 1, "instruction_text": "Đứng thẳng, cầm thanh tạ đòn ở ngang đùi với lòng bàn tay hướng về phía cơ thể."}, {"step_number": 2, "instruction_text": "Nhún vai lên cao hết mức có thể về phía tai mặt (không xoay vai)."}, {"step_number": 3, "instruction_text": "Dừng lại một chút ở điểm cao nhất rồi từ từ hạ xuống."}]
94	Đẩy Ngực Dốc Lên Thanh Đòn	Incline Barbell Bench Press	incline-barbell-bench-press	Bài tập tập trung vào phần ngực trên và cơ vai trước.	intermediate	compound	barbell, bench	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-incline-bench-press-front.mp4	/uploads/exercises_image/images/1-4-1772792849689.jpeg	\N	\N	\N	92	t	f	2026-03-03 15:03:59.130204+00	2026-03-06 10:27:29.691+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-incline-bench-press-front.mp4	[{"step_number": 1, "instruction_text": "Nằm trên ghế dốc lên, chân đặt chắc chắn trên sàn. Cầm thanh đòn với lòng bàn tay hướng về phía trước."}, {"step_number": 2, "instruction_text": "Hạ thanh đòn xuống ngực trên, giữ khuỷu tay gần cơ thể."}, {"step_number": 3, "instruction_text": "Đẩy thanh đòn trở lại vị trí bắt đầu và thở ra."}]
133	Cuốn Chân Nằm Với Máy	Machine Lying Leg Curl	machine-lying-leg-curl	Bài tập cô lập chính cho nhóm cơ đùi sau (hamstrings).	beginner	isolation	machine	https://media.musclewiki.com/media/uploads/videos/branded/male-machine-lying-leg-curl-side.mp4	/uploads/exercises_image/images/may-tap-co-dui-1772793253341.png	\N	\N	\N	90	t	f	2026-03-03 15:04:42.210002+00	2026-03-06 10:34:13.345+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-machine-lying-leg-curl-side.mp4	[{"step_number": 1, "instruction_text": "Nằm sấp trên máy cuốn chân, đặt gót chân dưới đệm chân."}, {"step_number": 2, "instruction_text": "Cuốn chân lên phía mông bằng cách sử dụng cơ đùi sau."}, {"step_number": 3, "instruction_text": "Hạ chân xuống từ từ về vị trí ban đầu."}]
95	Chèo Tạ Đòn Cúi Người	Barbell Bent Over Row	barbell-bent-over-row	Bài tập xây dựng độ dày và sức mạnh cho toàn bộ vùng lưng.	intermediate	compound	barbell	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bent-over-row-front.mp4	https://media.musclewiki.com/media/uploads/og-male-barbell-bent-over-row-front.jpg	\N	\N	\N	95	t	f	2026-03-03 15:03:59.143652+00	2026-03-05 10:41:49.0253+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bent-over-row-front.mp4	[{"step_number": 1, "instruction_text": "Cúi người gập hông, giữ lưng thẳng và song song với sàn. Cầm tạ đòn bằng cả hai tay."}, {"step_number": 2, "instruction_text": "Kéo thanh tạ về phía bụng (vùng rốn), ép xương bả vai lại với nhau."}, {"step_number": 3, "instruction_text": "Từ từ hạ tạ về vị trí bắt đầu và lặp lại."}]
98	Nâng Tạ Đơn Trước Mặt	Dumbbell Front Raise	dumbbell-front-raise	Bài tập cô lập tập trung vào cơ vai trước.	beginner	isolation	dumbbell	https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-front-raise-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Dumbbells-dumbbell-front-raise-side.jpg	\N	\N	\N	85	t	f	2026-03-03 15:03:59.183777+00	2026-03-05 10:41:49.065106+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-front-raise-front.mp4	[{"step_number": 1, "instruction_text": "Đứng thẳng, mỗi tay cầm một quả tạ đơn đặt ở trước đùi."}, {"step_number": 2, "instruction_text": "Nâng một tay lên trước mặt cho đến khi cánh tay song song với sàn."}, {"step_number": 3, "instruction_text": "Hạ tạ xuống và lặp lại với tay kia hoặc cả hai tay cùng lúc."}]
100	Đá Đùi Với Máy	Machine Leg Extension	machine-leg-extension	Bài tập cô lập tốt nhất cho cơ đùi trước (quads).	beginner	isolation	machine	https://media.musclewiki.com/media/uploads/videos/branded/male-machine-leg-extension-front.mp4	https://media.musclewiki.com/media/uploads/og-male-machine-leg-extension-front.jpg	\N	\N	\N	90	t	f	2026-03-03 15:03:59.207761+00	2026-03-05 10:41:49.089611+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-machine-leg-extension-front.mp4	[{"step_number": 1, "instruction_text": "Ngồi vào máy, đặt ống chân dưới đệm chân."}, {"step_number": 2, "instruction_text": "Dùng cơ đùi trước để nâng đệm chân lên cho đến khi chân duỗi thẳng."}, {"step_number": 3, "instruction_text": "Hạ đệm chân xuống từ từ về vị trí ban đầu."}]
193	Treo Người Co Gối (Hanging Knee Raises)	Hanging Knee Raises	hanging-knee-raises	Bài tập cơ bụng dưới hiệu quả cao, giúp tăng cường sức mạnh bám nắm.	intermediate	isolation	body-weight	\N	https://media.musclewiki.com/media/uploads/og-male-bodyweight-hanging-knee-raises-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:05.024217+00	2026-03-05 10:41:49.541108+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-hanging-knee-raises-front.mp4	[{"step_number": 1, "instruction_text": "Treo người trên thanh xà, hai tay rộng bằng vai."}, {"step_number": 2, "instruction_text": "Dùng cơ bụng kéo đầu gối lên cao về phía ngực."}, {"step_number": 3, "instruction_text": "Từ từ hạ chân xuống vị trí ban đầu mà không để cơ thể đung đưa."}]
194	Leo Núi Tại Chỗ (Mountain Climber)	Mountain Climber	mountain-climber	Bài tập cardio và cơ bụng kết hợp, giúp đốt cháy mỡ thừa và tăng sức bền.	beginner	compound	body-weight	\N	https://media.musclewiki.com/media/uploads/og-male-bodyweight-mountain-climber-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:05.039658+00	2026-03-05 10:41:49.553741+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-mountain-climbers-side.mp4	[{"step_number": 1, "instruction_text": "Bắt đầu ở tư thế chống đẩy cao (plank cao)."}, {"step_number": 2, "instruction_text": "Kéo đầu gối một chân về phía ngực nhanh nhất có thể, sau đó đưa về và đổi chân."}, {"step_number": 3, "instruction_text": "Lặp lại động tác liên tục như đang chạy bộ ở tư thế nằm."}]
195	Giữ Thân Hình Chuối (Hollow Hold)	Hollow Hold	hollow-hold	Bài tập nền tảng trong Calisthenics giúp nén cơ bụng và tạo độ cứng cho cơ trọng tâm.	intermediate	isolation	body-weight	\N	https://media.musclewiki.com/media/uploads/og-male-Bodyweight-hollow-hold-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:05.055822+00	2026-03-05 10:41:49.567072+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-hollow-hold-front.mp4	[{"step_number": 1, "instruction_text": "Nằm ngửa trên sàn, tay duỗi thẳng qua đầu."}, {"step_number": 2, "instruction_text": "Đồng thời nhấc chân, vai và tay lên khỏi sàn khoảng 15-20cm, ép chặt lưng dưới xuống sàn."}, {"step_number": 3, "instruction_text": "Giữ tư thế này lâu nhất có thể."}]
196	Nhón Bắp Chân Với Tạ Ấm	Kettlebell Calf Raise	kettlebell-calf-raise	Bài tập bắp chân linh hoạt sử dụng tạ ấm.	beginner	isolation	kettlebell	\N	https://media.musclewiki.com/media/uploads/og-male-Kettlebells-kettlebell-calf-raise-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:05.068758+00	2026-03-05 10:41:49.579143+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Kettlebells-kettlebell-calf-raise-front.mp4	[{"step_number": 1, "instruction_text": "Đứng thẳng, mỗi tay cầm một quả tạ ấm."}, {"step_number": 2, "instruction_text": "Nhón gót chân lên cao tối đa, giữ thăng bằng."}, {"step_number": 3, "instruction_text": "Hạ xuống từ từ và lặp lại."}]
99	Đạp Đùi Với Máy	Machine Leg Press	machine-leg-press	Bài tập compound an toàn và hiệu quả cho đùi trước và mông.	beginner	compound	machine	https://media.musclewiki.com/media/uploads/videos/branded/male-machine-leg-press-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Machine-machine-leg-press-side.jpg	\N	\N	\N	94	t	f	2026-03-03 15:03:59.195031+00	2026-03-05 10:41:49.076001+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-machine-leg-press-front.mp4	[{"step_number": 1, "instruction_text": "Ngồi vào máy đạp đùi, đặt hai chân lên bàn đạp rộng bằng vai."}, {"step_number": 2, "instruction_text": "Đẩy bàn đạp ra để mở khóa an toàn, sau đó hạ bàn đạp xuống cho đến khi đầu gối gập một góc khoảng 90 độ."}, {"step_number": 3, "instruction_text": "Đẩy bàn đạp trở lại nhưng không khóa khớp gối ở điểm cuối."}]
101	Vặn Người Kiểu Nga	Bodyweight Russian Twist	bodyweight-russian-twist	Bài tập tuyệt vời cho cơ bụng chéo và sức mạnh cơ trọng tâm.	beginner	isolation	body-weight	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-russian-twist-front.mp4	https://media.musclewiki.com/media/uploads/og-male-bodyweight-russian-twist-front.jpg	\N	\N	\N	85	t	f	2026-03-03 15:03:59.21883+00	2026-03-05 10:41:49.102135+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-russian-twist-front.mp4	[{"step_number": 1, "instruction_text": "Ngồi trên sàn với đầu gối gập, ngả người ra sau một chút và nhấc chân lên khỏi sàn."}, {"step_number": 2, "instruction_text": "Giữ hai tay chắp trước ngực, vặn thân người sang trái rồi sang phải."}, {"step_number": 3, "instruction_text": "Giữ hông cố định và tập trung vào việc xoay phần thân trên."}]
102	Kéo Cáp Cho Vai Sau	Machine Face Pulls	machine-face-pulls	Bài tập quan trọng cho sức khỏe khớp vai và cơ vai sau.	beginner	isolation	machine	https://media.musclewiki.com/media/uploads/videos/branded/male-cable-face-pull-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Machine-machine-face-pulls-front.jpg	\N	\N	\N	82	t	f	2026-03-03 15:03:59.232763+00	2026-03-05 10:41:49.118872+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-cable-face-pull-front.mp4	[{"step_number": 1, "instruction_text": "Đứng trước máy cáp, sử dụng dây thừng (rope) ở độ cao ngang mặt."}, {"step_number": 2, "instruction_text": "Kéo dây thừng về phía mặt, tách hai đầu dây sang hai bên tai."}, {"step_number": 3, "instruction_text": "Ép mạnh cơ vai sau và cơ thang ở điểm cuối, sau đó từ từ đưa về vị trí ban đầu."}]
200	Squat Với Tạ Tay (Goblet Squat)	Dumbbell Goblet Squat	dumbbell-goblet-squat	Biến thể Squat an toàn cho người mới bắt đầu, giúp giữ lưng thẳng dễ dàng hơn.	beginner	compound	dumbbell	\N	https://media.musclewiki.com/media/uploads/og-male-dumbbell-goblet-squat-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:05.137276+00	2026-03-05 10:41:49.633517+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-goblet-squat-front.mp4	[{"step_number": 1, "instruction_text": "Cầm một quả tạ đơn bằng cả hai tay trước ngực."}, {"step_number": 2, "instruction_text": "Hạ thấp hông xuống tư thế squat trong khi giữ ngực cao và lưng thẳng."}, {"step_number": 3, "instruction_text": "Đẩy người ngược lên trở lại vị trí cũ."}]
201	Kéo Cáp Ngồi (Seated Cable Row)	Seated Cable Row	seated-cable-row	Bài tập tuyệt vời để xây dựng độ dày cho lưng giữa.	beginner	compound	machine	\N	/uploads/exercises_image/images/pexels-tima-miroshnichenko-6389070-1772795631306.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:05.155191+00	2026-03-06 11:13:51.364+00	\N	\N	f	/uploads/exercises_image/videos/5319750-uhd_3840_2160_25fps-1772795631312.mp4	[{"step_number": 1, "instruction_text": "Ngồi vào máy, đặt chân lên bục và nắm tay cầm chữ V."}, {"step_number": 2, "instruction_text": "Kéo tay cầm về phía bụng dưới, ép chặt xương bả vai lại với nhau."}, {"step_number": 3, "instruction_text": "Từ từ đưa tay về trí ban đầu, cảm nhận sự kéo giãn của cơ lưng."}]
199	Vung Tạ Ấm (Kettlebell Swing)	Kettlebell Swing	kettlebell-swing	Bài tập toàn diện cho chuỗi cơ sau, tăng cường sức mạnh hông và tim mạch.	intermediate	compound	kettlebell	\N	https://media.musclewiki.com/media/uploads/og-male-Kettlebells-kettlebell-swing-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:05.116547+00	2026-03-05 10:41:49.616165+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-kettlebell-swing-side.mp4	[{"step_number": 1, "instruction_text": "Đứng rộng hơn vai, cầm tạ ấm bằng cả hai tay. Gập hông để tạ nằm giữa hai chân."}, {"step_number": 2, "instruction_text": "Đẩy hông mạnh về phía trước để vung tạ lên ngang ngực."}, {"step_number": 3, "instruction_text": "Để tạ rơi tự do và lặp lại động tác bằng cách gập hông."}]
135	Lunge Bước Đi	Bodyweight Walking Lunges	bodyweight-walking-lunges	Bài tập phát triển sức mạnh đùi, mông và khả năng thăng bằng.	beginner	compound	body-weight	https://www.pexels.com/video/man-performing-lunges-with-dumbbells-in-gym-35585590/	/uploads/exercises_image/images/pexels-kuldeep-singhania-1111658-2105493-1772793830112.jpg	\N	\N	\N	88	t	f	2026-03-03 15:04:42.231921+00	2026-03-06 10:43:50.122+00	MuscleWiki	\N	f	/uploads/exercises_image/videos/15079362_1080_1920_30fps-1772793830115.mp4	[{"step_number": 1, "instruction_text": "Đứng thẳng với hai chân chụm lại."}, {"step_number": 2, "instruction_text": "Bước một chân lên xa phía trước, hạ thấp hông cho đến khi cả hai đầu gối gập một góc khoảng 90 độ."}, {"step_number": 3, "instruction_text": "Đứng dậy và bước chân sau lên phía trước và lặp lại động tác lunge với chân kia."}]
134	Đẩy Ngực Dốc Xuống Thanh Đòn	Barbell Decline Bench Press	barbell-decline-bench-press	Bài tập tập trung vào phần ngực dưới và cơ tam đầu.	intermediate	compound	barbell, bench	https://www.pexels.com/video/a-person-doing-bench-press-exercise-5320001/	/uploads/exercises_image/images/pexels-olly-3837757-1772794091811.jpg	\N	\N	\N	85	t	f	2026-03-03 15:04:42.22051+00	2026-03-06 10:48:11.831+00	MuscleWiki	\N	f	/uploads/exercises_image/videos/5320001-uhd_3840_2160_25fps-1772794091815.mp4	[{"step_number": 1, "instruction_text": "Nằm trên ghế dốc xuống, móc chân vào giá đỡ của ghế. Nhấc thanh tạ ra khỏi giá."}, {"step_number": 2, "instruction_text": "Hạ thanh tạ xuống phần ngực dưới của bạn."}, {"step_number": 3, "instruction_text": "Đẩy thanh tạ lên cho đến khi tay duỗi thẳng hoàn toàn."}]
197	Cuốn Tay Trước Với Cáp	Cable Bicep Curl	cable-bicep-curl	Duy trì áp lực liên tục lên cơ nhị đầu trong suốt biên độ chuyển động.	beginner	isolation	machine	\N	/uploads/exercises_image/images/pexels-tima-miroshnichenko-5327510-1772794737394.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:05.085823+00	2026-03-06 10:58:57.404+00	\N	\N	f	/uploads/exercises_image/videos/4367638-hd_1920_1080_30fps-1772794737397.mp4	[{"step_number": 1, "instruction_text": "Nắm thanh xà của máy cáp, đặt ở vị trí thấp."}, {"step_number": 2, "instruction_text": "Cuốn thanh xà lên về phía ngực, giữ khuỷu tay sát sườn."}, {"step_number": 3, "instruction_text": "Hạ xuống từ từ có kiểm soát."}]
198	Chống Xà Kép Tập Tay Sau	Tricep Dips	tricep-dips	Bài tập sức mạnh thân trên tập trung tối đa vào cơ tam đầu.	intermediate	compound	body-weight	\N	/uploads/exercises_image/images/pexels-zeal-creative-studios-58866141-34043575-1772794501822.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:05.102174+00	2026-03-06 10:55:01.835+00	\N	\N	f	/uploads/exercises_image/videos/4367579-hd_1920_1080_30fps-1772794501825.mp4	[{"step_number": 1, "instruction_text": "Chống hai tay lên xà kép, giữ thân người thẳng đứng (không nghiêng như tập ngực)."}, {"step_number": 2, "instruction_text": "Hạ thấp người xuống bằng cách gập khuỷu tay cho đến khi bắp tay song song với sàn."}, {"step_number": 3, "instruction_text": "Đẩy mạnh người lên trở lại vị trí cũ."}]
172	Dang Một Tay Với Cáp Thấp	Cable Low Single Arm Lateral Raise	cable-low-single-arm-lateral-raise	Bài tập cô lập giúp tạo nét và phát triển cơ vai giữa.	beginner	isolation	machine	https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-lateral-raise-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Cables-cable-lateral-raise-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.670356+00	2026-03-05 10:41:49.232443+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-lateral-raise-front.mp4	[{"step_number": 1, "instruction_text": "Sử dụng tay cầm đơn với mức cáp được thiết lập ở vị trí thấp nhất của máy."}, {"step_number": 2, "instruction_text": "Đứng nghiêng người so với máy, nâng cánh tay thẳng ra phía bên ngoài."}, {"step_number": 3, "instruction_text": "Nâng cho đến khi cánh tay song song với sàn nhà rồi từ từ hạ về vị trí bắt đầu."}]
173	Hít Đất Pike Chân Trên Cao	Elevated Pike Press	elevated-pike-press	Bài tập trọng lượng cơ thể nâng cao giúp tăng sức mạnh và độ linh hoạt cho khớp vai.	advanced	compound	body-weight	https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-elevated-pike-press-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Bodyweight-elevated-pike-press-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.686736+00	2026-03-05 10:41:49.24901+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-elevated-pike-press-front.mp4	[{"step_number": 1, "instruction_text": "Sử dụng một chiếc ghế hoặc vật dụng để nâng cao chân của bạn."}, {"step_number": 2, "instruction_text": "Hạ đầu về phía sàn bằng cách gập khuỷu tay, giữ hông cao tạo thành hình chữ V ngược."}, {"step_number": 3, "instruction_text": "Đẩy mạnh đôi bàn tay để nâng người trở lại vị trí ban đầu."}, {"step_number": 4, "instruction_text": "Lặp lại động tác."}]
174	Ép Tạ Đơn Vai Sau Khi Ngồi	Dumbbell Seated Rear Delt Fly	dumbbell-seated-rear-delt-fly	Bài tập cô lập hiệu quả nhất để phát triển nhóm cơ vai sau và cải thiện tư thế.	intermediate	isolation	dumbbell	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-rear-delt-fly-side.mp4	https://media.musclewiki.com/media/uploads/og-male-Dumbbells-dumbbell-seated-rear-delt-fly-side.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.703872+00	2026-03-05 10:41:49.266578+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-rear-delt-fly-side.mp4	[{"step_number": 1, "instruction_text": "Cầm tạ trong mỗi tay, ngồi trên ghế và cúi người về phía trước, ngực gần chạm đùi. Tạ để dưới đùi."}, {"step_number": 2, "instruction_text": "Giữ khuỷu tay hơi cong, nâng cánh tay sang hai bên cho đến khi ngang vai."}, {"step_number": 3, "instruction_text": "Dừng lại một chút ở điểm cao nhất để cảm nhận cơ vai sau co bóp."}, {"step_number": 4, "instruction_text": "Từ từ hạ tạ về vị trí ban đầu."}]
175	Kéo Cáp Một Tay Tập Xô (Lat Prayer)	Cable Single Arm Lat Prayer	cable-single-arm-lat-prayer	Bài tập tuyệt vời để cô lập và kéo giãn tối đa cơ xô, giúp phát triển độ rộng của lưng.	intermediate	isolation	machine	https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-single-arm-lat-prayer-side.mp4	https://media.musclewiki.com/media/uploads/og-male-Cables-cable-single-arm-lat-prayer-side.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.719885+00	2026-03-05 10:41:49.283806+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-single-arm-lat-prayer-side.mp4	[{"step_number": 1, "instruction_text": "Sử dụng tay cầm đơn, đặt cáp ở vị trí cao nhất của máy."}, {"step_number": 2, "instruction_text": "Cầm tay cầm và bước lùi lại. Đẩy hông ra sau, người hơi nghiêng về phía trước sao cho tai ngang với cánh tay."}, {"step_number": 3, "instruction_text": "Cố định khuỷu tay, dùng cơ xô kéo cáp xuống đồng thời đẩy hông về phía trước cho đến khi tay chạm hông."}]
202	Nằm Vớt Tạ (Dumbbell Pullover)	Dumbbell Pullover	dumbbell-pullover	Bài tập độc đáo tác động vào cả cơ ngực và cơ xô.	intermediate	compound	dumbbell, bench	\N	https://media.musclewiki.com/media/uploads/og-male-dumbbell-pullover-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:05.172182+00	2026-03-05 10:41:49.659653+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-pullover-side.mp4	[{"step_number": 1, "instruction_text": "Nằm trên ghế, giữ một quả tạ đơn bằng cả hai tay thẳng trên ngực."}, {"step_number": 2, "instruction_text": "Hạ tạ ra sau đầu theo hình vòng cung cho đến khi cảm nhận sự kéo giãn tối đa ở cơ xô và ngực."}, {"step_number": 3, "instruction_text": "Dùng cơ ngực và xô kéo tạ trở lại vị trí ban đầu."}]
182	Cuốn Tạ Tay Kiểu Búa (Hammer Curl)	Dumbbell Hammer Curl	dumbbell-hammer-curl	Bài tập tuyệt vời để phát triển cơ cánh tay (brachialis) và cơ cẳng tay, giúp cánh tay trông dày hơn.	beginner	isolation	dumbbell	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-hammer-curl-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Dumbbells-dumbbell-hammer-curl-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.855661+00	2026-03-05 10:41:49.390371+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-hammer-curl-front.mp4	[{"step_number": 1, "instruction_text": "Đứng thẳng, mỗi tay cầm một quả tạ đơn. Lòng bàn tay hướng vào thân người (neutral grip)."}, {"step_number": 2, "instruction_text": "Giữ cánh tay trên cố định, cuốn tạ lên trong khi vẫn giữ lòng bàn tay hướng vào nhau."}, {"step_number": 3, "instruction_text": "Cuốn tạ cho đến khi đạt mức cao nhất và xiết chặt cơ bắp tay, sau đó từ từ hạ xuống."}]
180	Nằm Dang Tạ Tay Tập Ngực	Dumbbell Fly	dumbbell-fly	Bài tập kéo giãn cơ ngực, giúp mở rộng lồng ngực và tạo độ sâu cho rãnh ngực.	intermediate	isolation	dumbbell, bench	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-fly-front.mp4	/uploads/exercises_image/images/OIP (6)-1772795693576.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.815755+00	2026-03-06 11:14:53.578+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-fly-front.mp4	[{"step_number": 1, "instruction_text": "Nằm trên ghế phẳng, cầm hai quả tạ hướng lên trên ngực."}, {"step_number": 2, "instruction_test": "Từ từ hạ tạ sang hai bên theo hình vòng cung cho đến khi cảm thấy ngực căng."}, {"step_number": 3, "instruction_text": "Dùng cơ ngực kéo tạ trở lại vị trí ban đầu như đang ôm một vòng tay lớn."}]
177	Hít Xà Ngược (Inverted Row)	Inverted Row	inverted-row	Bài tập tuyệt vời để xây dựng độ dày cho lưng giữa và cải thiện sự ổn định của xương bả vai.	beginner	compound	body-weight	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-reverse-row-side.mp4	https://media.musclewiki.com/media/uploads/og-male-bodyweight-reverse-row-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.753968+00	2026-03-05 10:41:49.316936+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-reverse-row-side.mp4	[{"step_number": 1, "instruction_text": "Nằm dưới một thanh xà ngang cố định, nắm thanh xà bằng tay úp với độ rộng hơn vai."}, {"step_number": 2, "instruction_text": "Giữ cơ thể thẳng từ đầu đến gót chân, thực hiện kéo ngực sát về phía thanh xà."}, {"step_number": 3, "instruction_text": "Từ từ hạ người xuống cho đến khi cánh tay duỗi thẳng hoàn toàn."}]
178	Đẩy Ngực Dốc Lên Với Tạ Tay	Dumbbell Incline Bench Press	dumbbell-incline-bench-press	Bài tập tuyệt vời để phát triển phần ngực trên, giúp ngực trông đầy đặn hơn.	beginner	compound	dumbbell, bench	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-incline-bench-press-front.mp4	https://media.musclewiki.com/media/uploads/og-male-dumbbell-incline-bench-press-front_q2q0T12.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.778313+00	2026-03-05 10:41:49.333625+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-incline-bench-press-front.mp4	[{"step_number": 1, "instruction_text": "Nằm trên ghế dốc lên khoảng 30 độ, mỗi tay cầm một quả tạ đơn."}, {"step_number": 2, "instruction_text": "Hạ tạ xuống ngang ngực trên, giữ khuỷu tay ở góc khoảng 45 độ so với cơ thể."}, {"step_number": 3, "instruction_text": "Đẩy tạ lên cao theo đường vòng cung cho đến khi hai tạ gần chạm nhau ở phía trên ngực."}]
179	Ép Ngực Với Máy (Pec Deck)	Machine Pec Fly	machine-pec-fly	Bài tập cô lập giúp tạo nét và cảm nhận cơ ngực giữa cực tốt, giảm thiểu sự tham gia của tay sau.	beginner	isolation	machine	https://media.musclewiki.com/media/uploads/videos/branded/male-machine-pec-fly-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Machine-machine-pec-fly-side.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.798049+00	2026-03-05 10:41:49.348923+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-machine-pec-fly-front.mp4	[{"step_number": 1, "instruction_text": "Điều chỉnh ghế sao cho tay cầm ngang với ngực. Ngồi tựa sát lưng vào đệm."}, {"step_number": 2, "instruction_text": "Dùng cơ ngực ép hai tay cầm lại với nhau ở phía trước mặt. Giữ khuỷu tay hơi gập nhẹ."}, {"step_number": 3, "instruction_text": "Từ từ đưa tay về vị trí cũ sao cho cảm thấy cơ ngực được kéo giãn căng."}]
181	Xà Kép Tập Ngực (Chest Dips)	Chest Dips	chest-dips	Bài tập bodyweight mạnh mẽ tập trung vào phần ngực dưới và cơ vai.	advanced	compound	body-weight	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-chest-dip-front.mp4	/uploads/exercises_image/images/OIP (9)-1772795886792.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.831398+00	2026-03-06 11:18:06.793+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-chest-dip-front.mp4	[{"step_number": 1, "instruction_text": "Chống tay lên xà kép, hơi nghiêng người về phía trước để tập trung vào cơ ngực."}, {"step_number": 2, "instruction_text": "Hạ thấp người xuống cho đến khi cánh tay gập một góc khoảng 90 độ."}, {"step_number": 3, "instruction_text": "Đẩy mạnh tay để nâng người trở lại vị trí ban đầu."}]
188	Nhón Bắp Chân Đứng Với Máy	Machine Standing Calf Raises	machine-standing-calf-raises	Bài tập phát triển cơ bắp chân (gastrocnemius) mạnh mẽ.	beginner	isolation	machine	\N	https://media.musclewiki.com/media/uploads/og-male-machine-standing-calf-raises-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.952153+00	2026-03-05 10:41:49.479745+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-machine-standing-calf-raise-front.mp4	[{"step_number": 1, "instruction_text": "Đứng vào máy, đặt vai dưới đệm và mũi chân trên bục."}, {"step_number": 2, "instruction_text": "Nhón gót chân lên cao nhất có thể, siết chặt cơ bắp chân."}, {"step_number": 3, "instruction_text": "Hạ gót chân xuống dưới mức bục để kéo giãn cơ tối đa."}]
189	Nhún Cầu Vai Với Tạ Tay	Dumbbell Shrug	dumbbell-shrug	Bài tập tập trung vào cơ cầu vai trên (traps).	beginner	isolation	dumbbell	\N	https://media.musclewiki.com/media/uploads/og-male-Dumbbells-dumbbell-shrug-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.964172+00	2026-03-05 10:41:49.491481+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-shrug-front.mp4	[{"step_number": 1, "instruction_text": "Đứng thẳng, mỗi tay cầm một quả tạ đơn ở hai bên hông."}, {"step_number": 2, "instruction_text": "Nhún vai lên cao về phía tai mà không uốn cong khuỷu tay."}, {"step_number": 3, "instruction_text": "Giữ một giây ở điểm cao nhất rồi từ từ hạ xuống."}]
190	Kéo Tạ Đòn Thẳng Đứng (Upright Row)	Barbell Upright Row	barbell-upright-row	Bài tập phát triển cơ cầu vai và cơ vai giữa.	intermediate	compound	barbell	\N	https://media.musclewiki.com/media/uploads/og-male-Barbell-barbell-upright-row-side.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.976215+00	2026-03-05 10:41:49.503628+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-upright-row-front.mp4	[{"step_number": 1, "instruction_text": "Cầm thanh tạ đòn với khoảng cách hai tay hẹp hơn vai."}, {"step_number": 2, "instruction_text": "Kéo thanh tạ thẳng lên dọc theo cơ thể cho đến khi gần chạm cằm, khuỷu tay hướng ra ngoài và lên cao."}, {"step_number": 3, "instruction_text": "Từ từ hạ tạ về vị trí ban đầu."}]
191	Cuốn Cổ Tay Tạ Đòn Sau Lưng	Barbell Behind The Back Wrist Curl	barbell-behind-the-back-wrist-curl	Bài tập chuyên sâu cho cơ cẳng tay.	beginner	isolation	barbell	\N	https://media.musclewiki.com/media/uploads/og-male-barbell-behind-the-back-wrist-curl-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.992688+00	2026-03-05 10:41:49.517554+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-behind-back-wrist-curl-side.mp4	[{"step_number": 1, "instruction_text": "Đứng thẳng, cầm thanh tạ đòn ở phía sau lưng với lòng bàn tay hướng ra xa."}, {"step_number": 2, "instruction_text": "Chỉ sử dụng cổ tay để cuốn thanh tạ lên cao nhất có thể."}, {"step_number": 3, "instruction_text": "Hạ tạ xuống từ từ và lặp lại."}]
184	Đá Tạ Tay Sau (Dumbbell Kickback)	Dumbbell Kickback	dumbbell-kickback	Bài tập cô lập giúp định hình và làm săn chắc cơ tam đầu (triceps).	beginner	isolation	dumbbell	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-kickback-side.mp4	/uploads/exercises_image/images/OIP (2)-1772795193203.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.893997+00	2026-03-06 11:06:33.209+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-kickback-side.mp4	[{"step_number": 1, "instruction_text": "Cầm tạ bằng một tay, cúi người về phía trước, tay kia tựa lên ghế hoặc đầu gối. Giữ cánh tay trên song song với thân người."}, {"step_number": 2, "instruction_text": "Chỉ di chuyển cẳng tay, đá tạ ra phía sau cho đến khi cánh tay duỗi thẳng hoàn toàn."}, {"step_number": 3, "instruction_text": "Dừng lại một chút rồi từ từ đưa tạ về vị trí cũ."}]
186	Nằm Nhấc Chân (Leg Raises)	Laying Leg Raises	laying-leg-raises	Bài tập tuyệt vời để tác động vào cơ bụng dưới.	beginner	isolation	body-weight	\N	https://media.musclewiki.com/media/uploads/og-male-Bodyweight-laying-leg-raises-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.923048+00	2026-03-05 10:41:49.453218+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-leg-raises-front.mp4	[{"step_number": 1, "instruction_text": "Nằm ngửa trên sàn, hai tay đặt dưới mông hoặc hai bên hông để hỗ trợ."}, {"step_number": 2, "instruction_text": "Giữ chân thẳng, từ từ nhấc chân lên cho đến khi vuông góc với sàn."}, {"step_number": 3, "instruction_text": "Hạ chân xuống từ từ nhưng không chạm sàn để duy trì áp lực lên cơ bụng."}]
187	Plank Cẳng Tay (Forearm Plank)	Forearm Plank	forearm-plank	Bài tập nền tảng giúp xây dựng sức bền cơ trọng tâm (core) và ổn định toàn thân.	beginner	isolation	body-weight	\N	https://media.musclewiki.com/media/uploads/og-male-bodyweight-forearm-plank-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.938431+00	2026-03-05 10:41:49.466869+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-forearm-plank-side.mp4	[{"step_number": 1, "instruction_text": "Tựa người trên cẳng tay và mũi chân, giữ khuỷu tay ngay dưới vai."}, {"step_number": 2, "instruction_text": "Giữ cơ thể thành một đường thẳng từ đầu đến gót chân."}, {"step_number": 3, "instruction_text": "Gồng cơ bụng và giữ tư thế trong thời gian quy định."}]
176	Kéo Cáp Qua Chân (Pull Through)	Cable Pull Through	cable-pull-through	Bài tập phát triển sức mạnh xích sau, tập trung vào lưng dưới, mông và đùi sau.	beginner	compound	machine	https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-pull-through-side.mp4	https://media.musclewiki.com/media/uploads/og-male-Cables-cable-pull-through-side.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.734786+00	2026-03-05 10:41:49.29847+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Cables-cable-pull-through-side.mp4	[{"step_number": 1, "instruction_text": "Sử dụng dây thừng (rope), đặt cáp ở vị trí thấp nhất."}, {"step_number": 2, "instruction_text": "Đứng quay lưng lại máy, hai chân bước qua dây cáp, hai tay cầm đầu dây. Bước ra xa vài bước."}, {"step_number": 3, "instruction_text": "Gập người tại hông, giữ lưng thẳng và đầu gối hơi gập nhẹ."}, {"step_number": 4, "instruction_text": "Đẩy hông mạnh về phía trước để trở lại tư thế đứng thẳng."}]
183	Chống Đẩy Sau Với Ghế (Bench Dips)	Bench Dips	bench-dips	Bài tập triceps đơn giản nhưng hiệu quả, có thể thực hiện ở bất cứ đâu với một điểm tựa vững chắc.	beginner	isolation	bench	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-bench-dip-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Bodyweight-bench-dips-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.874565+00	2026-03-05 10:41:49.405574+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-bench-dip-front.mp4	[{"step_number": 1, "instruction_text": "Ngồi cạnh ghế, đặt hai lòng bàn tay lên mép ghế. Đu đưa người ra khỏi ghế với chân duỗi thẳng phía trước."}, {"step_number": 2, "instruction_text": "Hạ thấp cơ thể bằng cách gập khuỷu tay cho đến khi bắp tay song song với sàn."}, {"step_number": 3, "instruction_text": "Đẩy người ngược lên trở lại vị trí cũ bằng sức mạnh của cơ tay sau."}]
269	Burpees (Nhảy Hít Đất)	Burpees	burpees	Bài tập toàn thân đốt mỡ đỉnh cao, kết hợp giữa hít đất và bật nhảy.	advanced	compound	body-weight	\N	/uploads/exercises_image/images/pexels-ketut-subiyanto-4720537-1772794562878.jpg	\N	\N	\N	0	t	f	2026-03-05 09:46:14.957554+00	2026-03-06 10:56:02.881+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-burpees-front.mp4	[{"step_number": 1, "instruction_text": "Từ tư thế đứng, hạ người xuống tư thế squat và đặt hai tay xuống sàn."}, {"step_number": 2, "instruction_text": "Bật hai chân ra sau về tư thế chống đẩy, thực hiện một lần hít đất."}, {"step_number": 3, "instruction_text": "Bật chân trở lại tư thế squat và nhảy cao lên, đưa tay qua đầu."}]
414	Kéo Cáp Chặt Gỗ (Cable Woodchop)	Cable Woodchop	cable-woodchop	Bài tập xoay người mạnh mẽ giúp định hình cơ liên sườn và tăng sức mạnh bùng nổ.	intermediate	isolation	machine	\N	/uploads/exercises_image/images/pexels-tima-miroshnichenko-5327498-1772795550304.jpg	\N	\N	\N	0	t	f	2026-03-05 10:10:48.02263+00	2026-03-06 11:12:30.356+00	\N	\N	f	/uploads/exercises_image/videos/5319855-uhd_3840_2160_25fps-1772795550309.mp4	[{"step_number": 1, "instruction_text": "Đứng cạnh máy cáp, hai tay nắm tay cầm ở vị trí cao."}, {"step_number": 2, "instruction_text": "Dùng cơ bụng xoay người kéo cáp xuống theo đường chéo về phía đầu gối đối diện."}, {"step_number": 3, "instruction_text": "Từ từ đưa cáp trở lại vị trí cũ và lặp lại."}]
416	Hít Đất Chân Cao (Decline Push-up)	Decline Push-ups	decline-push-ups	Biến thể hít đất tập trung áp lực vào phần ngực trên và vai trước.	intermediate	compound	body-weight, bench	\N	/uploads/exercises_image/images/OIP (5)-1772795461406.jpg	\N	\N	\N	0	t	f	2026-03-05 10:10:48.05173+00	2026-03-06 11:11:01.407+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-decline-pushup-front.mp4	[{"step_number": 1, "instruction_text": "Đặt hai bàn chân lên ghế hoặc bục cao, hai tay chống dưới sàn ở tư thế hít đất."}, {"step_number": 2, "instruction_text": "Hạ thấp ngực xuống gần sàn, giữ cơ thể thẳng."}, {"step_number": 3, "instruction_text": "Đẩy người ngược lên trở lại vị trí cũ."}]
415	Dang Tạ Tay Ngược (Reverse Fly)	Dumbbell Reverse Fly	dumbbell-reverse-fly	Bài tập cô lập tốt nhất cho cơ vai sau, giúp vai tròn trịa và cải thiện tư thế.	beginner	isolation	dumbbell	\N	/uploads/exercises_image/images/male_exercise_image-1772795108147.jpg	\N	\N	\N	0	t	f	2026-03-05 10:10:48.037387+00	2026-03-06 11:05:08.155+00	\N	\N	f	/uploads/exercises_image/videos/4921622-hd_1920_1080_25fps-1772795108148.mp4	[{"step_number": 1, "instruction_text": "Cúi người về phía trước, lưng thẳng, mỗi tay cầm một quả tạ đơn treo tự nhiên."}, {"step_number": 2, "instruction_text": "Mở rộng cánh tay sang hai bên (như sải cánh) cho đến khi ngang vai, ép chặt xương bả vai."}, {"step_number": 3, "instruction_text": "Từ từ hạ tạ về vị trí ban đầu."}]
417	Ép Cáp Từ Cao Đến Thấp	High-to-Low Cable Fly	high-to-low-cable-fly	Bài tập tuyệt vời để nhắm vào sợi cơ ngực dưới.	intermediate	isolation	machine	\N	/uploads/exercises_image/images/OIP (3)-1772795348857.jpg	\N	\N	\N	0	t	f	2026-03-05 10:10:48.069385+00	2026-03-06 11:09:08.94+00	\N	\N	f	/uploads/exercises_image/videos/5319856-uhd_2160_3840_25fps-1772795348859.mp4	[{"step_number": 1, "instruction_text": "Đứng giữa hai máy cáp, tay cầm đặt ở vị trí cao hơn vai."}, {"step_number": 2, "instruction_text": "Ép hai tay xuống và vào nhau ở phía trước bụng dưới."}, {"step_number": 3, "instruction_text": "Từ từ mở tay ra để cảm nhận sự kéo giãn của cơ ngực dưới."}]
413	Gập Bụng Đạp Xe (Bicycle Crunches)	Bicycle Crunches	bicycle-crunches	Bài tập tuyệt vời tác động đồng thời vào cơ bụng thẳng và cơ liên sườn.	beginner	isolation	body-weight	\N	/uploads/exercises_image/images/OIP (4)-1772795400488.jpg	\N	\N	\N	0	t	f	2026-03-05 10:10:48.005662+00	2026-03-06 11:10:00.49+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-bicycle-crunch-front.mp4	[{"step_number": 1, "instruction_text": "Nằm ngửa, tay đặt sau đầu, nhấc vai và chân lên khỏi sàn."}, {"step_number": 2, "instruction_text": "Co một gối về phía ngực đồng thời xoay người để khuỷu tay đối diện chạm vào gối đó."}, {"step_number": 3, "instruction_text": "Đổi bên liên tục như đang đạp xe."}]
171	Đẩy Tạ Đơn Qua Đầu Khi Ngồi	Dumbbell Seated Overhead Press	dumbbell-seated-overhead-press	Bài tập phát triển toàn diện cơ vai, đặc biệt là vai trước và vai giữa.	intermediate	compound	dumbbell	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-overhead-press-front.mp4	https://media.musclewiki.com/media/uploads/og-male-dumbbell-seated-overhead-press-front.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.64905+00	2026-03-05 10:41:49.213383+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-overhead-press-front.mp4	[{"step_number": 1, "instruction_text": "Cầm hai quả tạ đơn và ngồi trên ghế có tựa lưng. Đảm bảo lưng tựa sát vào phần đệm."}, {"step_number": 2, "instruction_text": "Mở rộng khuỷu tay sang hai bên, lòng bàn tay hướng về phía trước."}, {"step_number": 3, "instruction_text": "Đẩy tạ lên trên cho đến khi cánh tay duỗi thẳng hoàn toàn (không khóa khớp khuỷu tay)."}, {"step_number": 4, "instruction_text": "Từ từ hạ tạ xuống cho đến khi bắp tay song song với sàn hoặc tạ chạm nhẹ vào vai."}]
2	Đẩy Ngực Ngang Tạ Tay	Dumbbell Bench Press	dumbbell-bench-press	Bài tập đẩy ngực sử dụng tạ tay giúp tăng biên độ chuyển động và sự cân bằng giữa hai bên.	beginner	compound	dumbbell, bench	https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-bench-press-front_y8zKZJl.mp4	https://media.musclewiki.com/media/uploads/og-male-dumbbell-bench-press-front_y8zKZJl.jpg	\N	\N	0.40	90	t	f	2026-03-03 13:39:02.193828+00	2026-03-05 10:41:48.716098+00	MuscleWiki	\N	t	https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-bench-press-front_y8zKZJl.mp4	[{"step_number": 1, "instruction_text": "Bắt đầu bằng cách nằm ngửa trên ghế phẳng, mỗi tay cầm một quả tạ đơn."}, {"step_number": 2, "instruction_text": "Giữ tạ ở ngang ngực với lòng bàn tay hướng về phía trước."}, {"step_number": 3, "instruction_text": "Gồng cơ bụng và đẩy tạ lên cao cho đến khi cánh tay duỗi thẳng hoàn toàn."}]
66	Đẩy Tạ Đơn Sau Đầu	Dumbbell Seated Overhead Tricep Extension	dumbbell-seated-overhead-tricep-extension	Bài tập hiệu quả để kéo giãn và phát triển đầu dài của cơ tam đầu (triceps).	intermediate	isolation	dumbbell, bench	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-overhead-tricep-extension-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Dumbbells-dumbbell-seated-overhead-tricep-extension-front.jpg	\N	\N	\N	88	t	f	2026-03-03 14:19:55.893082+00	2026-03-05 10:41:48.908414+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-seated-overhead-tricep-extension-front.mp4	[{"step_number": 1, "instruction_text": "Ngồi trên ghế và giữ một quả tạ bằng cả hai tay. Giơ tạ lên cao qua đầu."}, {"step_number": 2, "instruction_text": "Giữ khuỷu tay sát đầu, hạ tạ xuống phía sau đầu."}, {"step_number": 3, "instruction_text": "Đẩy tạ trở lại vị trí bắt đầu bằng cách duỗi thẳng tay."}]
68	Gập Bụng	Crunches	crunches	Bài tập cơ bản để tác động vào cơ thẳng bụng.	beginner	isolation	body-weight	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-crunch-front.mp4	https://media.musclewiki.com/media/uploads/og-male-bodyweight-crunch-front.jpg	\N	\N	\N	95	t	f	2026-03-03 14:19:55.913527+00	2026-03-05 10:41:48.932472+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-crunch-front.mp4	[{"step_number": 1, "instruction_text": "Nằm ngửa trên sàn, đầu gối gập và bàn chân đặt phẳng trên sàn."}, {"step_number": 2, "instruction_text": "Đặt nhẹ tay sau gáy hoặc thái dương."}, {"step_number": 3, "instruction_text": "Gồng cơ bụng và nâng đầu, vai lên khỏi sàn. Sau đó hạ xuống và lặp lại."}]
73	Nhón Bắp Chân Với Máy Smith	Smith Machine Calf Raise	smith-machine-calf-raise	Bài tập ổn định để phát triển cơ bắp chân lớn (gastrocnemius).	beginner	isolation	machine	https://media.musclewiki.com/media/uploads/videos/branded/male-Smithmachine-calf-raise-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Smithmachine-calf-raise-front.jpg	\N	\N	\N	87	t	f	2026-03-03 14:19:55.954902+00	2026-03-05 10:41:49.000904+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-Smithmachine-calf-raise-front.mp4	[{"step_number": 1, "instruction_text": "Đặt thanh tạ của máy Smith lên phần lưng trên."}, {"step_number": 2, "instruction_text": "Đứng thẳng với bàn chân phẳng."}, {"step_number": 3, "instruction_text": "Nhón gót chân lên cao trong khi giữ đầu gối cố định."}, {"step_number": 4, "instruction_text": "Từ từ hạ gót chân về vị trí cũ."}]
96	Deadlift Với Tạ Đòn	Barbell Deadlift	barbell-deadlift	Bài tập toàn thân kinh điển, tập trung vào xích sau (posterior chain).	advanced	compound	barbell	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-deadlift-front.mp4	https://media.musclewiki.com/media/uploads/og-male-Barbell-barbell-deadlift-front.jpg	\N	\N	\N	100	t	f	2026-03-03 15:03:59.156285+00	2026-03-05 10:41:49.035892+00	MuscleWiki	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-deadlift-front.mp4	[{"step_number": 1, "instruction_text": "Đứng hai chân rộng bằng vai, thanh tạ nằm trên giữa bàn chân."}, {"step_number": 2, "instruction_text": "Cúi người nắm thanh tạ, giữ lưng thẳng và hông thấp xuống."}, {"step_number": 3, "instruction_text": "Đứng thẳng dậy bằng cách đẩy sàn bằng chân, giữ thanh tạ sát vào ống chân và đùi."}, {"step_number": 4, "instruction_text": "Hạ tạ xuống có kiểm soát bằng cách đẩy hông ra sau."}]
67	Đẩy Cáp Tay Sau V-Bar	Machine Cable V Bar Push Downs	cable-v-bar-push-down	Bài tập cô lập cơ tam đầu với máy cáp.	beginner	isolation	machine	https://media.musclewiki.com/media/uploads/videos/branded/male-cable-push-downs-front.mp4	/uploads/exercises_image/images/tay-cam-v-shaped-bar-keo-cap-tay-sau_010-860x860-1772792266669.jpg	\N	\N	\N	92	t	f	2026-03-03 14:19:55.903393+00	2026-03-06 10:17:46.675+00	MuscleWiki		f	https://media.musclewiki.com/media/uploads/videos/branded/male-cable-push-downs-front.mp4	[{"step_number": 1, "instruction_text": "Nắm thanh V-bar với lòng bàn tay hướng xuống."}, {"step_number": 2, "instruction_text": "Đứng thẳng, hơi nghiêng người về phía trước. Đẩy thanh cáp xuống cho đến khi cánh tay duỗi thẳng hoàn toàn."}, {"step_number": 3, "instruction_text": "Dừng lại một chút rồi từ từ đưa thanh cáp trở lại vị trí bắt đầu."}]
136	Treo Người Nhấc Chân	Bodyweight Hanging Leg Raise	bodyweight-hanging-leg-raise	Bài tập nâng cao cho cơ bụng dưới và cơ gấp hông.	advanced	isolation	body-weight	https://www.pexels.com/video/a-topless-man-exercising-8520192/	/uploads/exercises_image/images/hanging-leg-raise-1-fitzport.com-1772793535387.avif	\N	\N	\N	90	t	f	2026-03-03 15:04:42.247679+00	2026-03-06 10:38:55.414+00	MuscleWiki	\N	f	/uploads/exercises_image/videos/8520192-uhd_4096_1680_25fps-1772793535388.mp4	[{"step_number": 1, "instruction_text": "Treo người trên thanh xà đơn, giữ thẳng tay."}, {"step_number": 2, "instruction_text": "Nâng hai chân lên (có thể duỗi thẳng hoặc gập gối) cho đến khi hông gập hoàn toàn."}, {"step_number": 3, "instruction_text": "Hạ chân xuống từ từ, cố gắng không để cơ thể bị đung đưa."}]
185	Cuốn Tạ Tập Trung (Concentration Curl)	Concentration Curl	concentration-curl	Bài tập cô lập đỉnh cao cho cơ nhị đầu, giúp tạo độ cao cho 'đỉnh' bắp tay.	intermediate	isolation	dumbbell	https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-concentration-curl-front.mp4	/uploads/exercises_image/images/pexels-andres-ayrton-6550857 (1)-1772794660391.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:04.909323+00	2026-03-06 10:57:40.404+00	MuscleWiki	\N	f	/uploads/exercises_image/videos/4920824-hd_1920_1080_25fps-1772794660395.mp4	[{"step_number": 1, "instruction_text": "Ngồi trên ghế, hơi cúi người. Tựa khuỷu tay của tay cầm tạ vào mặt trong của đùi cùng bên."}, {"step_number": 2, "instruction_text": "Cuốn tạ lên phía vai mà không di chuyển khuỷu tay khỏi đùi."}, {"step_number": 3, "instruction_text": "Siết chặt bắp tay ở điểm cao nhất rồi từ từ hạ xuống."}]
192	Nằm Đẩy Tạ Đòn Sau Đầu (Skull Crusher)	Barbell Skull Crusher	barbell-skull-crusher	Một trong những bài tập tốt nhất để xây dựng kích thước cho cơ tam đầu (triceps).	intermediate	isolation	barbell	\N	/uploads/exercises_image/images/OIP (7)-1772795780738.jpg	\N	\N	\N	0	t	f	2026-03-05 09:45:05.00805+00	2026-03-06 11:16:20.741+00	\N	\N	f	https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-skull-crusher-front.mp4	[{"step_number": 1, "instruction_text": "Nằm trên ghế phẳng, cầm thanh tạ đòn (thường là thanh EZ) thẳng trên ngực."}, {"step_number": 2, "instruction_text": "Giữ bắp tay cố định, gập khuỷu tay để hạ thanh tạ về phía trán."}, {"step_number": 3, "instruction_text": "Dùng cơ tay sau đẩy thanh tạ trở lại vị trí ban đầu."}]
\.


--
-- Data for Name: image_exercise; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.image_exercise (image_id, exercise_id, image_url, image_type, alt_text, width, height, display_order, is_primary, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: login_history; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.login_history (login_id, user_id, ip_address, user_agent, os, browser, device, city, country, success, created_at) FROM stdin;
\.


--
-- Data for Name: muscle_groups; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.muscle_groups (muscle_group_id, name, name_en, slug, description, model_identifier, mesh_ids, highlight_color, model_position, parent_id, level, display_priority, is_selectable, created_at, updated_at) FROM stdin;
1	Ngực	Ngực	chest	\N	\N	\N	\N	\N	\N	0	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
2	Lưng	Lưng	back	\N	\N	\N	\N	\N	\N	0	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
3	Vai	Vai	shoulders	\N	\N	\N	\N	\N	\N	0	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
4	Tay	Tay	arms	\N	\N	\N	\N	\N	\N	0	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
5	Bụng	Bụng	core	\N	\N	\N	\N	\N	\N	0	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
6	Chân	Chân	legs	\N	\N	\N	\N	\N	\N	0	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
7	Ngực trên	Ngực trên	upper-chest	\N	\N	\N	\N	\N	1	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
8	Ngực giữa	Ngực giữa	mid-chest	\N	\N	\N	\N	\N	1	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
9	Ngực dưới	Ngực dưới	lower-chest	\N	\N	\N	\N	\N	1	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
10	Cơ xô / Lưng rộng	Cơ xô / Lưng rộng	lats	\N	\N	\N	\N	\N	2	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
11	Cầu vai	Cầu vai	traps	\N	\N	\N	\N	\N	2	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
13	Lưng dưới	Lưng dưới	lower-back	\N	\N	\N	\N	\N	2	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
15	Vai trước	Vai trước	anterior-delts	\N	\N	\N	\N	\N	3	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
16	Vai giữa	Vai giữa	lateral-delts	\N	\N	\N	\N	\N	3	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
17	Vai sau	Vai sau	posterior-delts	\N	\N	\N	\N	\N	3	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
20	Bắp tay trước	Bắp tay trước	biceps	\N	\N	\N	\N	\N	4	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
23	Bắp tay sau	Bắp tay sau	triceps	\N	\N	\N	\N	\N	4	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
24	Cẳng tay	Cẳng tay	forearms	\N	\N	\N	\N	\N	4	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
26	Cơ bụng	Cơ bụng	abs	\N	\N	\N	\N	\N	5	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
27	Cơ liên sườn	Cơ liên sườn	obliques	\N	\N	\N	\N	\N	5	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
29	Đùi trước	Đùi trước	quads	\N	\N	\N	\N	\N	6	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
30	Đùi sau	Đùi sau	hamstrings	\N	\N	\N	\N	\N	6	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
31	Cơ Mông	Cơ Mông	glutes	\N	\N	\N	\N	\N	6	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
36	Bắp chân	Bắp chân	calves	\N	\N	\N	\N	\N	6	1	0	t	2026-03-05 10:07:07.351847+00	2026-03-05 10:07:07.351847+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.notifications (notification_id, user_id, type, title, body, metadata, read_at, created_at, updated_at) FROM stdin;
1	2	streak	Bạn đã giữ streak hôm nay!	🔥 Hôm nay là ngày thứ 1 trong streak của bạn – đừng bỏ lỡ!	{"streak": 1}	\N	2026-03-02 04:11:27.642+00	2026-03-02 04:11:27.642+00
2	1	streak	Bạn đã giữ streak hôm nay!	🔥 Hôm nay là ngày thứ 1 trong streak của bạn – đừng bỏ lỡ!	{"streak": 1}	\N	2026-03-02 04:14:15.57+00	2026-03-02 04:14:15.57+00
3	2	streak	Bạn đã giữ streak hôm nay!	🔥 Hôm nay là ngày thứ 2 trong streak của bạn – đừng bỏ lỡ!	{"streak": 2}	\N	2026-03-03 13:20:28.583+00	2026-03-03 13:20:28.583+00
4	1	streak	Bạn đã giữ streak hôm nay!	🔥 Hôm nay là ngày thứ 2 trong streak của bạn – đừng bỏ lỡ!	{"streak": 2}	\N	2026-03-03 13:23:40.152+00	2026-03-03 13:23:40.152+00
5	2	workout_complete	Bạn đã hoàn thành bài tập hôm nay!	Giữ phong độ để duy trì tiến độ luyện tập.	{"planId": null, "sessionId": 1}	\N	2026-03-03 14:26:05.05+00	2026-03-03 14:26:05.05+00
6	2	streak	Bạn đã giữ streak hôm nay!	🔥 Hôm nay là ngày thứ 3 trong streak của bạn – đừng bỏ lỡ!	{"streak": 3}	\N	2026-03-04 03:19:52.596+00	2026-03-04 03:19:52.596+00
7	2	streak_milestone	Bạn vừa đạt mốc 3 ngày streak!	Tiếp tục luyện tập để giữ lửa!	{"streak": 3}	\N	2026-03-04 03:19:52.608+00	2026-03-04 03:19:52.608+00
8	2	streak	Bạn đã giữ streak hôm nay!	🔥 Hôm nay là ngày thứ 4 trong streak của bạn – đừng bỏ lỡ!	{"streak": 4}	\N	2026-03-05 05:02:17.169+00	2026-03-05 05:02:17.169+00
9	1	streak	Bạn đã giữ streak hôm nay!	🔥 Hôm nay là ngày thứ 1 trong streak của bạn – đừng bỏ lỡ!	{"streak": 1}	\N	2026-03-05 09:20:24.265+00	2026-03-05 09:20:24.265+00
10	2	streak	Bạn đã giữ streak hôm nay!	🔥 Hôm nay là ngày thứ 5 trong streak của bạn – đừng bỏ lỡ!	{"streak": 5}	\N	2026-03-06 01:43:40.366+00	2026-03-06 01:43:40.366+00
11	1	streak	Bạn đã giữ streak hôm nay!	🔥 Hôm nay là ngày thứ 2 trong streak của bạn – đừng bỏ lỡ!	{"streak": 2}	\N	2026-03-06 01:45:06.096+00	2026-03-06 01:45:06.096+00
12	2	workout_complete	Bạn đã hoàn thành bài tập hôm nay!	Giữ phong độ để duy trì tiến độ luyện tập.	{"planId": null, "sessionId": 2}	\N	2026-03-06 12:09:55.24+00	2026-03-06 12:09:55.24+00
13	2	streak	Bạn đã giữ streak hôm nay!	🔥 Hôm nay là ngày thứ 1 trong streak của bạn – đừng bỏ lỡ!	{"streak": 1}	\N	2026-03-08 04:49:16.125+00	2026-03-08 04:49:16.125+00
\.


--
-- Data for Name: onboarding_answers; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.onboarding_answers (answer_id, session_id, step_id, answers, created_at, updated_at) FROM stdin;
1	998b8bac-b42a-45c5-b81b-c09eefc206db	1	{"age_group": "AGE_16_29"}	2026-03-02 04:11:47.602+00	2026-03-02 04:11:47.602+00
2	998b8bac-b42a-45c5-b81b-c09eefc206db	2	{"body_type": "SKINNY"}	2026-03-02 04:11:48.419+00	2026-03-02 04:11:48.419+00
3	998b8bac-b42a-45c5-b81b-c09eefc206db	3	{"goal": "BUILD_MUSCLE"}	2026-03-02 04:11:49.005+00	2026-03-02 04:11:49.005+00
4	998b8bac-b42a-45c5-b81b-c09eefc206db	4	{"weight_kg": 222}	2026-03-02 04:11:51.602+00	2026-03-02 04:11:51.602+00
5	998b8bac-b42a-45c5-b81b-c09eefc206db	5	{"height_cm": 222}	2026-03-02 04:11:52.67+00	2026-03-02 04:11:52.67+00
6	998b8bac-b42a-45c5-b81b-c09eefc206db	6	{"body_fat_level": "VERY_LOW"}	2026-03-02 04:11:53.252+00	2026-03-02 04:11:53.252+00
7	998b8bac-b42a-45c5-b81b-c09eefc206db	7	{"experience_level": "INTERMEDIATE"}	2026-03-02 04:11:53.665+00	2026-03-02 04:11:53.665+00
8	998b8bac-b42a-45c5-b81b-c09eefc206db	8	{"workout_days_per_week": "2"}	2026-03-02 04:11:54.231+00	2026-03-02 04:11:54.231+00
\.


--
-- Data for Name: onboarding_fields; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.onboarding_fields (field_id, step_id, field_key, label, input_type, required, order_index, metadata, created_at, updated_at) FROM stdin;
1	1	age_group	Độ tuổi	radio	t	1	{"ui": {"variant": "card"}, "options": [{"key": "AGE_16_29", "max": 29, "min": 16, "image": "/images/age-young.png", "label": "16–29"}, {"key": "AGE_30_39", "max": 39, "min": 30, "image": "/images/age-adult.png", "label": "30–39"}, {"key": "AGE_40_49", "max": 49, "min": 40, "image": "/images/age-middle.png", "label": "40–49"}, {"key": "AGE_50_PLUS", "max": null, "min": 50, "image": "/images/age-senior.png", "label": "50+"}]}	2026-03-02 04:08:07.377034+00	2026-03-02 04:08:07.377034+00
2	2	body_type	Thể trạng	radio	t	1	{"ui": {"variant": "card"}, "options": [{"key": "SKINNY", "label": "Gầy"}, {"key": "NORMAL", "label": "Bình thường"}, {"key": "OVERWEIGHT", "label": "Thừa cân"}, {"key": "MUSCULAR", "label": "Cơ bắp"}]}	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
3	3	goal	Mục tiêu	radio	t	1	{"ui": {"variant": "card"}, "options": [{"key": "LOSE_FAT", "label": "Giảm mỡ"}, {"key": "BUILD_MUSCLE", "label": "Tăng cơ"}, {"key": "MAINTAIN", "label": "Duy trì"}]}	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
4	4	weight_kg	Cân nặng (kg)	number	t	1	{"max": 300, "min": 30, "step": 0.1, "unit": "kg", "mapTo": {"model": "user_progress", "column": "weight"}, "placeholder": 70}	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
5	5	height_cm	Chiều cao (cm)	number	t	1	{"max": 230, "min": 120, "step": 0.5, "unit": "cm", "mapTo": {"model": "user_progress", "column": "height"}, "placeholder": 170}	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
6	6	body_fat_level	Mức mỡ	radio	t	1	{"ui": {"variant": "card"}, "mapTo": {"model": "user_progress", "column": "body_fat_level"}, "options": [{"key": "VERY_LOW", "label": "Rất thấp"}, {"key": "LOW", "label": "Thấp"}, {"key": "NORMAL", "label": "Bình thường"}, {"key": "HIGH", "label": "Cao"}]}	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
7	7	experience_level	Kinh nghiệm	select	t	1	{"options": [{"key": "BEGINNER", "label": "Mới bắt đầu"}, {"key": "INTERMEDIATE", "label": "Trung cấp"}, {"key": "ADVANCED", "label": "Nâng cao"}]}	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
8	8	workout_days_per_week	Số buổi mỗi tuần	select	t	1	{"options": [{"key": "1", "label": "1 buổi/tuần"}, {"key": "2", "label": "2 buổi/tuần"}, {"key": "3", "label": "3 buổi/tuần"}, {"key": "4", "label": "4 buổi/tuần"}, {"key": "5", "label": "5 buổi/tuần"}, {"key": "6", "label": "6 buổi/tuần"}, {"key": "7", "label": "7 buổi/tuần"}]}	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
\.


--
-- Data for Name: onboarding_sessions; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.onboarding_sessions (session_id, user_id, current_step_key, is_completed, completed_at, created_at, updated_at) FROM stdin;
998b8bac-b42a-45c5-b81b-c09eefc206db	2	\N	t	2026-03-02 04:11:54.24+00	2026-03-02 04:11:40.181+00	2026-03-02 04:11:54.24+00
\.


--
-- Data for Name: onboarding_steps; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.onboarding_steps (step_id, step_key, title, order_index, is_active, created_at, updated_at) FROM stdin;
1	age	Chọn độ tuổi của bạn	1	t	2026-03-02 04:08:07.377034+00	2026-03-02 04:08:07.377034+00
2	body_type	Chọn thể trạng cơ thể	2	t	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
3	goal	Mục tiêu của bạn	3	t	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
4	weight	Cân nặng hiện tại	4	t	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
5	height	Chiều cao	5	t	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
6	level_body_fat	Mức độ mỡ cơ thể	6	t	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
7	experience_level	Kinh nghiệm tập luyện	7	t	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
8	workout_frequency	Số buổi/tuần	8	t	2026-03-02 04:08:07.402327+00	2026-03-02 04:08:07.402327+00
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.password_resets (id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: plan_exercise_details; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.plan_exercise_details (plan_exercise_id, plan_id, exercise_id, session_order, sets_recommended, reps_recommended, rest_period_seconds) FROM stdin;
1	1	42	1	3	8-12	60
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.subscription_plans (plan_id, name, slug, price, duration_days, is_active, created_at, updated_at) FROM stdin;
1	Premium 1 tháng	premium-1m	99000	30	t	2026-03-02 04:08:08.596253+00	2026-03-02 04:08:08.596253+00
2	Premium 3 tháng	premium-3m	249000	90	t	2026-03-02 04:08:08.596253+00	2026-03-02 04:08:08.596253+00
3	Premium 12 tháng	premium-12m	799000	365	t	2026-03-02 04:08:08.596253+00	2026-03-02 04:08:08.596253+00
\.


--
-- Data for Name: system_content; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.system_content (key, type, content, created_at, updated_at, updated_by) FROM stdin;
dashboard_hero	json	{"title": "Trải nghiệm <span class=\\"text-blue-400\\">AI Workout</span><br>cùng Fitnexus", "mediaUrl": "/vidbgr.mp4", "mediaType": "video", "buttonText": "Bắt đầu ngay", "showButton": true, "description": "Kết hợp AI, mô hình hoá chuyển động và lộ trình cá nhân hóa."}	2026-03-02 04:08:09.475+00	2026-03-02 04:08:09.475+00	\N
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.transactions (transaction_id, user_id, plan_id, amount, status, payos_order_code, payos_payment_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_screenshots; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.user_screenshots (id, user_id, object_key, feature, description, metadata, is_favorite, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.users (user_id, username, email, password_hash, full_name, avatar_url, date_of_birth, gender, provider, provider_id, role, status, last_login_at, created_at, updated_at, phone, plan, onboarding_completed_at, is_locked, locked_at, lock_reason, is_super_admin, parent_admin_id, last_active_at, user_exp_date, user_type, login_streak, max_login_streak, login_streak_updated_at) FROM stdin;
1	admin	hoccuakiet@gmail.com	$2b$12$figbGtLEV1R5hNJGdz0dkujQuhD7sjA6cuOUq5Skx23ypMQDUjg6y	\N	\N	\N	\N	local	\N	ADMIN	ACTIVE	2026-03-06 10:17:33.647+00	2026-03-02 04:08:07.193+00	2026-03-06 11:21:37.106+00	0762700716	FREE	\N	f	\N	\N	t	\N	2026-03-06 11:21:37.106+00	\N	free	2	2	2026-03-06 10:17:33.661+00
2	tunek	tnt11925@gmail.com	$2b$12$HN7BEshN4tYYjA4TBsErJe4tTIIJ8XBvW7CfLcQ2aLXiT5BdOHywC	tu	\N	\N	\N	local	\N	USER	ACTIVE	2026-03-08 04:49:16.086+00	2026-03-02 04:11:27.231+00	2026-03-08 04:49:16.118+00	0932222233	FREE	\N	f	\N	\N	f	\N	2026-03-08 04:49:16.087+00	\N	free	1	5	2026-03-08 04:49:16.118+00
\.


--
-- Data for Name: workout_plans; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.workout_plans (plan_id, name, description, creator_id, difficulty_level, is_public) FROM stdin;
1	Giáo án mới - 3/3/2026	Kế hoạch được tạo nhanh từ chức năng Thêm bài tập	2	beginner	f
\.


--
-- Data for Name: workout_session_exercises; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.workout_session_exercises (session_exercise_id, session_id, plan_exercise_id, exercise_id, session_order, target_sets, target_reps, target_rest_seconds, completed_sets, status, created_at, updated_at) FROM stdin;
1	1	\N	1	1	3	8-12	60	0	skipped	2026-03-03 13:56:47.284+00	2026-03-03 14:26:01.768+00
2	2	\N	1	1	3	8-12	60	0	in_progress	2026-03-03 14:26:13.833+00	2026-03-03 14:26:13.833+00
3	2	\N	21	2	3	8-12	60	0	pending	2026-03-03 14:26:13.833+00	2026-03-03 14:26:13.833+00
4	2	\N	3	3	3	8-12	60	0	pending	2026-03-03 14:26:13.833+00	2026-03-03 14:26:13.833+00
5	2	\N	42	4	3	8-12	60	0	pending	2026-03-03 14:26:13.833+00	2026-03-03 14:26:13.833+00
6	2	\N	16	5	3	8-12	60	0	pending	2026-03-03 14:26:13.833+00	2026-03-03 14:26:13.833+00
7	2	\N	64	6	3	8-12	60	0	pending	2026-03-03 14:26:13.833+00	2026-03-03 14:26:13.833+00
8	3	\N	1	1	3	8-12	60	0	in_progress	2026-03-06 12:15:39.445+00	2026-03-06 12:15:39.445+00
9	3	\N	96	2	3	8-12	60	0	pending	2026-03-06 12:15:39.445+00	2026-03-06 12:15:39.445+00
\.


--
-- Data for Name: workout_session_sets; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.workout_session_sets (set_id, session_exercise_id, set_index, actual_reps, actual_weight_kg, rest_seconds, completed_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: workout_sessions; Type: TABLE DATA; Schema: public; Owner: tu
--

COPY public.workout_sessions (session_id, user_id, plan_id, status, started_at, ended_at, total_duration_seconds, current_exercise_index, notes, created_at, updated_at) FROM stdin;
1	2	\N	completed	2026-03-03 13:56:47.257+00	2026-03-03 14:26:05.038+00	1757	1	\N	2026-03-03 13:56:47.258+00	2026-03-03 14:26:05.039+00
2	2	\N	completed	2026-03-03 14:26:13.827+00	2026-03-06 12:09:55.229+00	251021	0	\N	2026-03-03 14:26:13.828+00	2026-03-06 12:09:55.231+00
3	2	\N	in_progress	2026-03-06 12:15:39.437+00	\N	\N	0	\N	2026-03-06 12:15:39.437+00	2026-03-06 12:15:39.437+00
\.


--
-- Name: ai_usage_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.ai_usage_usage_id_seq', 1, false);


--
-- Name: bug_reports_report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.bug_reports_report_id_seq', 1, false);


--
-- Name: dashboard_review_comments_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.dashboard_review_comments_comment_id_seq', 1, false);


--
-- Name: dashboard_review_votes_vote_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.dashboard_review_votes_vote_id_seq', 1, false);


--
-- Name: dashboard_reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.dashboard_reviews_review_id_seq', 1, false);


--
-- Name: exercise_favorites_favorite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.exercise_favorites_favorite_id_seq', 1, false);


--
-- Name: exercise_muscle_combinations_combination_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.exercise_muscle_combinations_combination_id_seq', 1814, true);


--
-- Name: exercise_muscle_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.exercise_muscle_group_id_seq', 1063, true);



--
-- Name: exercise_steps_step_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.exercise_steps_step_id_seq', 1, false);


--
-- Name: exercise_tips_tip_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.exercise_tips_tip_id_seq', 1, false);


--
-- Name: exercise_videos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.exercise_videos_id_seq', 147, true);


--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.exercises_exercise_id_seq', 567, true);


--
-- Name: image_exercise_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.image_exercise_image_id_seq', 1, false);


--
-- Name: login_history_login_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.login_history_login_id_seq', 1, false);


--
-- Name: muscle_groups_muscle_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.muscle_groups_muscle_group_id_seq', 38, true);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 13, true);


--
-- Name: onboarding_answers_answer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.onboarding_answers_answer_id_seq', 8, true);


--
-- Name: onboarding_fields_field_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.onboarding_fields_field_id_seq', 8, true);


--
-- Name: onboarding_steps_step_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.onboarding_steps_step_id_seq', 8, true);


--
-- Name: password_resets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.password_resets_id_seq', 1, false);


--
-- Name: plan_exercise_details_plan_exercise_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.plan_exercise_details_plan_exercise_id_seq', 1, true);


--
-- Name: subscription_plans_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.subscription_plans_plan_id_seq', 3, true);


--
-- Name: transactions_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.transactions_transaction_id_seq', 1, false);


--
-- Name: user_screenshots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.user_screenshots_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.users_user_id_seq', 2, true);


--
-- Name: workout_plans_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.workout_plans_plan_id_seq', 1, true);


--
-- Name: workout_session_exercises_session_exercise_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.workout_session_exercises_session_exercise_id_seq', 9, true);


--
-- Name: workout_session_sets_set_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.workout_session_sets_set_id_seq', 1, false);


--
-- Name: workout_sessions_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tu
--

SELECT pg_catalog.setval('public.workout_sessions_session_id_seq', 3, true);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: ai_usage ai_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.ai_usage
    ADD CONSTRAINT ai_usage_pkey PRIMARY KEY (usage_id);


--
-- Name: bug_reports bug_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.bug_reports
    ADD CONSTRAINT bug_reports_pkey PRIMARY KEY (report_id);


--
-- Name: dashboard_review_comments dashboard_review_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.dashboard_review_comments
    ADD CONSTRAINT dashboard_review_comments_pkey PRIMARY KEY (comment_id);


--
-- Name: dashboard_review_votes dashboard_review_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.dashboard_review_votes
    ADD CONSTRAINT dashboard_review_votes_pkey PRIMARY KEY (vote_id);


--
-- Name: dashboard_review_votes dashboard_review_votes_review_user_unique; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.dashboard_review_votes
    ADD CONSTRAINT dashboard_review_votes_review_user_unique UNIQUE (review_id, user_id);


--
-- Name: dashboard_reviews dashboard_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.dashboard_reviews
    ADD CONSTRAINT dashboard_reviews_pkey PRIMARY KEY (review_id);


--
-- Name: exercise_muscle_combinations emc_exercise_unique; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_muscle_combinations
    ADD CONSTRAINT emc_exercise_unique UNIQUE (exercise_id);


--
-- Name: exercise_muscle_group emg_exercise_muscle_unique; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_muscle_group
    ADD CONSTRAINT emg_exercise_muscle_unique UNIQUE (exercise_id, muscle_group_id);


--
-- Name: exercise_favorites exercise_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_favorites
    ADD CONSTRAINT exercise_favorites_pkey PRIMARY KEY (favorite_id);


--
-- Name: exercise_favorites exercise_favorites_user_exercise_unique; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_favorites
    ADD CONSTRAINT exercise_favorites_user_exercise_unique UNIQUE (user_id, exercise_id);


--
-- Name: exercise_muscle_combinations exercise_muscle_combinations_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_muscle_combinations
    ADD CONSTRAINT exercise_muscle_combinations_pkey PRIMARY KEY (combination_id);


--
-- Name: exercise_muscle_group exercise_muscle_group_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_muscle_group
    ADD CONSTRAINT exercise_muscle_group_pkey PRIMARY KEY (id);


--
-- Name: exercise_steps_json exercise_steps_json_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_steps_json
    ADD CONSTRAINT exercise_steps_json_pkey PRIMARY KEY (exercise_id);


--
-- Name: exercise_steps exercise_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_steps
    ADD CONSTRAINT exercise_steps_pkey PRIMARY KEY (step_id);


--
-- Name: exercise_steps exercise_steps_unique_ex_step; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_steps
    ADD CONSTRAINT exercise_steps_unique_ex_step UNIQUE (exercise_id, step_number);


--
-- Name: exercise_tips exercise_tips_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_tips
    ADD CONSTRAINT exercise_tips_pkey PRIMARY KEY (tip_id);


--
-- Name: exercise_videos exercise_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_videos
    ADD CONSTRAINT exercise_videos_pkey PRIMARY KEY (id);


--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (exercise_id);


--
-- Name: exercises exercises_slug_key; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_slug_key UNIQUE (slug);


--
-- Name: image_exercise image_exercise_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.image_exercise
    ADD CONSTRAINT image_exercise_pkey PRIMARY KEY (image_id);


--
-- Name: login_history login_history_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_history_pkey PRIMARY KEY (login_id);


--
-- Name: muscle_groups muscle_groups_model_identifier_key; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.muscle_groups
    ADD CONSTRAINT muscle_groups_model_identifier_key UNIQUE (model_identifier);


--
-- Name: muscle_groups muscle_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.muscle_groups
    ADD CONSTRAINT muscle_groups_pkey PRIMARY KEY (muscle_group_id);


--
-- Name: muscle_groups muscle_groups_slug_key; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.muscle_groups
    ADD CONSTRAINT muscle_groups_slug_key UNIQUE (slug);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: onboarding_answers onboarding_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_answers
    ADD CONSTRAINT onboarding_answers_pkey PRIMARY KEY (answer_id);


--
-- Name: onboarding_answers onboarding_answers_session_step_uq; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_answers
    ADD CONSTRAINT onboarding_answers_session_step_uq UNIQUE (session_id, step_id);


--
-- Name: onboarding_fields onboarding_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_fields
    ADD CONSTRAINT onboarding_fields_pkey PRIMARY KEY (field_id);


--
-- Name: onboarding_fields onboarding_fields_step_field_key_uq; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_fields
    ADD CONSTRAINT onboarding_fields_step_field_key_uq UNIQUE (step_id, field_key);


--
-- Name: onboarding_sessions onboarding_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_sessions
    ADD CONSTRAINT onboarding_sessions_pkey PRIMARY KEY (session_id);


--
-- Name: onboarding_steps onboarding_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_steps
    ADD CONSTRAINT onboarding_steps_pkey PRIMARY KEY (step_id);


--
-- Name: onboarding_steps onboarding_steps_step_key_key; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_steps
    ADD CONSTRAINT onboarding_steps_step_key_key UNIQUE (step_key);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: plan_exercise_details ped_unique_plan_session; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.plan_exercise_details
    ADD CONSTRAINT ped_unique_plan_session UNIQUE (plan_id, session_order);


--
-- Name: plan_exercise_details plan_exercise_details_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.plan_exercise_details
    ADD CONSTRAINT plan_exercise_details_pkey PRIMARY KEY (plan_exercise_id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (plan_id);


--
-- Name: subscription_plans subscription_plans_slug_key; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_slug_key UNIQUE (slug);


--
-- Name: system_content system_content_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.system_content
    ADD CONSTRAINT system_content_pkey PRIMARY KEY (key);


--
-- Name: transactions transactions_payos_order_code_key; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_payos_order_code_key UNIQUE (payos_order_code);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (transaction_id);


--
-- Name: ai_usage uq_ai_usage_key; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.ai_usage
    ADD CONSTRAINT uq_ai_usage_key UNIQUE (user_id, anon_key, feature, period_key);


--
-- Name: user_screenshots user_screenshots_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.user_screenshots
    ADD CONSTRAINT user_screenshots_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: workout_plans workout_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_plans
    ADD CONSTRAINT workout_plans_pkey PRIMARY KEY (plan_id);


--
-- Name: workout_session_exercises workout_session_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_session_exercises
    ADD CONSTRAINT workout_session_exercises_pkey PRIMARY KEY (session_exercise_id);


--
-- Name: workout_session_sets workout_session_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_session_sets
    ADD CONSTRAINT workout_session_sets_pkey PRIMARY KEY (set_id);


--
-- Name: workout_sessions workout_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_pkey PRIMARY KEY (session_id);


--
-- Name: workout_session_exercises wse_unique_session_order; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_session_exercises
    ADD CONSTRAINT wse_unique_session_order UNIQUE (session_id, session_order);


--
-- Name: workout_session_sets wss_unique_exercise_set; Type: CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_session_sets
    ADD CONSTRAINT wss_unique_exercise_set UNIQUE (session_exercise_id, set_index);


--
-- Name: dashboard_review_comments_created_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX dashboard_review_comments_created_idx ON public.dashboard_review_comments USING btree (created_at);


--
-- Name: dashboard_review_comments_review_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX dashboard_review_comments_review_id_idx ON public.dashboard_review_comments USING btree (review_id);


--
-- Name: dashboard_review_comments_user_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX dashboard_review_comments_user_id_idx ON public.dashboard_review_comments USING btree (user_id);


--
-- Name: dashboard_review_votes_review_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX dashboard_review_votes_review_id_idx ON public.dashboard_review_votes USING btree (review_id);


--
-- Name: dashboard_review_votes_user_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX dashboard_review_votes_user_id_idx ON public.dashboard_review_votes USING btree (user_id);


--
-- Name: dashboard_reviews_created_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX dashboard_reviews_created_idx ON public.dashboard_reviews USING btree (created_at);


--
-- Name: dashboard_reviews_rating_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX dashboard_reviews_rating_idx ON public.dashboard_reviews USING btree (rating);


--
-- Name: dashboard_reviews_user_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX dashboard_reviews_user_id_idx ON public.dashboard_reviews USING btree (user_id);


--
-- Name: emc_group_ids_array_gin; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX emc_group_ids_array_gin ON public.exercise_muscle_combinations USING gin (muscle_group_ids_array);


--
-- Name: emc_group_ids_sorted_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX emc_group_ids_sorted_idx ON public.exercise_muscle_combinations USING btree (muscle_group_ids_sorted);


--
-- Name: emc_primary_count_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX emc_primary_count_idx ON public.exercise_muscle_combinations USING btree (primary_muscle_count);


--
-- Name: emc_total_count_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX emc_total_count_idx ON public.exercise_muscle_combinations USING btree (total_muscle_count);


--
-- Name: emg_exercise_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX emg_exercise_id_idx ON public.exercise_muscle_group USING btree (exercise_id);


--
-- Name: emg_exercise_impact_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX emg_exercise_impact_idx ON public.exercise_muscle_group USING btree (exercise_id, impact_level);


--
-- Name: emg_impact_level_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX emg_impact_level_idx ON public.exercise_muscle_group USING btree (impact_level);


--
-- Name: emg_muscle_group_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX emg_muscle_group_id_idx ON public.exercise_muscle_group USING btree (muscle_group_id);


--
-- Name: exercise_steps_exercise_step_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX exercise_steps_exercise_step_idx ON public.exercise_steps USING btree (exercise_id, step_number);


--
-- Name: exercise_steps_json_gin; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX exercise_steps_json_gin ON public.exercise_steps_json USING gin (steps);


--
-- Name: exercise_tips_exercise_type_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX exercise_tips_exercise_type_idx ON public.exercise_tips USING btree (exercise_id, tip_type);


--
-- Name: exercises_difficulty_level_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX exercises_difficulty_level_idx ON public.exercises USING btree (difficulty_level);


--
-- Name: exercises_exercise_type_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX exercises_exercise_type_idx ON public.exercises USING btree (exercise_type);


--
-- Name: exercises_popularity_score_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX exercises_popularity_score_idx ON public.exercises USING btree (popularity_score);


--
-- Name: idx_ai_usage_feature_period; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_ai_usage_feature_period ON public.ai_usage USING btree (feature, period_key);


--
-- Name: idx_ai_usage_user; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_ai_usage_user ON public.ai_usage USING btree (user_id);


--
-- Name: idx_bug_reports_created; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_bug_reports_created ON public.bug_reports USING btree (created_at);


--
-- Name: idx_bug_reports_severity; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_bug_reports_severity ON public.bug_reports USING btree (severity);


--
-- Name: idx_bug_reports_status; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_bug_reports_status ON public.bug_reports USING btree (status);


--
-- Name: idx_bug_reports_user; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_bug_reports_user ON public.bug_reports USING btree (user_id);


--
-- Name: idx_login_history_user_created; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_login_history_user_created ON public.login_history USING btree (user_id, created_at);


--
-- Name: idx_notifications_user_created; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_notifications_user_created ON public.notifications USING btree (user_id, created_at);


--
-- Name: idx_notifications_user_read; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_notifications_user_read ON public.notifications USING btree (user_id, read_at);


--
-- Name: idx_transactions_plan; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_transactions_plan ON public.transactions USING btree (plan_id);


--
-- Name: idx_transactions_status; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_transactions_status ON public.transactions USING btree (status);


--
-- Name: idx_transactions_user; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_transactions_user ON public.transactions USING btree (user_id);


--
-- Name: idx_user_screenshots_created_at; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_user_screenshots_created_at ON public.user_screenshots USING btree (created_at DESC);


--
-- Name: idx_user_screenshots_feature; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_user_screenshots_feature ON public.user_screenshots USING btree (feature);


--
-- Name: idx_user_screenshots_user_id; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX idx_user_screenshots_user_id ON public.user_screenshots USING btree (user_id);


--
-- Name: img_ex_one_primary; Type: INDEX; Schema: public; Owner: tu
--

CREATE UNIQUE INDEX img_ex_one_primary ON public.image_exercise USING btree (exercise_id) WHERE (is_primary IS TRUE);


--
-- Name: img_exercise_exercise_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX img_exercise_exercise_id_idx ON public.image_exercise USING btree (exercise_id);


--
-- Name: img_exercise_exercise_order_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX img_exercise_exercise_order_idx ON public.image_exercise USING btree (exercise_id, display_order);


--
-- Name: muscle_groups_level_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX muscle_groups_level_idx ON public.muscle_groups USING btree (level);


--
-- Name: muscle_groups_parent_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX muscle_groups_parent_id_idx ON public.muscle_groups USING btree (parent_id);


--
-- Name: onboarding_answers_session_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX onboarding_answers_session_idx ON public.onboarding_answers USING btree (session_id);


--
-- Name: onboarding_answers_step_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX onboarding_answers_step_idx ON public.onboarding_answers USING btree (step_id);


--
-- Name: onboarding_fields_step_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX onboarding_fields_step_idx ON public.onboarding_fields USING btree (step_id);


--
-- Name: onboarding_sessions_completed_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX onboarding_sessions_completed_idx ON public.onboarding_sessions USING btree (is_completed);


--
-- Name: onboarding_sessions_user_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX onboarding_sessions_user_idx ON public.onboarding_sessions USING btree (user_id);


--
-- Name: onboarding_steps_order_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX onboarding_steps_order_idx ON public.onboarding_steps USING btree (order_index);


--
-- Name: password_resets_expires_at_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX password_resets_expires_at_idx ON public.password_resets USING btree (expires_at);


--
-- Name: password_resets_token_hash_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX password_resets_token_hash_idx ON public.password_resets USING btree (token_hash);


--
-- Name: password_resets_user_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX password_resets_user_id_idx ON public.password_resets USING btree (user_id);


--
-- Name: ped_exercise_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX ped_exercise_id_idx ON public.plan_exercise_details USING btree (exercise_id);


--
-- Name: ped_plan_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX ped_plan_id_idx ON public.plan_exercise_details USING btree (plan_id);


--
-- Name: ped_plan_session_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX ped_plan_session_idx ON public.plan_exercise_details USING btree (plan_id, session_order);


--
-- Name: uq_subscription_plans_slug; Type: INDEX; Schema: public; Owner: tu
--

CREATE UNIQUE INDEX uq_subscription_plans_slug ON public.subscription_plans USING btree (slug);


--
-- Name: users_is_super_admin; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX users_is_super_admin ON public.users USING btree (is_super_admin);


--
-- Name: users_last_active_at_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX users_last_active_at_idx ON public.users USING btree (last_active_at);


--
-- Name: users_parent_admin_id; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX users_parent_admin_id ON public.users USING btree (parent_admin_id);


--
-- Name: users_phone_unique_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE UNIQUE INDEX users_phone_unique_idx ON public.users USING btree (phone) WHERE (phone IS NOT NULL);


--
-- Name: users_user_exp_date_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX users_user_exp_date_idx ON public.users USING btree (user_exp_date);


--
-- Name: users_user_type_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX users_user_type_idx ON public.users USING btree (user_type);


--
-- Name: ws_plan_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX ws_plan_id_idx ON public.workout_sessions USING btree (plan_id);


--
-- Name: ws_status_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX ws_status_idx ON public.workout_sessions USING btree (status);


--
-- Name: ws_user_started_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX ws_user_started_idx ON public.workout_sessions USING btree (user_id, started_at);


--
-- Name: wse_exercise_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX wse_exercise_id_idx ON public.workout_session_exercises USING btree (exercise_id);


--
-- Name: wse_session_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX wse_session_id_idx ON public.workout_session_exercises USING btree (session_id);


--
-- Name: wss_session_exercise_id_idx; Type: INDEX; Schema: public; Owner: tu
--

CREATE INDEX wss_session_exercise_id_idx ON public.workout_session_sets USING btree (session_exercise_id);


--
-- Name: exercise_muscle_group tr_emg_after_change; Type: TRIGGER; Schema: public; Owner: tu
--

CREATE TRIGGER tr_emg_after_change AFTER INSERT OR DELETE OR UPDATE ON public.exercise_muscle_group FOR EACH ROW EXECUTE FUNCTION public.emg_after_row_change();


--
-- Name: ai_usage ai_usage_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.ai_usage
    ADD CONSTRAINT ai_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: bug_reports bug_reports_responded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.bug_reports
    ADD CONSTRAINT bug_reports_responded_by_fkey FOREIGN KEY (responded_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bug_reports bug_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.bug_reports
    ADD CONSTRAINT bug_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dashboard_review_comments dashboard_review_comments_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.dashboard_review_comments
    ADD CONSTRAINT dashboard_review_comments_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.dashboard_reviews(review_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dashboard_review_comments dashboard_review_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.dashboard_review_comments
    ADD CONSTRAINT dashboard_review_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dashboard_review_votes dashboard_review_votes_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.dashboard_review_votes
    ADD CONSTRAINT dashboard_review_votes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.dashboard_reviews(review_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dashboard_review_votes dashboard_review_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.dashboard_review_votes
    ADD CONSTRAINT dashboard_review_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dashboard_reviews dashboard_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.dashboard_reviews
    ADD CONSTRAINT dashboard_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exercise_favorites exercise_favorites_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_favorites
    ADD CONSTRAINT exercise_favorites_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON DELETE CASCADE;


--
-- Name: exercise_favorites exercise_favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_favorites
    ADD CONSTRAINT exercise_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: exercise_muscle_combinations exercise_muscle_combinations_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_muscle_combinations
    ADD CONSTRAINT exercise_muscle_combinations_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exercise_muscle_group exercise_muscle_group_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_muscle_group
    ADD CONSTRAINT exercise_muscle_group_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exercise_muscle_group exercise_muscle_group_muscle_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_muscle_group
    ADD CONSTRAINT exercise_muscle_group_muscle_group_id_fkey FOREIGN KEY (muscle_group_id) REFERENCES public.muscle_groups(muscle_group_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exercise_steps exercise_steps_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_steps
    ADD CONSTRAINT exercise_steps_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exercise_steps_json exercise_steps_json_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_steps_json
    ADD CONSTRAINT exercise_steps_json_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exercise_tips exercise_tips_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_tips
    ADD CONSTRAINT exercise_tips_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exercise_videos exercise_videos_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.exercise_videos
    ADD CONSTRAINT exercise_videos_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON DELETE CASCADE;


--
-- Name: image_exercise image_exercise_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.image_exercise
    ADD CONSTRAINT image_exercise_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: muscle_groups muscle_groups_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.muscle_groups
    ADD CONSTRAINT muscle_groups_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.muscle_groups(muscle_group_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: onboarding_answers onboarding_answers_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_answers
    ADD CONSTRAINT onboarding_answers_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.onboarding_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: onboarding_answers onboarding_answers_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_answers
    ADD CONSTRAINT onboarding_answers_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.onboarding_steps(step_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: onboarding_fields onboarding_fields_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_fields
    ADD CONSTRAINT onboarding_fields_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.onboarding_steps(step_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: onboarding_sessions onboarding_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.onboarding_sessions
    ADD CONSTRAINT onboarding_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: plan_exercise_details plan_exercise_details_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.plan_exercise_details
    ADD CONSTRAINT plan_exercise_details_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: plan_exercise_details plan_exercise_details_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.plan_exercise_details
    ADD CONSTRAINT plan_exercise_details_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.workout_plans(plan_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: system_content system_content_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.system_content
    ADD CONSTRAINT system_content_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(plan_id) ON DELETE RESTRICT;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_screenshots user_screenshots_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.user_screenshots
    ADD CONSTRAINT user_screenshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_parent_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_parent_admin_id_fkey FOREIGN KEY (parent_admin_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: workout_plans workout_plans_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_plans
    ADD CONSTRAINT workout_plans_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: workout_session_exercises workout_session_exercises_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_session_exercises
    ADD CONSTRAINT workout_session_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(exercise_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: workout_session_exercises workout_session_exercises_plan_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_session_exercises
    ADD CONSTRAINT workout_session_exercises_plan_exercise_id_fkey FOREIGN KEY (plan_exercise_id) REFERENCES public.plan_exercise_details(plan_exercise_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: workout_session_exercises workout_session_exercises_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_session_exercises
    ADD CONSTRAINT workout_session_exercises_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.workout_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workout_session_sets workout_session_sets_session_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_session_sets
    ADD CONSTRAINT workout_session_sets_session_exercise_id_fkey FOREIGN KEY (session_exercise_id) REFERENCES public.workout_session_exercises(session_exercise_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workout_sessions workout_sessions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.workout_plans(plan_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: workout_sessions workout_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tu
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict NVMTS7vpLnhsDIb5n6TfljJhlpnhMkRuLyWoxnZTYmXrip6Yn2oeWvJM7z7WMTo

