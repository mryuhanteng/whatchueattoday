-- Run this in your Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- PROFILES TABLE
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_emoji text default '🌟',
  avatar_color text default '#FFE8D6',
  created_at timestamp with time zone default timezone('utc', now())
);

-- MEALS TABLE
create table meals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  emoji text not null,
  name text not null,
  description text default '',
  created_at timestamp with time zone default timezone('utc', now())
);

-- REACTIONS TABLE
create table reactions (
  id uuid default gen_random_uuid() primary key,
  meal_id uuid references meals(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  emoji text not null,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(meal_id, user_id, emoji)
);

-- ENABLE ROW LEVEL SECURITY
alter table profiles enable row level security;
alter table meals enable row level security;
alter table reactions enable row level security;

-- POLICIES: profiles
create policy "public profiles are viewable by everyone" on profiles for select using (true);
create policy "users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "users can update their own profile" on profiles for update using (auth.uid() = id);

-- POLICIES: meals
create policy "meals are viewable by everyone" on meals for select using (true);
create policy "users can insert their own meals" on meals for insert with check (auth.uid() = user_id);
create policy "users can delete their own meals" on meals for delete using (auth.uid() = user_id);

-- POLICIES: reactions
create policy "reactions are viewable by everyone" on reactions for select using (true);
create policy "users can insert their own reactions" on reactions for insert with check (auth.uid() = user_id);
create policy "users can delete their own reactions" on reactions for delete using (auth.uid() = user_id);
