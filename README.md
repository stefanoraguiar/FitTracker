# FitTracker

Mobile-first log for the Bony to Beastly muscle-building program. Pick a phase, week, and day, log every set, and keep the history on your phone. It works offline after the first load.

The workout sheets live in `src/data/program.json` (5 phases × 5 weeks × 3 full-body days). Exercise names, European Portuguese gym labels, and equipment are in `src/data/exercises.json`. Coaching cues in that data are paraphrased. This app does not reproduce the book.

## Run locally

Requires Node 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:5173/FitTracker/](http://localhost:5173/FitTracker/). The `/FitTracker/` base path matches GitHub Pages.

```bash
npm run build
npm run preview
```

`preview` serves the production build, including the service worker, at the same `/FitTracker/` path.

## Using it at the gym

- **Today** opens the next day you have not marked complete. Change phase, week, or day with the three menus.
- **EN / PT** switches exercise and equipment names. The other language stays on the line underneath, so a Portuguese machine label is still recognisable.
- **kg / lb** is kilograms by default. Logged weights are stored in kilograms and shown in the unit you pick. A comma or a dot both work as the decimal mark.
- Log weight and reps per set, then tap the check. The target reps are the placeholder. Rest times are minimums; **Start rest** runs an optional timer. **Circuits · listed rest** switches to straight sets and doubles the rest.
- **ALT** swaps in the listed alternative for that slot. History follows the movement you actually did.
- **Complete day** checks the session off. If required sets are still open, it asks you to confirm. Optional exercises are not required.
- **Program** is the 75-day map. Week 1 of each phase is marked lighter. **Repeat Phase 0** archives that phase’s logs into History and clears its checkmarks (up to three repeats is the suggestion; the button still works after that).
- **History** lists every exercise you have logged.
- **More** exports or imports a JSON backup. Data stays in `localStorage` on this phone. Nothing is uploaded.

Program rules, shown on the workout and under More:

- Stay within 2 reps of the target.
- Rest times are minimums (`+` means “at least”).
- Circuits are optional. Straight sets use double the listed rest.
- Phase 0 can be repeated. Don’t shorten a phase in the middle.
- Week 1 of each phase is lighter, and you go straight into it after week 5.

## Install on a phone

The production build is a PWA (`manifest.webmanifest` plus a service worker).

1. Deploy it (or open the GitHub Pages URL below).
2. On iPhone Safari: Share → **Add to Home Screen**.
3. On Android Chrome: **Install app** or **Add to Home screen**.

The first visit needs a network connection. After that the shell and program data are cached and the log still saves on the phone with no signal. Export a backup before clearing site data.

## Deploy to GitHub Pages

The site is built to be served from `/FitTracker/`, which is the project-page URL when the GitHub repository is named **FitTracker**:

`https://<user>.github.io/FitTracker/`

If the repository name is different, change `base` in `vite.config.ts` (the manifest `start_url` and `scope` use that same path).

1. Push this project to the `main` branch of the GitHub repo.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow `.github/workflows/deploy.yml` runs on every push to `main`. It installs dependencies, runs `npm run build`, and deploys the `dist` folder with `actions/deploy-pages`.
4. When the **Deploy GitHub Pages** workflow goes green, the Pages URL is on the workflow run and under Settings → Pages.

Pages for a public repository is free. The workflow needs the default `pages` environment GitHub creates the first time it runs.

## Movement pictures

Each exercise card has a thumbnail. It flips between the start and end of the movement. Tap it for a larger view with Start, End, and Pause. Alt text follows the EN/PT name switch.

Photos come from [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db) (built on [wrkout/exercises.json](https://github.com/wrkout/exercises.json)), released under [The Unlicense](https://unlicense.org/). Resized WebP files live in `public/exercises/`. The source exercise name, link, and license are in `src/data/visuals.ts` and under the large image. Nothing is taken from the Bony to Beastly book.

Where that dataset has no honest match, the card shows a FitTracker diagram instead of a wrong photo. Those are original drawings in the app, not third-party images.

The service worker precaches the WebP files with the rest of the app, so the pictures are available offline after the first load.

## Data and privacy

- `src/data/program.json` — phases, weeks, days, circuits, sets, reps, rest, paraphrased cues, and ALT options.
- `src/data/exercises.json` — 64 exercises with `name_en`, `name_pt`, aliases, equipment, and muscles.
- `src/data/visuals.ts` — photo or diagram for every exercise, including alternatives, with source and license.
- Logs, the EN/PT choice, the unit, and completed days are stored under the `localStorage` key `fittracker.v1`.
- Export format: `{ "app": "fittracker", "version": 1, "exportedAt": "...", "state": { ... } }`. Import accepts that file, or a raw state object of version 1.

FitTracker is a personal training tool and is not affiliated with the program’s authors.
