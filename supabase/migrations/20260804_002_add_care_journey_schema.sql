-- Add MOTHER_POSTNATAL and NEWBORN episode types
alter type episode_type_enum add value 'MOTHER_POSTNATAL' after 'PREGNANCY';
alter type episode_type_enum add value 'NEWBORN' after 'MOTHER_POSTNATAL';

-- Add milestone_type enum for structured milestone tracking
create type milestone_type_enum as enum (
    'PREGNANCY_REGISTRATION',
    'ANC_1',
    'ANC_2',
    'ANC_3',
    'ANC_4',
    'DELIVERY',
    'PNC_1',
    'PNC_2',
    'PNC_3',
    'PNC_4',
    'NB_1',
    'NB_2',
    'NB_3',
    'NB_4'
);

-- Enhance care_plan_milestones table
alter table care_plan_milestones
    add column milestone_type milestone_type_enum,
    add column expected_window_start date,
    add column expected_window_end date,
    add column milestone_sequence integer,
    add column is_overdue boolean default false;

-- Create delivery_records table to track delivery events
create table delivery_records (
    id uuid primary key default gen_random_uuid(),
    pregnancy_episode_id uuid references care_episodes(id),
    mother_postnatal_episode_id uuid references care_episodes(id),
    newborn_episode_id uuid references care_episodes(id),
    delivery_date date not null,
    delivery_type text, -- 'VAGINAL', 'CESAREAN', etc
    complications text,
    mother_outcome text,
    baby_weight_grams integer,
    baby_sex gender_enum,
    apgar_score integer,
    created_at timestamptz default now()
);

-- Add indexes for performance
create index idx_care_episodes_person_status on care_episodes(person_id, status);
create index idx_care_episodes_type on care_episodes(episode_type);
create index idx_milestones_episode_status on care_plan_milestones(episode_id, status);
create index idx_delivery_records_pregnancy on delivery_records(pregnancy_episode_id);

-- Create function to calculate milestone status
create or replace function get_milestone_status(
    due_date date,
    completed_date date,
    current_date date default current_date
)
returns text as $$
begin
    if completed_date is not null then
        return 'COMPLETED';
    elsif current_date > due_date then
        return 'OVERDUE';
    elsif current_date = due_date then
        return 'DUE';
    else
        return 'PENDING';
    end if;
end;
$$ language plpgsql immutable;

-- Add function to get gestational age from LMP
create or replace function calculate_gestational_age(lmp_date date)
returns integer as $$
begin
    return floor(extract(day from (current_date - lmp_date)) / 7);
end;
$$ language plpgsql immutable;

-- Grant necessary permissions
grant execute on function get_milestone_status to authenticated;
grant execute on function calculate_gestational_age to authenticated;
