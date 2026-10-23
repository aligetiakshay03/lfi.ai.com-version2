import React from "react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { faqs } from "../../data/faq";
import "./Faq.css";

/**
 * Frequently asked questions.
 *
 * Native <details>, not a scripted accordion: every answer is in the DOM from
 * first render, so crawlers and answer engines read it whether or not it is
 * open, and it works with no JavaScript at all. The matching FAQPage
 * structured data is written into the HTML at build time from the same list.
 */
export default function Faq() {
  return (
    <section className="lfi-section pf-faq" id="faq" data-light="amber">
      <div className="lfi-container">
        <div className="lfi-section-head">
          <SectionHeading eyebrow="FAQ" title="Questions we are often asked" wide />
        </div>
        <div className="pf-faq__list">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={Math.min(i * 40, 240)}>
              <details className="pf-faq__item">
                <summary>
                  <h3>{f.q}</h3>
                  <span className="pf-faq__icon" aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
