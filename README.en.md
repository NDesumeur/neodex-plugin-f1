# Formule 1 (Formula 1)

The whole Formula 1 season in NeoDex: the calendar with every session's time in Paris time, a countdown to the next Grand Prix, each round's results and the drivers' and constructors' standings.

*Version française : [README.md](README.md)*

## The tabs

- **Calendar**: the next Grand Prix in large, with the countdown (D-…, or "Live" during the weekend) and all its sessions: free practice 1, 2 and 3, sprint, qualifying and race, in Paris time. Below, every round of the season with its date, country and winner once raced; sprint weekends are marked.
- **Results**: for any completed round, the classification of the **race** (position, driver, team, time or gap, points, grid position, fastest lap ⏱, retirements, laps down), **qualifying** and the **sprint**.
- **Drivers**: the championship standings, with points as bars in team colours, after the latest round.
- **Constructors**: the constructors' standings, the same way.

## Your driver

The **star** next to a driver makes them your driver: their row is highlighted in results and standings. Clicking the star again removes it.

## Schedule

Tick **Add qualifying and races to my schedule**: upcoming qualifying sessions, sprints and races are added to the NeoDex calendar, with their times. The list is refreshed every 6 hours; unticking the box removes everything.

## The data

Results come from **Jolpica**, the open successor to the former Ergast database, updated after each session. Each page is requested at most once every 10 minutes; if the service is busy, the plugin retries by itself and then tells you. Without a connection, a message says so. Times are shown in Paris time.

## Data and sync

Your driver and the schedule choice are stored by NeoDex, backed up and synced between your PCs when sync is on. The plugin only contacts `api.jolpi.ca`.

## Install

In NeoDex: **NeoStore → Discover → Formule 1 → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
