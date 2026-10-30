// Plain-language guides for the searches people make right after a remote-access scam.
// Each guide stands on its own: every step works without PacketCheck.
import Link from "next/link";
import type { ReactNode } from "react";

export type Guide = {
  slug: string;
  title: string;
  short: string;
  description: string;
  updated: string;
  body: ReactNode;
};

const Cmd = ({ children }: { children: string }) => (
  <pre><code>{children}</code></pre>
);

const ScanNote = () => (
  <div data-ui className="pc-guide__cta">
    <strong>Want this checked for you?</strong>
    <p>
      The free PacketCheck scan reads all of the above in about 30 seconds and explains it in your
      browser. It changes nothing and uploads nothing, and the script is plain text you can read first.
    </p>
    <Link href="/#scan" className="pc-btn">Run the free scan</Link>
  </div>
);

export const GUIDES: Guide[] = [
  {
    slug: "someone-accessed-my-computer",
    title: "Someone accessed my computer remotely. What do I do?",
    short: "The first hour after a remote-access scam",
    description:
      "Let a caller or a pop-up into your computer? What to do in the first hour, in order: disconnect, call your bank, change passwords, remove the remote-control app, check what was left and report it.",
    updated: "30 October 2026",
    body: (
      <>
        <p className="pc-guide__lead">
          These calls and pop-ups are convincing, and they happen to careful people. If you gave
          someone remote access, follow these steps in order. You do not need to buy anything.
        </p>

        <h2>1. Disconnect from the internet</h2>
        <p>
          Turn off Wi-Fi or unplug the network cable. Remote-control apps need the internet, so this
          cuts the caller off straight away. Leave it off until you reach step 5.
        </p>

        <h2>2. Call your bank</h2>
        <p>
          Use the number on the back of your card, not one the caller gave you. Tell them someone had
          access to your computer and ask them to watch for transfers. Do this first if you logged into
          online banking while they were connected, if they showed you a &quot;refund&quot; that looked too
          big, or if you paid with gift cards, crypto or a money transfer app.
        </p>

        <h2>3. Change your passwords from another device</h2>
        <p>
          Use your phone or a computer you trust, not the one they were on. Start with your email,
          because it can reset everything else. Then banking, then any account that shares a password.
          Turn on two-step sign-in where it is offered.
        </p>

        <h2>4. Remove the remote-control app</h2>
        <p>Scammers usually install a legitimate remote-control program. Common ones:</p>
        <ul>
          <li>AnyDesk, TeamViewer, UltraViewer, ScreenConnect (ConnectWise), RustDesk</li>
          <li>LogMeIn, GoTo Resolve, Supremo, AeroAdmin, HopToDesk, Splashtop</li>
          <li>Microsoft Quick Assist (built into Windows; only a concern if it is open now)</li>
        </ul>
        <p>
          <b>Windows:</b> Settings → Apps → Installed apps. Uninstall anything you did not choose
          yourself. <b>Mac:</b> open the Applications folder and drag it to the Bin, then check
          System Settings → Privacy &amp; Security → Accessibility and Screen &amp; System Audio
          Recording, and remove it from both lists.
        </p>

        <h2>5. Check what was left behind</h2>
        <p>
          Deleting the app you saw does not always remove the parts that start it again. Look for:
        </p>
        <ul>
          <li>
            <b>Services</b> (Windows): press Windows + R, type <code>services.msc</code>, and look for
            the names above. If one is still there after uninstalling, ask someone you trust to help
            remove it.
          </li>
          <li>
            <b>Startup items:</b> Task Manager → Startup apps on Windows; System Settings → General →
            Login Items on a Mac. Disable anything you do not recognise.
          </li>
          <li>
            <b>New user accounts:</b> Settings → Accounts → Other users on Windows; System Settings →
            Users &amp; Groups on a Mac. Scammers sometimes add one named &quot;support&quot; or &quot;admin&quot;.
          </li>
          <li>
            <b>Remote Desktop:</b> Settings → System → Remote Desktop on Windows; System Settings →
            General → Sharing on a Mac (Screen Sharing, Remote Login, Remote Management). Turn off
            anything you do not use.
          </li>
        </ul>
        <ScanNote />

        <h2>6. Run a full antivirus scan</h2>
        <p>
          On Windows: Windows Security → Virus &amp; threat protection → Scan options → Microsoft
          Defender Offline scan. The computer restarts and scans before Windows loads. A second opinion
          from a free scanner such as Malwarebytes does no harm.
        </p>

        <h2>7. Report it</h2>
        <ul>
          <li>United States: <a href="https://reportfraud.ftc.gov">reportfraud.ftc.gov</a> and the FBI at <a href="https://www.ic3.gov">ic3.gov</a></li>
          <li>United Kingdom: <a href="https://www.actionfraud.police.uk">Action Fraud</a></li>
          <li>If they claimed to be Microsoft: <a href="https://www.microsoft.com/reportascam">microsoft.com/reportascam</a></li>
        </ul>

        <h2>If they call back</h2>
        <p>
          Hang up. A common second step is a &quot;refund recovery&quot; call, from the same people, offering
          to get your money back for a fee. No real company calls you to fix your computer or return
          money from a scam.
        </p>

        <h2>When to start fresh</h2>
        <p>
          If you find programs you cannot remove, the antivirus finds something, or you just cannot
          relax, back up your photos and documents and reset the computer: Settings → System →
          Recovery → Reset this PC on Windows. A local repair shop can do it for you; take it in rather
          than letting anyone connect remotely.
        </p>
      </>
    ),
  },
  {
    slug: "check-remote-access",
    title: "How to check if someone is remotely accessing your computer",
    short: "Check by hand on Windows and Mac",
    description:
      "Step-by-step checks for live remote access on Windows and macOS: remote-control apps, Remote Desktop, open connections, startup items and admin accounts, with the commands to run.",
    updated: "30 October 2026",
    body: (
      <>
        <p className="pc-guide__lead">
          A remote connection has to show up somewhere: as a program, a setting, a network connection
          or something that starts with the computer. These checks take about ten minutes by hand.
        </p>

        <h2>Signs worth checking for</h2>
        <ul>
          <li>The pointer moves or windows open by themselves.</li>
          <li>A remote-control app you did not install, or one a caller asked you to install.</li>
          <li>A new user account you did not create.</li>
          <li>Your camera light comes on when you are not using it.</li>
        </ul>
        <p>
          A slow computer or a busy fan on its own is rarely a sign of remote access. Updates and
          browser tabs cause that far more often.
        </p>

        <h2>On Windows</h2>
        <p><b>1. Remote-control apps.</b> Settings → Apps → Installed apps. Look for AnyDesk, TeamViewer,
          UltraViewer, ScreenConnect, RustDesk, LogMeIn, Supremo, AeroAdmin or Splashtop.</p>
        <p><b>2. Their services.</b> Press Windows + R, type <code>services.msc</code>. Sort by name and look
          for the same names. A service set to start automatically keeps the door open even after the
          app&apos;s icon is gone.</p>
        <p><b>3. Remote Desktop.</b> Settings → System → Remote Desktop. If it is on and you do not use it,
          turn it off.</p>
        <p><b>4. Live connections.</b> Open PowerShell (Start → type PowerShell) and run:</p>
        <Cmd>netstat -ano</Cmd>
        <p>
          Lines marked <code>ESTABLISHED</code> are live connections. To see which program owns one,
          take the number in the last column (the PID) and run:
        </p>
        <Cmd>tasklist /FI &quot;PID eq 1234&quot;</Cmd>
        <p>
          Our <Link href="/guides/read-netstat">guide to reading netstat</Link> explains which lines are normal.
        </p>
        <p><b>5. Startup items.</b> Task Manager (Ctrl + Shift + Esc) → Startup apps. Anything you do not
          recognise, especially with a path in <code>AppData\Local\Temp</code> or <code>Downloads</code>,
          is worth a search.</p>
        <p><b>6. Admin accounts.</b> In PowerShell:</p>
        <Cmd>net localgroup administrators</Cmd>

        <h2>On a Mac</h2>
        <p><b>1. Sharing.</b> System Settings → General → Sharing. Screen Sharing, Remote Login and Remote
          Management should be off unless you use them.</p>
        <p><b>2. Permissions.</b> System Settings → Privacy &amp; Security → Accessibility, and Screen &amp;
          System Audio Recording. A remote-control app needs both to see and drive your screen. Remove
          anything you do not recognise.</p>
        <p><b>3. Login items.</b> System Settings → General → Login Items. Check both lists.</p>
        <p><b>4. Live connections.</b> In Terminal:</p>
        <Cmd>lsof -i -n -P | grep ESTABLISHED</Cmd>
        <p><b>5. Admin accounts.</b> System Settings → Users &amp; Groups.</p>

        <ScanNote />

        <h2>If you find something</h2>
        <p>
          Disconnect from the internet, then follow <Link href="/guides/someone-accessed-my-computer">what
          to do in the first hour</Link>: call your bank, change passwords from another device, remove
          the app and report it.
        </p>
      </>
    ),
  },
  {
    slug: "read-netstat",
    title: "How to read netstat output: what is normal and what is not",
    short: "netstat, ss and lsof explained",
    description:
      "What each column of netstat -ano means, which listening ports are normal on Windows, which ones point to remote access, and how to find the program behind a connection.",
    updated: "30 October 2026",
    body: (
      <>
        <p className="pc-guide__lead">
          <code>netstat</code> lists every network connection your computer has open. Most of the lines
          are ordinary. Here is how to tell which ones are not.
        </p>

        <h2>The columns</h2>
        <Cmd>{`  Proto  Local Address        Foreign Address      State        PID
  TCP    0.0.0.0:3389         0.0.0.0:0            LISTENING    1260
  TCP    192.168.1.24:49702   52.112.94.40:443     ESTABLISHED  9104`}</Cmd>
        <ul>
          <li><b>Local Address:</b> your computer and the port it is using.</li>
          <li><b>Foreign Address:</b> the other end. <code>0.0.0.0:0</code> means nobody yet.</li>
          <li><b>State:</b> <code>LISTENING</code> is a door waiting for someone to connect;
            <code> ESTABLISHED</code> is a live conversation.</li>
          <li><b>PID:</b> the program&apos;s process number. Find its name with
            <code> tasklist /FI &quot;PID eq 9104&quot;</code>, or run <code>netstat -anob</code> as
            administrator to see names directly.</li>
        </ul>

        <h2>Lines you can ignore</h2>
        <ul>
          <li>Anything to <code>127.0.0.1</code> or <code>[::1]</code>: programs on your computer
            talking to each other.</li>
          <li><code>LISTENING</code> on 135, 139, 445, 5040 and 49664 to 49670: standard Windows.</li>
          <li><code>ESTABLISHED</code> to port 443 or 80 from your browser, Teams, OneDrive, Dropbox,
            Steam or other apps you use: ordinary encrypted web traffic.</li>
        </ul>

        <h2>Lines worth a look</h2>
        <dl className="pc-docs__list">
          <div><dt><code>LISTENING</code> on 3389</dt><dd>Remote Desktop is on. Turn it off if you do not use it.</dd></div>
          <div><dt><code>LISTENING</code> on 5900</dt><dd>A VNC server is waiting for connections.</dd></div>
          <div><dt><code>LISTENING</code> on 7070 or 6568</dt><dd>AnyDesk accepts direct connections.</dd></div>
          <div><dt><code>LISTENING</code> on 5938</dt><dd>TeamViewer.</dd></div>
          <div><dt><code>LISTENING</code> on 5985, 5986, 22 or 23</dt><dd>WinRM, SSH or Telnet: remote command lines. Rare on home computers.</dd></div>
          <div><dt>Any connection to port 4444, 1604, 5552 or 6667</dt><dd>Ports used by well-known backdoors and remote-access trojans. Treat as serious.</dd></div>
          <div><dt><code>powershell</code>, <code>cmd</code>, <code>rundll32</code>, <code>mshta</code> with an internet connection</dt><dd>Built-in Windows tools rarely need to talk to the internet. Attackers use them because they look harmless.</dd></div>
          <div><dt>Any program running from <code>Temp</code>, <code>Downloads</code> or <code>Users\Public</code></dt><dd>Real software installs to Program Files. Programs in these folders that use the network deserve a search.</dd></div>
        </dl>

        <h2>On Mac and Linux</h2>
        <p>The same ideas apply. These commands show listening ports and live connections with program names:</p>
        <Cmd>{`lsof -i -n -P          # macOS and Linux
ss -tunap               # Linux (run with sudo to see every program)
netstat -an             # macOS, without program names`}</Cmd>

        <div data-ui className="pc-guide__cta">
          <strong>Paste it instead of reading it</strong>
          <p>
            The free checker on the home page reads <code>netstat -ano</code>, <code>netstat -an</code>,
            <code> ss -tunap</code> and <code>lsof -i -n -P</code> output and applies these rules for you,
            in your browser. Nothing is uploaded.
          </p>
          <Link href="/#check" className="pc-btn">Open the checker</Link>
        </div>
      </>
    ),
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}
