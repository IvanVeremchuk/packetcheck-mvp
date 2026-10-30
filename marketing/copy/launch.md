# Launch posts

Drafts. Nothing here has been posted. Replace `[you]` with your name before posting, and keep
the UTM tag on every link so PostHog shows where visitors came from.

---

## Show HN

**When:** Tuesday to Thursday, 8 to 10 a.m. US Eastern. Stay in the thread for four hours.

**Title** (HN limit 80 characters):

> Show HN: PacketCheck – a read-only script that checks a PC for remote access

**URL:** `https://packetcheck.net/?utm_source=hn&utm_medium=social&utm_campaign=launch`

**First comment** (post it yourself, straight after submitting):

> I built this after helping relatives clean up after "Microsoft support" calls. The pattern is
> always the same: the scammer installs AnyDesk or ScreenConnect, the person panics and deletes
> the icon, and the service, startup entry and sometimes an extra admin account stay behind.
> Antivirus usually says nothing, because those are legitimate tools.
>
> PacketCheck is two parts:
>
> 1. A read-only script (PowerShell 5.1 for Windows, POSIX sh for macOS and Linux). It lists
>    listening ports, established connections with owning process, RDP and Remote Assistance
>    settings (including NLA), active sessions, services and processes of 25+ remote-control
>    tools and a dozen known remote-access trojans, Run keys, startup folders, non-Microsoft scheduled tasks, launch agents, cron and
>    systemd units, local admins and Defender status. It writes one tab-separated text report
>    and copies it to the clipboard. It sends nothing.
>
> 2. A rule engine in TypeScript that runs in your browser. Paste the report, or plain
>    `netstat -ano`, `ss -tunap` or `lsof -i -n -P` output, and it sorts connections into
>    expected / worth a look / red, with the reason for each.
>
> Both are free with no account. There's an optional AI explanation (gpt-4o-mini plus
> AbuseIPDB lookups on the public IPs) that costs $3 for 10, priced to cover tokens and Stripe's
> fee. Three a month are free.
>
> Things I'd love feedback on:
>
> - Rules that are wrong, or remote-access tools I've missed. The lists are in
>   `frontend/src/lib/scan/analyze.ts`.
> - The `irm | iex` / `curl | sh` one-liners. They're there because a scared non-technical
>   person won't manage a download plus execution policy. You can download the file and read
>   it first instead; each script is about 200 lines.
> - False positives you hit on your own machine.
>
> Code: https://github.com/IvanVeremchuk/packetcheck-mvp

**Answers to have ready:**

- *"Why not just use Autoruns / TCPView?"* They're excellent and I recommend them in the docs
  for anyone comfortable with them. This is for the person who would not know which of 400
  Autoruns entries matters, and for the helper who wants a text report sent by email.
- *"curl | sh from a security tool?"* Fair. Every command has a download-and-read alternative
  next to it, and the script is in the repo.
- *"What do you do with the report?"* Free check: nothing; it never leaves the browser. AI
  check: it's sent to OpenRouter and the public IPs to AbuseIPDB, not stored. Localhost and
  LAN-to-LAN lines are stripped before sending.
- *"Is the AI necessary?"* No. The rules do the finding. The AI only writes the plain-English
  explanation and next steps, which is what non-technical users struggle with.

---

## Product Hunt

**Name:** PacketCheck

**Tagline** (60 characters max):

> A 30-second check for remote access after a scam call

**Topics:** Security, Privacy, Developer Tools.

**Gallery:** `images/ph-1-hero.png`, `ph-2-report.png`, `ph-3-paste.png`, `ph-4-pricing.png` (1270 × 760).

**Description** (260 characters max):

> Let a "support agent" in, or installed something fishy and deleted it? PacketCheck reads your
> connections, Remote Desktop, remote-control apps and startup items in 30 seconds. Read-only,
> nothing uploaded, free. Optional AI explanation from $3.

**Maker's first comment:**

> Hi Product Hunt, I'm [you].
>
> PacketCheck answers one question: is anyone still connected to this computer?
>
> Tech support scams usually end with a remote-control app left behind: AnyDesk, TeamViewer,
> ScreenConnect. Deleting the icon rarely removes the service that starts it. Antivirus often
> stays quiet because those apps are legitimate.
>
> How it works:
> 1. Run a small read-only script (Windows, Mac, Linux). It changes nothing and sends nothing.
>    It's plain text, so you can read it first, and it's open source.
> 2. Paste the report into the site. Your browser sorts every connection into expected, worth a
>    look, and red, with what to click.
> 3. Optional: an AI second opinion explains the report in plain English. Three a month free,
>    then $3 for 10.
>
> If you've ever been the family's IT person, this is the link to text your parents.
>
> One promise: nobody from PacketCheck will ever call you or ask to connect to your computer.
>
> I'd love to hear what it found (or wrongly flagged) on your machine.

**URL:** `https://packetcheck.net/?utm_source=producthunt&utm_medium=social&utm_campaign=launch`

---

## Indie Hackers / build-in-public post (week 4)

**Title:** I priced my AI tool at $3 for 10 uses. Here's the cost maths.

> PacketCheck checks a computer for remote access after a scam. The scan and the rules are
> free; the paid part is an AI explanation of the report.
>
> One AI check costs me about $0.002 (gpt-4o-mini, ~7k input tokens worst case, 900 out).
> So why not $1? Stripe takes $0.30 + 2.9% of every payment, which would be 33% of a dollar.
> At $3, fees drop to 13% and ten checks still cost me two cents.
>
> Pro is $5 a month for 150 checks, for the people who look after other people's computers.
>
> Fixed costs are ~$8 to $28 a month (Render, Vercel, domain), so break-even is 4 to 11 packs.
>
> [fill in real numbers after 30 days: visitors, scans, sign-ups, packs, Pro]
