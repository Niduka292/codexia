# CODEXIA 2026

CODEXIA is a themed computer-science competition website built around a deep-space transmission narrative. It presents the event, counts down to launch, accepts team registrations, and provides an admin dashboard for organizers.

## Event details

| Item | Details |
| --- | --- |
| Date | 22 October 2026 |
| Time | 3:00 PM |
| Venue | NFC 3 — New Faculty Complex 3 |
| Student ID format | `AS202XXXX` (example: `AS2022123`) |
| Maximum team size | 5 students, including the team leader |

The event values displayed by the website are stored in [`src/lib/event.ts`](src/lib/event.ts).

## Features

- Responsive sci-fi landing page with an event countdown
- Prominent team-registration call to action
- Two-step team registration form
- Server-side Zod validation
- Duplicate team name, email, and student ID checks
- Request-size and same-origin protection
- Rate limiting, submission timing checks, and a bot honeypot
- Google Sheets as the production registration store
- Organizer dashboard for viewing registrations
- Mobile-friendly layouts and accessible form errors

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Zod
- Lucide React

## Local setup

1. Install a current Node.js LTS release.
2. Install the project dependencies:

   ```bash
   npm ci
   ```

3. Create a `.env.local` file in the project root:

   ```env
   ADMIN_PASSCODE=replace-with-a-strong-passcode
   GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   SHEETS_API_SECRET=replace-with-a-long-random-secret
   ```

   Google Sheets registration configuration is required in production. Use the same `SHEETS_API_SECRET` in the Apps Script project settings. Do not use a `NEXT_PUBLIC_` prefix because these values must remain server-side.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create and type-check a production build |
| `npm start` | Start the production build |

## Registration rules

- Team names must be unique.
- Leader email addresses cannot be reused for another registration.
- Every leader and team member must have a unique student ID.
- Student IDs must match `AS20` followed by five digits. The form displays this as `AS202XXXX`.
- A team can contain one leader and up to four additional members.
- Academic years and programming languages must use the options provided by the form.
- All submitted values are validated again by the API; client-side checks are not trusted.

Shared form options are defined in [`src/lib/registration-options.ts`](src/lib/registration-options.ts), while the server schema is defined in [`src/lib/registration-schema.ts`](src/lib/registration-schema.ts).

## Registration storage

Google Sheets is the primary registration store in production. The Apps Script checks duplicate team names, email addresses, and student IDs atomically before appending a row. The admin dashboard and participant counter read from that same sheet. The `Leaderboard` tab supplies live scores to the public and admin leaderboard views. Follow [`GOOGLE_SHEETS_SETUP.md`](GOOGLE_SHEETS_SETUP.md) to configure both features.

When the Google Sheets variables are absent in development, the app falls back to `registrations.json` so local testing still works. Production intentionally returns a configuration error instead of trying to write to an ephemeral filesystem.

## Admin dashboard

- Login: `/admin/login`
- Dashboard: `/admin/dashboard`
- Configure `ADMIN_PASSCODE` before running the application in production.

The current passcode-based authentication is intended as a basic organizer control. A public production deployment should use signed sessions or an authentication provider.

## Updating the logo

The active website logo is:

```text
public/codexia-transparent.png
```

Replacing `public/codexia.png` will not update the website because that file is not referenced by the current UI. Replace `codexia-transparent.png` using the exact same filename, restart the development server, and perform a hard refresh with `Ctrl+F5`.

If the old image remains cached, rename the asset and update its two references in:

- `src/components/Navbar.tsx`
- `src/app/page.tsx`

## Production

Verify the application before deployment:

```bash
npm run lint
npm run build
```

For a Git-connected hosting service, commit and push the changes to the branch monitored by that service. Changes made only in the local project folder will not update the live website.

## Main project structure

```text
src/
  app/
    api/register/route.ts       Registration API
    admin/                      Admin login and dashboard
    register/                   Public registration page
    page.tsx                    Landing page
  components/                   Shared interface components
  lib/
    event.ts                    Event date, time, and venue
    google-sheets.ts            Production registration persistence
    registration-options.ts     Shared registration rules
    registration-schema.ts      Server-side validation schema
    registrations.ts            Development-only JSON fallback
public/
  codexia-transparent.png       Active CODEXIA logo
```
