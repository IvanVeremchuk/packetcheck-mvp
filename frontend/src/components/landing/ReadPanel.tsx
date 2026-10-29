"use client";

import { useEffect, useRef, useState } from "react";

type Part = { id: string; name: string; note: string; top: number };

const LEFT: Part[] = [
  { id: "ports", name: "Open ports", note: "Programs waiting for someone to connect: RDP 3389, VNC 5900, AnyDesk 7070, backdoor ports like 4444.", top: 64 },
  { id: "rdp", name: "Remote Desktop", note: "Whether RDP is on, whether its sign-in protection is off, and whether someone is in a session now.", top: 330 },
  { id: "start", name: "Startup and tasks", note: "Anything set to come back after a restart: Run keys, startup folder, scheduled tasks, launch agents.", top: 560 },
];
const RIGHT: Part[] = [
  { id: "conns", name: "Live connections", note: "Every internet address the computer is talking to right now, and the program behind each one.", top: 170 },
  { id: "tools", name: "Remote-control apps", note: "TeamViewer, AnyDesk, ScreenConnect, NetSupport, Remote Utilities and dozens more, even after you deleted the app.", top: 440 },
  { id: "admins", name: "Admins and antivirus", note: "Who has admin rights, whether Defender is off, and folders it has been told to ignore.", top: 660 },
];

function Note({ part, onFocus }: { part: Part; onFocus: (id: string | null) => void }) {
  return (
    <button
      type="button"
      className="pc-note"
      data-part={part.id}
      style={{ top: part.top }}
      onMouseEnter={() => onFocus(part.id)}
      onMouseLeave={() => onFocus(null)}
      onFocus={() => onFocus(part.id)}
      onBlur={() => onFocus(null)}
      aria-describedby={`part-${part.id}`}
    >
      <strong>{part.name}</strong>
      <span>{part.note}</span>
    </button>
  );
}

export default function ReadPanel() {
  const [focus, setFocus] = useState<string | null>(null);
  const cls = (id: string) => `pc-panel__part${focus === id ? " is-focus" : ""}`;
  const plateRef = useRef<HTMLDivElement>(null);

  // Line each note up with the first line of the panel part it explains.
  useEffect(() => {
    const plate = plateRef.current;
    if (!plate) return;
    const place = () => {
      plate.querySelectorAll<HTMLElement>(".pc-note[data-part]").forEach((note) => {
        const part = plate.querySelector<HTMLElement>(`#part-${note.dataset.part}`);
        const box = note.parentElement;
        if (!part || !box || getComputedStyle(note).position !== "absolute") return;
        note.style.top = `${part.getBoundingClientRect().top - box.getBoundingClientRect().top + 12}px`;
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(plate);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="pc-section" aria-labelledby="reads-title">
      <div className="pc-plate" ref={plateRef}>
        <div className="pc-plate__head">
          <h2 className="pc-h2" id="reads-title">What the scan reads</h2>
          <p>Six places a remote connection shows itself. This is the report from the example PC above.</p>
        </div>

        <div className="pc-plate__notes pc-plate__notes--left">
          {LEFT.map((p) => <Note key={p.id} part={p} onFocus={setFocus} />)}
        </div>

        <div className="pc-plate__panel">
          <div data-ui className="pc-panel" data-focus={focus ?? undefined}>
            <div className="pc-panel__top">
              <strong style={{ fontWeight: 500 }}>packetcheck-report.txt</strong>
              <span className="ui-muted">Windows 11 · 4.2 s</span>
            </div>
            <div className={cls("ports")} id="part-ports">
              <h3>Open ports</h3>
              <ul>
                <li><code>0.0.0.0:3389</code><span className="ui-pill ui-pill--medium">svchost · RDP</span></li>
                <li><code>0.0.0.0:7070</code><span className="ui-pill ui-pill--medium">AnyDesk.exe</span></li>
                <li><code>0.0.0.0:135</code><span className="ui-pill ui-pill--ok">Windows</span></li>
              </ul>
            </div>
            <div className={cls("conns")} id="part-conns">
              <h3>Live connections</h3>
              <ul>
                <li><code>→ 45.137.21.9:4444</code><span className="ui-pill ui-pill--high">svcupd.exe</span></li>
                <li><code>→ 185.229.191.39:443</code><span className="ui-pill ui-pill--medium">AnyDesk relay</span></li>
                <li><code>→ 140.82.113.26:443</code><span className="ui-pill ui-pill--ok">chrome.exe</span></li>
              </ul>
            </div>
            <div className={cls("rdp")} id="part-rdp">
              <h3>Remote Desktop</h3>
              <ul>
                <li><span>Remote Desktop</span><span className="ui-pill ui-pill--medium">On</span></li>
                <li><span>Sign-in protection (NLA)</span><span className="ui-pill ui-pill--ok">On</span></li>
                <li><span>Active remote sessions</span><span className="ui-muted">None</span></li>
              </ul>
            </div>
            <div className={cls("tools")} id="part-tools">
              <h3>Remote-control apps</h3>
              <ul>
                <li><span>AnyDesk service</span><span className="ui-pill ui-pill--medium">Running · Auto</span></li>
                <li><span>TeamViewer</span><span className="ui-muted">Not found</span></li>
              </ul>
            </div>
            <div className={cls("start")} id="part-start">
              <h3>Startup and tasks</h3>
              <ul>
                <li><code>HKCU Run · svcupd</code><span className="ui-pill ui-pill--high">AppData\Temp</span></li>
                <li><code>OneDrive</code><span className="ui-pill ui-pill--ok">Microsoft</span></li>
              </ul>
            </div>
            <div className={cls("admins")} id="part-admins">
              <h3>Admins and antivirus</h3>
              <ul>
                <li><span>Admin accounts</span><span>Ann, support</span></li>
                <li><span>Defender real-time</span><span className="ui-pill ui-pill--ok">On</span></li>
                <li><span>Defender exclusions</span><span className="ui-muted">None</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pc-plate__notes pc-plate__notes--right">
          {RIGHT.map((p) => <Note key={p.id} part={p} onFocus={setFocus} />)}
        </div>
      </div>
    </section>
  );
}
