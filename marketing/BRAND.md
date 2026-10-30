# PacketCheck brand guide

Short on purpose. Anyone writing a post, an email or a slide should be able to read it in two minutes.

## Voice

**A calm neighbour who fixes computers.** Not a security company, not a hacker, not an alarm.

| We are | We are not |
|--------|-----------|
| Plain: "a program that lets someone control your computer from far away" | Jargon first: "RAT", "C2 beacon", "lateral movement" (use these only for audience 3, and explain them) |
| Specific: "AnyDesk is still installed and starts with Windows" | Vague: "threats detected" |
| Calm: "This is worth a look. Here is what to click." | Alarming: "Your PC is at risk!" |
| Honest about limits: "A clear result means we found nothing in this snapshot." | Over-promising: "Stay 100% protected" |
| Kind to the person who got tricked: "These calls are convincing. It happens to careful people." | Blaming: "Never let strangers into your PC!" |

### Words

- **Use:** check, scan, read-only, remote access, remote-control app, connection, worth a look,
  expected, second opinion, your computer.
- **Avoid:** hacked, infected, compromised, threat, danger, urgent, protect, military-grade,
  AI-powered (say what the AI does: "explains the report in plain words"), cutting-edge, seamless.
- **Never:** "virus scan", "antivirus", "remove malware". We do not remove anything.

### The three lines to reuse everywhere

1. **Is anyone else on your computer?** (the question; headline)
2. **A 30-second, read-only check for remote access. Free, and nothing is uploaded.** (what it is)
3. **Nobody from PacketCheck will ever call you or ask to connect to your computer.** (trust)

## Look

Taken from the live site (`frontend/src/app/landing.css`). Use these exact values.

| Role | Colour | Use |
|------|--------|-----|
| Sand (ground) | `#ddd6c6` | Background of almost everything |
| Sand, darker | `#d2cab8` | Panels, cards |
| Ink | `#2a2a26` | Text, the logo square, dark sections |
| Moss (accent) | `#4f6238` | Buttons, the logo dot, one highlight per image |
| Field | `#3f5a2a` | Large green areas |
| On dark | `#e8e6e0` | Text on ink |
| Paper (interface) | `#efeeea` | Screens and report panels |
| Red (findings only) | `#a8261b` on `#f3dcd6` | Only inside a report, for a real high finding. Never as decoration. |
| Amber (findings only) | `#7a5a00` on `#f1e6c4` | Only inside a report, for "worth a look". |

**Type:** Switzer (free from Fontshare), weights 400 and 500 only. Headlines large and set tight
(letter-spacing about −2%); body 17 to 19 px. Monospace only inside real terminal output.

**Pictures:** the real scanner output and the real checker, cropped close. The 1902 telephone
switchboard photograph (public domain) is the brand's one archival image: an operator connecting
calls by hand is the honest picture of "who is connected to whom". No hooded hackers, no padlocks,
no glowing shields, no binary rain, no stock photos of worried seniors.

**Logo:** the ink square with a sand plug and a moss dot, followed by "PacketCheck" in Switzer
500. Keep clear space of half the square's height around it. Never recolour it red.

## Claims we can make (all true today)

- Runs on Windows, macOS and Linux.
- Read-only: it changes nothing on the computer.
- The scanner sends nothing; the free check runs in the browser.
- The scanner is plain text and the code is public on GitHub.
- Finishes in a few seconds on a typical computer (we measured ~3 s on a Mac; say "about 30 seconds" including download).
- Free: unlimited scans and browser checks, 3 AI second opinions a month.
- $3 for 10 more AI checks, never expire. $5 a month for 150.
- Failed AI checks are not charged.

## Claims we cannot make

- Any number of users, scans, catches or customers (we have no public figures yet).
- That it finds every backdoor, or that a clear result means the computer is safe.
- That it is endorsed, used or recommended by anyone.
- Anything about other products being worse.
