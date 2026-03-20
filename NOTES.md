\# GachaLife Dev Notes



\## Stack

\- Frontend: React + TypeScript + Vite

\- Backend: Python + FastAPI + BeautifulSoup + Playwright

\- Calendar: react-big-calendar + date-fns



\## Current State

\- Genshin scraper working via genshin-builds.com (Astro island parsing)

\- Playwright integrated but hitting Windows asyncio compatibility issue

\- Frontend has: themes, clock, timezone selector, game filter, view toggle (timeline not built yet)

\- Default selected game: Genshin



\## Current Bug

\- Playwright throws NotImplementedError on Windows Python 3.14

\- Attempted fix: WindowsProactorEventLoopPolicy at top of main.py

\- Next step: test if that fix works, if not try WindowsSelectorEventLoopPolicy



\## Next Sessions

\- Fix Playwright Windows issue

\- Find and implement scrapers for HSR, ZZZ, WuWa, Arknights

\- Build Timeline component

\- localStorage theme persistence

\- Event detail modal

\- Loading spinner

\- Background slideshow based on selected games



\## Data Sources

\- Genshin: genshin-builds.com/en/timeline (working)

\- HSR: pom.moe/timeline (needs Playwright, structure unknown)

\- ZZZ: zzz.rng.moe/en/timeline (needs Playwright, structure unknown)

\- WuWa: wuwatracker.com/timeline (needs Playwright, blocked 403)

\- Arknights: arknights.wiki.gg (TOS friendly, structure unknown)

