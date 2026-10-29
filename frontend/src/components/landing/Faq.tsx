"use client";

import { useState } from "react";

const QA: Array<{ q: string; a: string }> = [
  {
    q: "Does the scanner change anything?",
    a: "No. It only reads: connections, settings, service and startup lists. It installs nothing, deletes nothing and sends nothing. It is a plain text file, so you can open it and read every line first.",
  },
  {
    q: "Is my report uploaded?",
    a: "Not for the free check: it runs in your browser. Only when you ask for an AI second opinion do we send the report, with local chatter removed, to the AI model and the public IPs to AbuseIPDB. We don't store it.",
  },
  {
    q: "I deleted the fishy app. Why does it still show?",
    a: "Remote-control tools install a service and a startup entry of their own. Removing the app you clicked on often leaves those behind, which is exactly what the scan looks for.",
  },
  {
    q: "Can it prove my computer is clean?",
    a: "No tool can. It is a quick check for live remote access, not a full antivirus. If anything is flagged, also run Microsoft Defender Offline or Malwarebytes.",
  },
  {
    q: "Why does Windows warn me about the script?",
    a: "Windows blocks scripts by default. The command we show lets this one script run once, without changing your settings.",
  },
  {
    q: "I already have netstat or ss output.",
    a: "Paste it straight into the checker. It reads netstat -ano, netstat -an, netstat -tunap, ss -tunap and lsof -i -n -P. For one-line runs, use irm …/packetcheck-scan.ps1 | iex on Windows or curl -fsSL …/packetcheck-scan.sh | sh elsewhere.",
  },
  {
    q: "Something is red. What now?",
    a: "Disconnect from the internet first. Then uninstall what was flagged, remove its startup entry, run a full antivirus scan and change your passwords from another device.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="pc-section" aria-labelledby="faq-title">
      <div className="pc-faq">
        <ul className="pc-faq__list">
          <li><h2 id="faq-title">Questions</h2></li>
          {QA.map((item, i) => (
            <li key={item.q}>
              <button
                type="button"
                className="pc-faq__q"
                aria-expanded={open === i}
                aria-controls="faq-answer"
                onClick={() => setOpen(i)}
                onMouseEnter={() => setOpen(i)}
                onFocus={() => setOpen(i)}
              >
                {item.q}
              </button>
              {open === i ? <p className="pc-faq__inline">{item.a}</p> : null}
            </li>
          ))}
        </ul>
        <p className="pc-faq__pane" id="faq-answer" key={open}>{QA[open].a}</p>
      </div>
    </section>
  );
}
