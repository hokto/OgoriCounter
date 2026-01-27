# Ogori Counter - Vercel Deployment Guide

This guide explains how to deploy the application to Vercel and set up a Vercel Postgres database.

## Prerequisites
- A GitHub account (repo must be pushed to GitHub)
- A Vercel account

## Steps

### 1. Push to GitHub
If you haven't already, push your code to a GitHub repository.
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <YOUR_REPO_URL>
git push -u origin main
```

### 2. Import Project in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository.

### 3. Add Storage (Postgres)
**Before deploying**, you need to attach a database.
1. On the "Configure Project" screen (or in Project Settings > Storage later), find the **Storage** tab or button.
2. Click **"Create Database"** and select **Vercel Postgres**.
3. Give it a name (e.g., `ogori-db`) and region (e.g., `Washington, D.C. (iad1)` - use default usually).
4. **Important**: Once created, Vercel will automatically add the necessary environment variables (`POSTGRES_URL`, `POSTGRES_PRISMA_URL`, etc.) to your project.

### 4. Configure Environment Variables
In the "Environment Variables" section of the deployment screen, add the following (Vercel Postgres variables are added automatically, but you need Auth vars):

| Key | Value | Description |
|---|---|---|
| `AUTH_SECRET` | (Generate one) | Run `openssl rand -base64 32` or just type a long random string. |
| `AUTH_GOOGLE_ID` | `...` | Your Google Cloud Client ID (get from Google Console). |
| `AUTH_GOOGLE_SECRET` | `...` | Your Google Cloud Client Secret. |
| `NEXTAUTH_URL` | (Leave empty) | Vercel sets this automatically to the deployment URL. |

**Database Note**:
Vercel automatically sets `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`.
We need to tell Prisma to use these. Update `schema.prisma` if needed (see section below) OR update `.env` locally for mapping, but generally Vercel handles this if your schema uses `env("DATABASE_URL")` and you overwrite `DATABASE_URL` in Vercel to point to `POSTGRES_PRISMA_URL`?
**Wait!**
Easier way: Vercel documentation suggests:
- Set `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` automatically.
- In Vercel Environment Variables UI, make sure a variable named `DATABASE_URL` exists and links to the same value as `POSTGRES_PRISMA_URL` (Connection Pooling) or `POSTGRES_URL_NON_POOLING` (Direct).
- *Recommendation*: In Vercel Project Settings > Environment Variables:
  - Create a new variable `DATABASE_URL` with value ref: `${POSTGRES_PRISMA_URL}`

### 5. Deploy
Click **"Deploy"**.

- Vercel will run `npm install`
- It will run `npm run postinstall` -> `prisma generate`
- It will run `npm run build`

### 6. Apply Database Schema (Production)
Once deployed, the app needs the table structure.
You can run this from your local machine (if you pull env vars) or via Vercel dashboard if available.
**Easiest way from local machine**:
1. Install Vercel CLI: `npm i -g vercel`
2. Link project: `vercel link`
3. Pull env vars: `vercel env pull .env.production.local`
4. Push schema:
   ```bash
   npx prisma db push --schema=prisma/schema.prisma
   ```
   (Make sure `.env` or the environment used points to the production DB. Be careful not to overwrite local DB if you just reference `.env`. Using `vercel env pull` creates a separate file, so you might need to temporarily swap configs or pass env var inline).

   **Better way**:
   Go to your `package.json` and add a script usage, or just configure the "Build Command" in Vercel to allow migration? No, migration during build is risky.
   **Recommended**: Connect from your local terminal to the remote DB.
   ```bash
   export DATABASE_URL="<Copy value of POSTGRES_PRISMA_URL from Vercel>"
   npx prisma db push
   ```

### 7. Google Auth Callback URL
Don't forget to update your **Google Cloud Console**.
- Add the production domain: `https://your-app-name.vercel.app`
- Add callback URL: `https://your-app-name.vercel.app/api/auth/callback/google`

## Troubleshooting
- **Prisma Client Error**: If you see errors about missing binaries, ensure `package.json` has `"postinstall": "prisma generate"`.
- **Database Connection**: Verify `DATABASE_URL` environment variable is set in Vercel.
