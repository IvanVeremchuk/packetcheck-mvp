# Helpful replies for Reddit and forums

Use these as a starting point, never paste them unchanged. Always answer the person's actual
question first. Mention PacketCheck in at most 1 of every 10 replies, only where the community's
rules allow it, and always say you made it. Read each subreddit's rules and sidebar first.

Where the questions are: r/Scams, r/techsupport, r/computers, r/cybersecurity_help,
r/WindowsHelp, r/antivirus, Microsoft Community, Quora, AARP online community, Tom's Hardware.

Search terms that find fresh questions: "anydesk scammer", "let someone remote into my
computer", "scammer had access", "teamviewer scam", "fake microsoft support".

---

## A. "A scammer had remote access to my computer. What do I do?" (no link)

> Sorry this happened. These calls are very convincing, and they target careful people.
>
> In this order:
>
> 1. **Disconnect from the internet** (Wi-Fi off or unplug the cable) until you've finished.
> 2. **Call your bank** on the number on the back of your card if you logged into banking, or
>    if they asked for any payment, gift cards or a "refund". Ask them to watch for transfers.
> 3. **From your phone or another device, change your email password first,** then banking,
>    then anything that uses the same password. Turn on two-step sign-in.
> 4. **Remove what they installed.** Settings → Apps → look for AnyDesk, TeamViewer,
>    ScreenConnect, UltraViewer, RustDesk, LogMeIn, Supremo. Uninstall them. Then press
>    Windows + R, type `services.msc`, and check nothing with those names is still there.
> 5. **Check for a new user account:** Settings → Accounts → Other users.
> 6. **Run Microsoft Defender Offline** (Windows Security → Virus & threat protection → Scan
>    options), or Malwarebytes free.
> 7. **Report it:** reportfraud.ftc.gov in the US, Action Fraud in the UK, or your country's
>    equivalent.
>
> If you'd like help reading what's on the computer, post the output of `netstat -ano` from a
> Command Prompt here (blank out your own public IP) and people can tell you what's normal.

## B. Same question, where tool mentions are allowed

Add after step 5:

> Disclosure: I made a free tool for exactly this check, PacketCheck (packetcheck.net). It's a
> read-only script that lists remote-control apps, Remote Desktop settings, startup items and
> live connections, then explains them in your browser. The script is plain text and open
> source, so you or someone you trust can read it first. You don't need it; the steps above
> work by hand.

## C. "Is this netstat output normal?" (power users)

> Most of it is. Quick way to read it:
>
> - Lines to `127.0.0.1` or `[::1]` are programs on your PC talking to each other. Ignore.
> - `LISTENING` on 135, 139, 445, 5040, 49664 to 49670 is normal Windows.
> - `LISTENING` on **3389** means Remote Desktop is on. On **5900** VNC. On **7070** AnyDesk,
>   **5938** TeamViewer. Worth asking why.
> - `ESTABLISHED` lines to remote port 443 are mostly browsers and apps. To find which program
>   owns one, take the PID in the last column and run `tasklist /FI "PID eq 1234"`.
> - A connection from `powershell.exe`, `rundll32.exe` or `mshta.exe` to the internet is unusual.
>
> [Optional, where allowed:] I also wrote a free in-browser parser for this, packetcheck.net
> (I made it; nothing is uploaded).

## D. "My parent let a scammer in. How do I check their PC from here?"

> The easiest way without remote access of your own:
>
> 1. Have them disconnect from the internet and call their bank first.
> 2. On a call, have them open PowerShell (Start → type PowerShell) and run
>    `netstat -ano > $HOME\Desktop\net.txt`, then email you the file from their phone or
>    another device. You'll see every connection and listener.
> 3. Have them check Settings → Apps for remote-control apps and uninstall any they didn't
>    choose.
>
> [Where allowed:] Disclosure, I built PacketCheck for this situation. They run one read-only
> script and it copies a plain-text report they can paste into a text to you; you can read it on
> packetcheck.net from your phone.
