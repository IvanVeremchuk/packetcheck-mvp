# Social posts

Eight posts, one a week. Each has a matching image in `../images/`. Post the same text on X,
Bluesky and Mastodon (trim to 280 characters for X where marked); LinkedIn gets the longer
version. Links carry UTM tags; change `utm_source` to the network you post on.

---

### 1. Launch: the question (image: `x-1-question.png`)

**Short (X, 262 chars):**
> Had a "Microsoft support" call? Installed something odd, then deleted it?
>
> PacketCheck is a free 30-second check for remote access: Remote Desktop, AnyDesk,
> TeamViewer, startup leftovers. Read-only. Nothing uploaded.
>
> packetcheck.net/?utm_source=x

**LinkedIn:**
> Most remote-access scams end the same way: the caller installs a legitimate remote-control
> app, the victim panics and deletes the icon, and the background service stays. Antivirus
> rarely flags it, because the app itself isn't malware.
>
> I built PacketCheck to answer one question for that moment: is anyone still connected?
>
> It's a read-only script for Windows, macOS and Linux that lists live connections, Remote
> Desktop settings, remote-control apps and startup items, and a free checker that reads the
> report in your browser. Nothing is uploaded unless you ask for an AI explanation.
>
> If you're the person your family calls about computers, it's built for you to forward.
> packetcheck.net/?utm_source=linkedin

---

### 2. The leftover service (image: `x-2-leftover.png`)

> Deleting AnyDesk's desktop icon doesn't remove AnyDesk.
>
> Remote-control apps install a Windows service that starts with the computer. That's the
> part a scammer needs, and the part people miss.
>
> Check yours: Services → look for AnyDesk, TeamViewer, ScreenConnect, RustDesk.
> Or run the free scan: packetcheck.net/?utm_source=x

---

### 3. Read it before you run it (image: `x-3-readable.png`)

> A security tool that asks you to download and run something is asking for a lot of trust,
> especially after a scam.
>
> So PacketCheck's scanner is a plain text file. Open it in Notepad before you run it. Every
> line is on GitHub.
>
> github.com/IvanVeremchuk/packetcheck-mvp

---

### 4. Not every connection is bad (image: `sq-2-verdict.png`)

> Not every connection is bad. A typical PC has dozens of live connections: browser,
> OneDrive, Teams, updates.
>
> PacketCheck only flags the ones that point to remote access, and for each one says what it
> is, why it matters and what to click. In plain words.
>
> packetcheck.net/?utm_source=x#check

---

### 5. Never call us (image: `sq-3-promise.png`)

> A promise, because scammers copy every tool that gets popular:
>
> Nobody from PacketCheck will ever phone you, pop up a warning, or ask to connect to your
> computer. If someone says they're from PacketCheck and asks for access, hang up.

---

### 6. For power users (image: `x-4-paste.png`, or the video `../video/demo-checker.mp4`)

> Already have `netstat -ano`, `ss -tunap` or `lsof -i -n -P` output?
>
> Paste it into packetcheck.net and it runs the same rules in your browser: RDP, VNC,
> remote-control relays, LOLBins with internet connections, programs running from Temp.
> No account, no upload.

---

### 7. After the call: first hour (image: `sq-1-steps.png`)

> Let a stranger into your computer? The first hour, in order:
>
> 1. Unplug the internet.
> 2. Call your bank on the number on your card.
> 3. Change your email password from your phone.
> 4. Then check what they left: packetcheck.net/guides/someone-accessed-my-computer
>
> It happens to careful people. These calls are convincing.

---

### 8. Pricing (image: `ph-4-pricing.png`)

> PacketCheck pricing, explained honestly:
>
> Scan and browser check: free, unlimited.
> AI explanation: 3 a month free, then $3 for 10, never expire.
>
> One AI check costs me about a fifth of a cent. The $3 mostly covers card fees.
