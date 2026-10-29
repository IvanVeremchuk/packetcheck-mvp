"use client";

import Link from "next/link";
import SubscribeButton from "@/components/SubscribeButton";

type Plan = {
  id: "free" | "pack" | "pro";
  name: string;
  price: string;
  period: string;
  pick?: boolean;
  cells: string[];
};

const ROWS = [
  "Scanner and in-browser check",
  "AI second opinions",
  "IP reputation (AbuseIPDB)",
  "Server log IP analysis",
  "Account",
];

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    cells: ["Unlimited", "3 a month", "Included with AI checks", "3 a month, shared", "Only for AI checks"],
  },
  {
    id: "pack",
    name: "Check pack",
    price: "$3",
    period: "once",
    pick: true,
    cells: ["Unlimited", "10 more, never expire", "Included", "Uses the same 10", "Yes, no subscription"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$5",
    period: "a month",
    cells: ["Unlimited", "150 a month", "Included", "Uses the same 150", "Yes, cancel any time"],
  },
];

function Action({ plan }: { plan: Plan }) {
  if (plan.id === "free") {
    return <Link href="/#scan" className="pc-btn pc-btn--quiet">Run the free scan</Link>;
  }
  if (plan.id === "pack") {
    return <SubscribeButton kind="pack" label="Buy 10 checks" className="pc-btn" />;
  }
  return <SubscribeButton kind="pro" label="Start Pro" className="pc-btn" />;
}

export default function PricingTable({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const H = headingLevel === 1 ? "h1" : "h2";
  return (
    <section className="pc-section" id="pricing" aria-labelledby="pricing-title">
      <div className="pc-pricing">
        <table className="pc-ptable">
          <thead>
            <tr>
              <th scope="col">
                <H className="pc-h2" id="pricing-title">Pay only for AI checks</H>
              </th>
              {PLANS.map((p) => (
                <th key={p.id} scope="col" className={p.pick ? "is-pick" : undefined}>
                  <span className="pc-plan">{p.name}</span>
                  <span className="pc-price">
                    {p.price} <span className="pc-period">{p.period}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row}>
                <th scope="row">{row}</th>
                {PLANS.map((p) => (
                  <td key={p.id} className={p.pick ? "is-pick" : undefined}>{p.cells[i]}</td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" />
              {PLANS.map((p) => (
                <td key={p.id} className={p.pick ? "is-pick" : undefined}><Action plan={p} /></td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="pc-plans-mobile">
        <H className="pc-h2" style={{ marginBottom: 8 }}>Pay only for AI checks</H>
        {PLANS.map((p) => (
          <div key={p.id} className={`pc-pmob${p.pick ? " is-pick" : ""}`}>
            <h3>{p.name}, {p.price}{p.period ? ` ${p.period}` : ""}</h3>
            <dl>
              {ROWS.map((row, i) => (
                <div key={row}>
                  <dt>{row}</dt>
                  <dd>{p.cells[i]}</dd>
                </div>
              ))}
            </dl>
            <Action plan={p} />
          </div>
        ))}
      </div>

      <p className="pc-pricing__why">
        The scanner and the in-browser check cost us nothing to run, so they stay free. An AI check
        costs us well under a cent in model and lookup fees; the price covers card fees, servers and
        the time it takes to keep the rules current. A pack is the smallest payment that is worth the
        card fee.
      </p>
    </section>
  );
}
