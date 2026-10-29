"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { analyze, SAMPLE_WINDOWS_NETSTAT } from "@/lib/scan/analyze";
import ScanResultView from "@/components/scan/ScanResultView";

export const REPORT_KEY = "pc:pending-report";

function stash(text: string) {
  try {
    sessionStorage.setItem(REPORT_KEY, text);
  } catch {
    // Private mode: the user can paste again in the app.
  }
}

export default function PasteChecker() {
  const [text, setText] = useState(SAMPLE_WINDOWS_NETSTAT);
  const deferred = useDeferredValue(text);
  const result = useMemo(() => analyze(deferred), [deferred]);
  const isSample = text === SAMPLE_WINDOWS_NETSTAT;

  return (
    <section className="pc-split" id="check" aria-labelledby="check-title">
      <div className="pc-split__in">
        <div className="pc-split__label">
          <label htmlFor="pc-input">
            {isSample ? "An example: a Windows PC after a fake support call. Replace it with yours." : "Your report"}
          </label>
          <span>
            <button type="button" onClick={() => setText("")}>Clear</button>
            {" · "}
            <button type="button" onClick={() => setText(SAMPLE_WINDOWS_NETSTAT)}>Example</button>
          </span>
        </div>
        <textarea
          id="pc-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          placeholder={"Paste the scanner report here,\nor netstat -ano, ss -tunap, lsof -i output."}
        />
        <h2 className="pc-split__head" id="check-title">Paste it in.</h2>
      </div>

      <div className="pc-split__out">
        <div data-ui style={{ border: 0, background: "transparent", flex: 1, display: "flex", flexDirection: "column" }}>
          <ScanResultView result={result} />
          <div className="pc-result__foot" style={{ marginTop: 16 }}>
            <span>Checked in your browser. Nothing has been sent anywhere.</span>
            {result.verdict !== "empty" && !isSample ? (
              <>
                <SignedIn>
                  <Link href="/app?tab=scan" className="pc-btn" onClick={() => stash(text)}>
                    Get the AI second opinion
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignUpButton forceRedirectUrl="/app?tab=scan" signInForceRedirectUrl="/app?tab=scan">
                    <button type="button" className="pc-btn" onClick={() => stash(text)}>
                      Get the AI second opinion
                    </button>
                  </SignUpButton>
                </SignedOut>
              </>
            ) : null}
          </div>
        </div>
        <h2 className="pc-split__head pc-split__head--out" aria-hidden>Read it out.</h2>
      </div>
    </section>
  );
}
