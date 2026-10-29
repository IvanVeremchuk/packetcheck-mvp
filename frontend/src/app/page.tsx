import Link from "next/link";
import "./landing.css";
import ScanLauncher from "@/components/landing/ScanLauncher";
import PasteChecker from "@/components/landing/PasteChecker";
import ReadPanel from "@/components/landing/ReadPanel";
import PricingTable from "@/components/landing/PricingTable";
import Faq from "@/components/landing/Faq";
import Reveal from "@/components/landing/Reveal";
import { AccountLink, Footer, Mark } from "@/components/landing/Chrome";

export default function Home() {
  return (
    <div className="pc">
      <header className="pc-hero">
        <div className="pc-hero__left">
          <Mark />
          <div className="pc-hero__copy">
            <h1>
              <span className="pc-line"><span>Is anyone else</span></span>
              <span className="pc-line"><span>on your computer?</span></span>
            </h1>
            <p className="pc-hero__lead">
              A 30-second, read-only scan for Remote Desktop, remote-control apps and backdoors that
              fishy software leaves behind, even after you deleted it. Free to run, and nothing is uploaded.
            </p>
            <div className="pc-hero__actions">
              <a href="#scan" className="pc-btn">Run the free scan</a>
              <a href="#check" className="pc-link">I already have logs</a>
            </div>
            <ul className="pc-hero__facts">
              <li>Windows, macOS, Linux</li>
              <li>Changes nothing</li>
              <li>AI second opinion from $3</li>
            </ul>
          </div>
        </div>
        <div className="pc-hero__right">
          <nav className="pc-hero__top-link" aria-label="Main">
            <Link href="/pricing" className="pc-link">Pricing</Link>
            <AccountLink />
          </nav>
          <ScanLauncher />
        </div>
      </header>

      <main>
        <section className="pc-section" aria-labelledby="how-title">
          <div className="pc-runin">
            <Reveal className="pc-runin__aside">
              <h2 className="pc-h2" id="how-title">Three minutes, start to finish</h2>
              <p>For the moment after you installed something you shouldn&apos;t have, or let a &quot;support agent&quot; in.</p>
            </Reveal>
            <div className="pc-runin__col">
              <Reveal className="pc-runin__step">
                <p>
                  <b>To begin,</b> download the scanner for your system and run it. It reads your open
                  ports, live connections, Remote Desktop settings, remote-control apps, startup entries and
                  admin accounts. It writes nothing and sends nothing.
                </p>
                <pre data-ui className="pc-term pc-runin__evidence" aria-label="Scanner output"><code>
<span className="t-ok">  PacketCheck quick scan</span>{"\n"}
<span className="t-dim">  Read-only. Nothing is changed or uploaded.</span>{"\n\n"}
<span className="t-dim">  [1/6] Network connections{"\n"}  [2/6] Remote Desktop and active sessions{"\n"}  [3/6] Remote-control services and programs{"\n"}  [4/6] Programs that start automatically{"\n"}  [5/6] Administrator accounts{"\n"}  [6/6] Antivirus status</span>{"\n\n"}
<span className="t-ok">  Done in 4.2 s. 14 open ports, 23 live connections.</span>{"\n"}
<span className="t-warn">  ! Remote Desktop is switched ON.</span>{"\n"}
<span className="t-warn">  ! Remote-control software found: AnyDesk</span>{"\n\n"}
<span className="t-dim">  Report saved to: Desktop\packetcheck-report.txt</span>
</code></pre>
              </Reveal>

              <Reveal className="pc-runin__step">
                <p>
                  <b>Thirty seconds later,</b> the report is on your clipboard and your Desktop. Paste it into
                  the checker below and your browser sorts every connection into expected, worth a look, and
                  red, with what to click for each one.
                </p>
                <div data-ui className="pc-verdict pc-runin__evidence">
                  <div className="ui-row" style={{ justifyContent: "space-between" }}>
                    <strong style={{ fontWeight: 500 }}>23 connections sorted</strong>
                    <span className="ui-muted">in your browser</span>
                  </div>
                  <div className="pc-verdict__bar" aria-hidden>
                    <span style={{ flex: 19, background: "var(--ok)" }} />
                    <span style={{ flex: 3, background: "#c9a227" }} />
                    <span style={{ flex: 1, background: "var(--high)" }} />
                  </div>
                  <div className="ui-row" style={{ gap: 16, flexWrap: "wrap" }}>
                    <span className="ui-pill ui-pill--ok"><span className="ui-dot" />19 expected</span>
                    <span className="ui-pill ui-pill--medium"><span className="ui-dot" />3 check</span>
                    <span className="ui-pill ui-pill--high"><span className="ui-dot" />1 high: port 4444</span>
                  </div>
                </div>
              </Reveal>

              <Reveal className="pc-runin__step">
                <p>
                  <b>If something looks off,</b> ask for the AI second opinion. It looks up every internet
                  address in the report on AbuseIPDB and explains each finding in plain words: what it is,
                  whether it is normal, and the exact steps to close it.
                </p>
                <div data-ui className="pc-verdict pc-runin__evidence">
                  <span className="ui-pill ui-pill--high" style={{ width: "fit-content" }}><span className="ui-dot" />Alert</span>
                  <strong style={{ fontWeight: 500, fontSize: 16 }}>svcupd.exe is talking to a known attack server</strong>
                  <span className="ui-muted">
                    45.137.21.9 has an abuse score of 100 and is reached on port 4444, a backdoor default. The
                    program runs from AppData\Local\Temp and starts with Windows.
                  </span>
                  <span>Unplug the network cable or turn off Wi-Fi, then run Microsoft Defender Offline.</span>
                </div>
              </Reveal>

              <Reveal className="pc-runin__step">
                <p>
                  <b>Already have logs?</b> Skip the scanner. Paste the output of any of these straight in.
                </p>
                <div className="pc-chips pc-runin__evidence">
                  <code>netstat -ano</code>
                  <code>netstat -anob</code>
                  <code>ss -tunap</code>
                  <code>lsof -i -n -P</code>
                  <code>netstat -an</code>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <PasteChecker />
        <ReadPanel />
        <PricingTable />
        <Faq />

        <section className="pc-band" aria-labelledby="band-title">
          <div>
            <h2 id="band-title">Check before you worry</h2>
            <p>
              A century ago, every call went through someone at a switchboard who could see who was
              connected to whom. Your computer has no one watching. Thirty seconds tells you whether that
              download left a line open.
            </p>
            <a href="#scan" className="pc-btn">Run the free scan</a>
          </div>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/switchboard-1902.jpg"
              width={1126}
              height={719}
              loading="lazy"
              decoding="async"
              alt="Operators at a long telephone switchboard in 1902, plugging cords to connect calls."
            />
            <figcaption>A telephone exchange in 1902: every connection made by hand, in plain view.</figcaption>
          </figure>
        </section>
      </main>

      <Footer />
    </div>
  );
}
