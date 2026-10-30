# PacketCheck marketing kit

Made on 30 October 2026, in two rounds. Nothing here has been posted, sent or deployed.

## Start here (15 minutes)

1. Read [PLAN.md](PLAN.md): who we market to, the channels in order, a 30-day calendar and what to measure.
2. Skim [BRAND.md](BRAND.md): voice, words to avoid, colours, and the claims we can and cannot make.
3. Look through `images/` and `video/`.
4. Review the site changes (below), then commit and deploy when happy.

## What's in the folder

| Path | What |
|------|------|
| `PLAN.md` | Positioning, audiences, channels, 30-day calendar, metrics, rules |
| `BRAND.md` | Voice, word list, colours, type, pictures, allowed claims |
| `copy/launch.md` | Show HN post and first comment, Product Hunt listing, Indie Hackers post |
| `copy/social.md` | 8 weekly posts for X, Bluesky, Mastodon and LinkedIn, each with an image |
| `copy/replies.md` | Reddit and forum reply templates (help first, disclose always) |
| `copy/outreach.md` | Emails to creators, local TV, libraries, credit unions |
| `copy/video.md` | Shot list for a 30 s Windows recording and a 60 s talking video |
| `images/og.png` | Share image (1200 × 630), also installed on the site |
| `images/x-*.png` | 16:9 posts (1600 × 900) |
| `images/sq-*.png` | Square posts (1080 × 1080) |
| `images/ph-*.png` | Product Hunt gallery (1270 × 760) |
| `images/handout-letter.pdf` / `.png` | Printable one-page "first hour" handout, US Letter |
| `video/demo-checker.mp4` / `.gif` | 13 s silent demo of the real checker reading a scam-PC report |
| `video/demo-report.txt` | The example report used in the video (made up, realistic) |
| `copy/media-captions.md` | Captions and where to upload the second batch (below) |
| `images/brand/` | Profile pictures, X header, LinkedIn banner, YouTube banner, transparent icon |
| `images/carousel/` | 7-slide carousel "The apps a fake support caller asks you to install" (1080 × 1350) + `carousel-linkedin.pdf` |
| `images/stories/` | 4 stories (1080 × 1920) with the app's own UI areas kept clear |
| `images/infographic/` | "Six places a remote connection shows itself", 16:9 and 4:5 |
| `video/promo-vertical-1080x1920.mp4` | 21 s animated promo for Reels, Shorts, TikTok |
| `video/promo-square-1080x1080.mp4` | 21 s animated promo for LinkedIn, Instagram and X feeds |
| `video/promo-landscape-1920x1080.mp4` | 30 s: animated opening, the real checker demo, end card |
| `src/` | The scripts that make all of this; edit `cards.mjs` / `cards2.mjs` / `video2.mjs` and re-run |

## Changes made to the website (not deployed)

- **Three guide pages** at `/guides`, targeting the searches people make right after a scam:
  the first hour, checking by hand on Windows and Mac, and reading netstat.
- **Share image** for every page (`opengraph-image.png`), plus `sitemap.xml` and `robots.txt`.
- **"Nobody from PacketCheck will ever call you"** in the FAQ and the footer, plus a Guides link.
- **Funnel analytics:** `scanner_downloaded`, `command_copied` and `paste_checked` PostHog events.
  Only the result's shape (format, verdict, number of findings) is recorded, never the pasted text.
- **Site icon:** the default Next.js favicon is replaced with the PacketCheck mark (tab icon, app icon, home-screen icon).
- **Guide share images:** each guide shows its own title card when its link is shared.
- **Scanner rules:** now catch UltraViewer, HopToDesk, AeroAdmin, ToDesk, Iperius, Getscreen.me
  and a running Microsoft Quick Assist session (Windows script, Mac/Linux script and browser rules).

## Remaking the images and video

```bash
node marketing/src/render.mjs              # all images, or name some: node marketing/src/render.mjs og sq-1-steps
node marketing/src/render.mjs carousel     # one group: brand, carousel, stories, infographic, guides
node marketing/src/pdf.mjs                 # carousel PNGs → carousel-linkedin.pdf
node marketing/src/video.mjs               # checker recording; needs the dev server: npm --prefix frontend run dev
node marketing/src/video2.mjs              # animated promos: vertical, square, landscape (landscape reuses the recording)
```

Needs Google Chrome and ffmpeg (both already on this Mac). The video script blocks PostHog so
test runs never reach your analytics.

## Worth doing next

- Sign the Windows script, or at least test it on a real Windows PC before any launch post.
- Product: Remote Desktop is reported twice (as an open port and as a setting); merge them.
- Product: flag new admin accounts with names like "support" or "helpdesk"; scammers create them.
- The home page says the checker sorts lines into "expected, worth a look and red", but the
  app's labels are "High" and "Check". Pick one wording for both.
