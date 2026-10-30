# PacketCheck marketing plan

Written 30 October 2026. Budget assumed: $0 to start, with an optional $100 ad test after
week 3. Nothing in this folder has been posted or sent; every channel step is yours to do.

## 1. The one sentence

**PacketCheck is the 30-second check for the moment after you let a "support agent" into your
computer.**

Everything we publish answers one worried question: *is anyone still on my computer?* We do not
sell "security". We sell a calm, specific answer, for free, with an optional $3 explanation.

## 2. Who it is for, in order of priority

| # | Who | What they type or say | What they need from us | Pays? |
|---|-----|-----------------------|------------------------|-------|
| 1 | **Someone who just had a scam call or installed something fishy.** Often 55+, Windows, alone at the computer, scared and slightly ashamed. | "someone remotely accessed my computer what do I do", "is anydesk still on my computer", "scammer had access to my computer" | A clear next step in plain words, no jargon, no fear. Proof that the scan itself is safe. | Sometimes: the $3 pack, once. |
| 2 | **The family IT helper.** The adult child or grandchild who gets the phone call. Comfortable with tech, short on time, lives elsewhere. | "my mom let a scammer into her computer", "check parent's PC remotely for remote access" | Something they can send by text that their parent can run alone, and a report they can read from their own phone. | Yes: pack or Pro. |
| 3 | **Power users, sysadmins, small IT shops.** | "netstat what is normal", "check for RDP backdoor", "list remote access tools windows" | A fast parser for output they already have. Readable, open scripts. An API. | Pro, rarely. They bring reach (HN, Reddit, blogs). |

Audience 2 is the growth engine: one helper reaches several relatives, shares links, and is the
person most likely to pay $5 a month. Most copy should be written so audience 1 understands it and
audience 2 wants to forward it.

## 3. Why anyone should believe us

The audience has just been tricked into downloading a program by a stranger. "Download our
program" is exactly what a scammer says. Trust is the whole marketing problem, so these are
product facts to repeat everywhere, never bury:

1. **The scanner is a text file you can read.** Open it in Notepad first.
2. **The code is public on GitHub.** Link to the exact file.
3. **It changes nothing and sends nothing.** The free check runs in the browser.
4. **We never ask you to call us, and nobody from PacketCheck will ever call you.** (Say this
   on the site. Scammers will copy any tool that gets popular; this line protects users and us.)
5. **We say what we cannot do.** A clear result means nothing was found in that snapshot, not
   that the computer is safe.

**Fix before any paid promotion: sign the Windows script.** Windows SmartScreen and Defender
warn on unsigned downloaded scripts, which will scare audience 1 away at the worst moment.
Microsoft's Azure Artifact Signing (formerly Trusted Signing) is reported at about $10 a month
on its Basic plan and accepts individuals; confirm the price, and that it signs `.ps1` files, on
Azure's own page before buying. Until then, the docs explain the warning in plain words, and the
one-line command (which never saves a file) avoids the download warning altogether.

## 4. Channels, ranked by effort-to-result for $0

### A. Search (evergreen, highest intent): start now
People in audience 1 and 2 search in the hour after the call. We publish three guide pages on
packetcheck.net that answer those searches honestly and link to the scan as one step among
several (disconnect, call the bank, change passwords from another device, report):

1. `/guides/someone-accessed-my-computer`: what to do in the first hour after a remote-access
   scam. Target: "someone remotely accessed my computer what to do".
2. `/guides/check-remote-access`: how to tell if someone is remotely accessing your computer,
   by hand on Windows and Mac, then with the scanner. Target: "how to check if someone is
   remotely accessing my computer".
3. `/guides/read-netstat`: what is normal in `netstat -ano` output. Target: power users,
   "netstat foreign address meaning".

Drafts of all three are in the site code (built tonight; review before you deploy). Then:
submit the sitemap in Google Search Console and Bing Webmaster Tools.

### B. Helpful answers where the questions are asked: daily, 20 minutes
Reddit (r/Scams, r/techsupport, r/computers, r/cybersecurity_help), Quora, Microsoft Community,
AARP and Tom's Hardware forums. The rule for every post:

- Answer the question fully **without** PacketCheck first: steps they can do by hand.
- Mention PacketCheck only if it is allowed there, only as one option, and **say you made it**.
- 9 helpful comments for every 1 that mentions the tool. Security subreddits ban promotional
  accounts quickly, and a ban costs more than a link earns.

Reply templates are in `copy/replies.md`.

### C. Show HN: one shot, week 2
Hacker News rewards a readable, open, no-signup tool. Lead with the open scripts and the
in-browser parser, not the paid part. Post Tuesday to Thursday, 8 to 10 a.m. US Eastern, and stay
in the thread for 4 hours answering. Draft in `copy/launch.md`.

### D. Product Hunt: week 3
Gallery images are in `images/` (1270 × 760). Launch at 12:01 a.m. Pacific. Ask friends to visit
and leave honest comments, not to "upvote", which Product Hunt penalises.

### E. People who already talk to this audience: weeks 2 to 4
Short, personal emails (templates in `copy/outreach.md`), no money offered at first:

- Scam-awareness YouTubers and streamers who show remote-access scams to big audiences.
- Local TV consumer segments ("What the Tech?" runs on many local stations).
- Libraries and senior centres that run digital-skills classes. Offer a free one-page handout
  (`images/handout-letter.png`).
- AARP Fraud Watch Network volunteers, local police fraud units, credit unions' fraud pages.

### F. Social: low effort, steady
X, Bluesky, Mastodon (infosec.exchange) and LinkedIn: one post a week, built in public: what the
scanner caught, a remote-access tool explained, a scam pattern seen in the news. Images and
captions in `images/` and `copy/social.md`. Do not expect social to drive sales; it builds the
credibility that makes HN, outreach and press work.

### G. Paid: only after week 3, only if A to E show conversion
A $100 Google Ads test on the exact high-intent phrases in section 2, sending people to the
first guide, not the home page. Stop if a pack purchase costs more than $6 to acquire.
Do **not** buy Facebook or Instagram ads aimed at older people about scams; the platforms
restrict it and it looks like the scams themselves.

## 5. 30-day calendar

| Week | Do |
|------|----|
| **1** (now) | Review and deploy the guide pages, share image and analytics events. Add the "we will never call you" line. Set up Search Console and Bing. Create accounts on X, Bluesky and LinkedIn as "PacketCheck" (you, not me). Start the Reddit routine with no links. Run the Windows script on a real PC; record a 20-second screen capture of it. |
| **2** | Show HN (Tue to Thu). Fix what the thread finds within 48 hours and reply saying so. Send 5 outreach emails. Second social post. |
| **3** | Product Hunt launch. 5 more outreach emails. Write one guide based on the questions people asked on HN and Reddit. Sign the Windows script if the warning came up. |
| **4** | Review numbers (section 6). If guide visitors convert, start the $100 ads test. Print the handout for one local library. Decide whether Pro at $5 is pulling its weight or whether packs alone are enough. |

## 6. What to measure (PostHog)

Funnel events now in the code (tonight's change, not yet deployed):

| Event | Fired when |
|-------|-----------|
| `scanner_downloaded` | someone clicks a scanner download (with `os`) |
| `command_copied` | someone copies a one-line command (with `os`) |
| `paste_checked` | the free checker reads a real pasted report (with `format`, `verdict`) |
| `scan_ai_started` / `scan_ai_completed` | already existed |

Build one PostHog funnel: page view → `scanner_downloaded` or `paste_checked` →
sign-up → `scan_ai_completed` → purchase. Always use UTM links (`?utm_source=hn` and so on) when
you post, so each channel shows up separately.

**Targets for day 30** (modest, honest): 1,000 visitors, 250 scans or paste checks, 40 sign-ups,
10 paying customers. Ten packs ($26 net) covers the backend and domain.

## 7. Rules for everything we publish

- Never claim to detect "all hackers", "all malware" or to make anyone "safe".
- No fear words: hacked, infected, compromised, act now, urgent, warning sirens, red alerts.
- No fake numbers, users, reviews, logos or press. We have none yet; say less instead.
- Never use Microsoft, Apple, Windows Defender or bank logos, or anything that looks like a
  system warning. Our ads must never resemble a tech support scam pop-up.
- Always include the "what to do next" that does not involve us (bank, passwords, report to
  the FTC at reportfraud.ftc.gov or the FBI at ic3.gov).
- Disclose that you built it, every time you mention it.

## Sources

- FBI Philadelphia, elder fraud: tech support fraud was the most reported scheme against older
  Americans in 2023, with 17,600+ complaints and $589M+ in losses.
  https://www.fbi.gov/contact-us/field-offices/philadelphia/news/fbi-philadelphia-warns-elder-fraud-continues-to-be-a-growing-problem
- r/cybersecurity promotion rule: https://redlib.hbubli.cc/r/cybersecurity/wiki/rules/promotion
- Reddit self-promotion norms (third-party guide): https://redship.io/blog/reddit-self-promotion-rules
- Azure Artifact Signing plans and price (third-party, January 2026):
  https://securityboulevard.com/2026/01/how-to-set-up-azure-trusted-signing-to-sign-an-exe/
- Typical remote-access advice sites already ranking: https://www.identityguard.com/news/how-to-check-if-someone-is-remotely-accessing-your-computer
