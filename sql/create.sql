-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2025-10-04 10:43:04.944

-- tables
-- Table: achievements
CREATE TABLE achievements (
    id serial  NOT NULL,
    user_id uuid  NOT NULL,
    type text  NOT NULL,
    title text  NOT NULL,
    description text  NOT NULL,
    earned_at timestamptz  NOT NULL,
    users_id uuid  NOT NULL,
    CONSTRAINT achievements_pk PRIMARY KEY (id)
);

-- Table: categories
CREATE TABLE categories (
    id serial  NOT NULL,
    name text  NOT NULL,
    slug text  NOT NULL,
    CONSTRAINT categories_pk PRIMARY KEY (id)
);

-- Table: equipment
CREATE TABLE equipment (
    id serial  NOT NULL,
    name text  NOT NULL,
    CONSTRAINT equipment_pk PRIMARY KEY (id)
);

-- Table: exercise_equipment
CREATE TABLE exercise_equipment (
    exercise_id uuid  NOT NULL,
    equipment_id int  NOT NULL,
    CONSTRAINT exercise_equipment_pk PRIMARY KEY (exercise_id)
);

-- Table: exercises
CREATE TABLE exercises (
    id uuid  NOT NULL,
    title text  NOT NULL,
    description text  NOT NULL,
    category_id int  NOT NULL,
    primary_muscle text  NOT NULL,
    difficulty smallint  NOT NULL,
    duration_seconds int  NOT NULL,
    is_premium boolean  NOT NULL,
    created_by uuid  NOT NULL,
    created_at timestamptz  NOT NULL,
    updated_at timestamptz  NOT NULL,
    soft_deleted boolean  NOT NULL,
    categories_id int  NOT NULL,
    CONSTRAINT exercises_pk PRIMARY KEY (id)
);

-- Table: oauth_accounts
CREATE TABLE oauth_accounts (
    id serial  NOT NULL,
    user_id uuid  NOT NULL,
    provider text  NOT NULL,
    provider_user_id text  NOT NULL,
    users_id uuid  NOT NULL,
    CONSTRAINT oauth_accounts_pk PRIMARY KEY (id)
);

-- Table: payments
CREATE TABLE payments (
    payment_id uuid  NOT NULL,
    user_id uuid  NOT NULL,
    subscription_id int  NOT NULL,
    date timestamptz  NOT NULL,
    amount decimal(10,2)  NOT NULL,
    method text  NOT NULL,
    status text  NOT NULL,
    subscriptions_id int  NOT NULL,
    users_id uuid  NOT NULL,
    CONSTRAINT payments_pk PRIMARY KEY (payment_id)
);

-- Table: program_exercises
CREATE TABLE program_exercises (
    id uuid  NOT NULL,
    program_id uuid  NOT NULL,
    exercise_id uuid  NOT NULL,
    position int  NOT NULL,
    sets smallint  NOT NULL,
    reps text  NOT NULL,
    rest_seconds int  NOT NULL,
    CONSTRAINT program_exercises_pk PRIMARY KEY (id)
);

-- Table: programs
CREATE TABLE programs (
    id uuid  NOT NULL,
    title text  NOT NULL,
    description text  NOT NULL,
    difficulty smallint  NOT NULL,
    duration_minutes int  NOT NULL,
    is_premium boolean  NOT NULL,
    created_at timestamptz  NOT NULL,
    updated_at timestamptz  NOT NULL,
    CONSTRAINT programs_pk PRIMARY KEY (id)
);

-- Table: progress_metrics
CREATE TABLE progress_metrics (
    id uuid  NOT NULL,
    user_id uuid  NOT NULL,
    metric_type text  NOT NULL,
    value decimal(10,2)  NOT NULL,
    measured_at timestamptz  NOT NULL,
    users_id uuid  NOT NULL,
    CONSTRAINT progress_metrics_pk PRIMARY KEY (id)
);

-- Table: schedules
CREATE TABLE schedules (
    id uuid  NOT NULL,
    user_id uuid  NOT NULL,
    program_id uuid  NOT NULL,
    exercise_id uuid  NOT NULL,
    scheduled_date date  NOT NULL,
    scheduled_time time  NOT NULL,
    status text  NOT NULL,
    created_at timestamptz  NOT NULL,
    updated_at timestamptz  NOT NULL,
    CONSTRAINT schedules_pk PRIMARY KEY (id)
);

-- Table: subscriptions
CREATE TABLE subscriptions (
    id serial  NOT NULL,
    user_id uuid  NOT NULL,
    type text  NOT NULL,
    plan text  NOT NULL,
    start_date date  NOT NULL,
    end_date date  NOT NULL,
    auto_renew boolean  NOT NULL,
    status text  NOT NULL,
    users_id uuid  NOT NULL,
    CONSTRAINT subscriptions_pk PRIMARY KEY (id)
);

-- Table: tokens
CREATE TABLE tokens (
    id serial  NOT NULL,
    user_id uuid  NOT NULL,
    device_id text  NOT NULL,
    refresh_token_hash text  NOT NULL,
    ttl timestamptz  NOT NULL,
    revoked boolean  NOT NULL,
    CONSTRAINT tokens_pk PRIMARY KEY (id)
);

-- Table: user_profiles
CREATE TABLE user_profiles (
    user_id uuid  NOT NULL,
    name text  NOT NULL,
    birth_date date  NOT NULL,
    gender text  NOT NULL,
    weight decimal(5,2)  NOT NULL,
    height decimal(5,2)  NOT NULL,
    goal text  NOT NULL,
    "level" text  NOT NULL,
    CONSTRAINT user_profiles_pk PRIMARY KEY (user_id)
);

-- Table: users
CREATE TABLE users (
    id uuid  NOT NULL,
    email text  NOT NULL,
    password_hash text  NOT NULL,
    email_verified boolean  NOT NULL,
    created_at timestamptz  NOT NULL,
    updated_at timestamptz  NOT NULL,
    last_login_at timestamptz  NOT NULL,
    soft_deleted boolean  NOT NULL,
    CONSTRAINT users_pk PRIMARY KEY (id)
);

-- Table: workout_logs
CREATE TABLE workout_logs (
    id uuid  NOT NULL,
    user_id uuid  NOT NULL,
    schedule_id uuid  NOT NULL,
    exercise_id uuid  NOT NULL,
    sets smallint  NOT NULL,
    reps jsonb  NOT NULL,
    duration_seconds int  NOT NULL,
    calories_est decimal(6,2)  NOT NULL,
    completed_at timestamptz  NOT NULL,
    schedules_id uuid  NOT NULL,
    CONSTRAINT workout_logs_pk PRIMARY KEY (id)
);

-- foreign keys
-- Reference: achievements_users (table: achievements)
ALTER TABLE achievements ADD CONSTRAINT achievements_users
    FOREIGN KEY (users_id)
    REFERENCES users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: equipment_exercise_equipment (table: exercise_equipment)
ALTER TABLE exercise_equipment ADD CONSTRAINT equipment_exercise_equipment
    FOREIGN KEY (equipment_id)
    REFERENCES equipment (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: exercise_equipment_exercises (table: exercise_equipment)
ALTER TABLE exercise_equipment ADD CONSTRAINT exercise_equipment_exercises
    FOREIGN KEY (exercise_id)
    REFERENCES exercises (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: exercises_categories (table: exercises)
ALTER TABLE exercises ADD CONSTRAINT exercises_categories
    FOREIGN KEY (categories_id)
    REFERENCES categories (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: exercises_users (table: exercises)
ALTER TABLE exercises ADD CONSTRAINT exercises_users
    FOREIGN KEY (created_by)
    REFERENCES users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: oauth_accounts_users (table: oauth_accounts)
ALTER TABLE oauth_accounts ADD CONSTRAINT oauth_accounts_users
    FOREIGN KEY (user_id)
    REFERENCES users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: payments_subscriptions (table: payments)
ALTER TABLE payments ADD CONSTRAINT payments_subscriptions
    FOREIGN KEY (subscriptions_id)
    REFERENCES subscriptions (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: payments_users (table: payments)
ALTER TABLE payments ADD CONSTRAINT payments_users
    FOREIGN KEY (users_id)
    REFERENCES users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: program_exercises_exercises (table: program_exercises)
ALTER TABLE program_exercises ADD CONSTRAINT program_exercises_exercises
    FOREIGN KEY (exercise_id)
    REFERENCES exercises (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: programs_program_exercises (table: program_exercises)
ALTER TABLE program_exercises ADD CONSTRAINT programs_program_exercises
    FOREIGN KEY (program_id)
    REFERENCES programs (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: progress_metrics_users (table: progress_metrics)
ALTER TABLE progress_metrics ADD CONSTRAINT progress_metrics_users
    FOREIGN KEY (users_id)
    REFERENCES users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: schedules_users (table: schedules)
ALTER TABLE schedules ADD CONSTRAINT schedules_users
    FOREIGN KEY (user_id)
    REFERENCES users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: subscriptions_users (table: subscriptions)
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_users
    FOREIGN KEY (users_id)
    REFERENCES users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: tokens_users (table: tokens)
ALTER TABLE tokens ADD CONSTRAINT tokens_users
    FOREIGN KEY (user_id)
    REFERENCES users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: users_user_profiles (table: users)
ALTER TABLE users ADD CONSTRAINT users_user_profiles
    FOREIGN KEY (id)
    REFERENCES user_profiles (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: workout_logs_schedules (table: workout_logs)
ALTER TABLE workout_logs ADD CONSTRAINT workout_logs_schedules
    FOREIGN KEY (schedules_id)
    REFERENCES schedules (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- End of file.



