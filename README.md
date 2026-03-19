# Catchr 🎣

A private Chrome extension that logs job listings to a Google Sheet with one click. Built for personal use during an active job search.

## What it does

When you're on a supported job listing page, click the Catchr icon in your Chrome toolbar. The extension scrapes the company, position, location, and link — pre-fills them in a popup where you can edit if needed — then logs the row directly to your Google Sheet with the date and applied status auto-filled.

## Supported job sites

- LinkedIn
- Greenhouse
- Lever
- Wellfound / AngelList
- Ashby

## Google Sheet columns

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Company | Location | Position | Link | Applied | Date Applied |

- **Applied** auto-fills as `yes`
- **Date Applied** auto-fills as today's date (e.g. `3/18/26`)

## Tech stack

- Manifest V3
- Vanilla HTML / CSS / JavaScript
- Google Sheets API v4
- Chrome Identity API (OAuth 2.0)

## Installation (private use)

This extension is not published to the Chrome Web Store. To run it locally:

1. Clone this repo
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the `catchr` folder
5. Complete the Google OAuth setup (see below)

## Google Cloud setup

To connect Catchr to your Google Sheet you'll need:

1. A Google Cloud project with the **Google Sheets API** enabled
2. An OAuth 2.0 client ID (Chrome Extension type)
3. Your extension ID added to the OAuth client
4. Your Google account added as a test user on the OAuth consent screen
5. Your Client ID pasted into `manifest.json`
6. Your Sheet ID pasted into `background.js`

## Project structure
```
catchr/
├── manifest.json       # Extension config, permissions, OAuth client ID
├── popup.html          # Popup UI
├── popup.css           # Styling
├── popup.js            # Popup logic, scraping trigger, Catch It button
├── background.js       # Auth + Google Sheets API call
├── content.js          # Page scrapers for each job site
└── icons/              # Extension icons
```

## Status

Active development. Currently working on:
- [ ] Scraper support for all 5 job sites
- [ ] Side panel conversion (so popup stays open)
- [ ] Duplicate detection

## License

Private use only. Not for redistribution.
