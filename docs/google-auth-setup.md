# Google sign-in setup (Supabase)

Tailr uses **Supabase Auth** with the Google OAuth provider. Credentials live in the Supabase dashboard (not in `.env.local`).

## 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. **Create credentials** → **OAuth client ID** → type **Web application**.
3. **Authorized JavaScript origins** (add both):
   - `http://localhost:3000` (local dev)
   - `https://YOUR-PRODUCTION-DOMAIN` (e.g. your Vercel URL)
4. **Authorized redirect URIs** — add Supabase’s callback (from step 2 below):
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. Copy the **Client ID** and **Client secret**.

Optional: Configure **OAuth consent screen** (External) and add your email as a test user while the app is in “Testing” mode.

## 2. Supabase dashboard

1. **Authentication** → **Providers** → **Google** → Enable.
2. Paste **Client ID** and **Client secret** from Google.
3. **Authentication** → **URL Configuration**:
   - **Site URL**: production origin (e.g. `https://your-app.vercel.app`)
   - **Redirect URLs** (add all):
     - `http://localhost:3000/auth/callback`
     - `https://YOUR-PRODUCTION-DOMAIN/auth/callback`

## 3. Verify

1. Run `npm run dev`, open `/auth/login`.
2. Click **Continue with Google** → Google account picker → redirect to `/app`.
3. In Supabase **Authentication** → **Users**, the user should appear with provider `google`.
4. A row in `public.profiles` is created automatically via `handle_new_user` trigger.

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| `redirect_uri_mismatch` | Redirect URI in Google must exactly match `https://<ref>.supabase.co/auth/v1/callback` |
| Returns to login with an error | Check Supabase redirect URLs include `/auth/callback` for your origin |
| User in Auth but no profile | Re-run `supabase/schema.sql` (trigger + RLS) |
| Works locally, not production | Add production URL to Google origins + Supabase redirect URLs + Site URL |

## Email + Google on same address

Supabase can link identities when the same email is used. Prefer one sign-in method per account to avoid confusion.
