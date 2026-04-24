# 🍽️ whatchueattoday

> see what everyone's eating & get inspired ✨

A fun social app where people post what they ate today so nobody ever has to wonder what to eat.

---

## deploy in 4 steps (takes ~20 min, all free)

### step 1 — set up supabase (your database + auth)

1. go to **supabase.com** → create a free account → new project
2. pick a name (e.g. `whatchueattoday`) and a strong password → create project
3. once it loads, go to **SQL Editor** in the left sidebar
4. paste the entire contents of `supabase-schema.sql` and click **Run**
5. go to **Settings → API** and copy:
   - `Project URL`
   - `anon public` key

### step 2 — add your keys

1. duplicate `.env.local.example` → rename to `.env.local`
2. paste your Supabase URL and anon key into the file

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### step 3 — push to github

1. go to **github.com** → new repository → name it `whatchueattoday` → create
2. open terminal in this folder and run:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/whatchueattoday.git
git push -u origin main
```

### step 4 — deploy on vercel (free)

1. go to **vercel.com** → sign up with GitHub
2. click **Add New Project** → import your `whatchueattoday` repo
3. before deploying, click **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your supabase url
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your supabase anon key
4. click **Deploy** → done 🚀

your app will be live at `whatchueattoday.vercel.app` (or you can add a custom domain)

---

## run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

---

## features

- ✅ sign up / log in with email + password
- ✅ post what you ate with an emoji + description
- ✅ see everyone's meals in a live feed
- ✅ react with 😍 🔥 😂 (toggle on/off)
- ✅ "you" badge on your own posts

## tech stack

- **Next.js 14** — React framework
- **Supabase** — auth + postgres database
- **Vercel** — hosting
