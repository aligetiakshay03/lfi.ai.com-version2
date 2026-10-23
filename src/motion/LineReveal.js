import React, { useRef } from "react";
import { gsap, SplitText, EASE, prefersReducedMotion } from "./index";
import useGsap from "./useGsap";

/* ==========================================================================
   Heading reveal.

   The signature typographic entrance, used by every section heading: the
   heading is split into its rendered lines and words, each line sits in a
   clipping mask, and the words rise into place one after another, left to
   right, fading in and coming out of a slight blur. It is deliberately slow
   (~2.5s for a seven-word heading) and replays each time the heading comes
   back into view. `split="lines"` keeps the older, quicker line-by-line
   reveal for anything that wants it.

   Three things that usually go wrong with split text, and how they are
   handled here:

   - RESPONSIVE RE-WRAP. Where a heading breaks depends on the viewport, so a
     split taken at mount is wrong after a resize. `autoSplit` re-splits on
     resize and on font load, and re-runs `onSplit` - which is why the tween
     is CREATED INSIDE onSplit and RETURNED from it, so GSAP reverts the old
     one rather than leaving a stale tween holding a dead element.

   - ACCESSIBILITY. `aria: "auto"` puts the original string on the element as
     an aria-label and hides the generated line divs, so a screen reader reads
     the heading as one sentence instead of spelling out fragments. The real
     text is still in the DOM for search engines and text selection.

   - THE BLANK-HEADING FAILURE. The resting rule that hides the element before
     the split is gated on `.lfi-js`, and the attribute is flipped to "in" in
     a `finally`, so a thrown error or a missing plugin leaves the heading
     VISIBLE rather than invisible. A motion bug must never cost the content.
   ========================================================================== */

/** The word reveal's motion, shared with the homepage hero's title. */
export const WORD_REVEAL = {
  from: { yPercent: 45, opacity: 0, filter: "blur(4px)" },
  to: {
    yPercent: 0,
    opacity: 1,
    filter: "blur(0px)",
    duration: 1.3,
    ease: EASE.out,
    // Leave no filter behind: a resting blur(0px) still costs a compositing
    // layer per word.
    clearProps: "filter",
  },
};

/**
 * Gradient text (`.lfi-accent`) split into words.
 *
 * The accent paints its gradient through its own text with background-clip.
 * Once each word is a separately animated box, that text belongs to the words
 * and the phrase paints nothing - the words come out invisible. So each word
 * gets the phrase's gradient itself, sized to the whole phrase and offset by
 * the word's position in it, which keeps the colour running continuously
 * across the phrase. Re-run after anything that moves the words (a resize).
 */
export function paintAccentWords(root) {
  root.querySelectorAll(".lfi-accent").forEach((phrase) => {
    const box = phrase.getBoundingClientRect();
    const image = window.getComputedStyle(phrase).backgroundImage;
    phrase.querySelectorAll(":scope > div").forEach((word) => {
      // offsetLeft/Top, not the bounding box: the word may be mid-animation.
      const x = word.offsetLeft - phrase.offsetLeft;
      const y = word.offsetTop - phrase.offsetTop;
      Object.assign(word.style, {
        backgroundImage: image,
        backgroundSize: `${box.width}px ${box.height}px`,
        backgroundPosition: `${-x}px ${-y}px`,
        backgroundRepeat: "no-repeat",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      });
    });
  });
}

/** 0.2s between words, tightened on long headings so none runs past ~3s. */
export const wordStagger = (count) => Math.min(0.2, 1.7 / Math.max(count - 1, 1));

export default function LineReveal({
  as: Tag = "h2",
  className = "",
  children,
  delay = 0,
  stagger = 0.085,
  start = "top 88%",
  // "words" (the default) or "lines" for the quicker line-by-line reveal.
  split = "words",
  // Play again every time the heading comes back into view (it resets, out
  // of sight, once it has left). false plays it once per page load.
  replay = true,
  ...rest
}) {
  const ref = useRef(null);

  useGsap(
    (el) => {
      if (prefersReducedMotion()) {
        el.setAttribute("data-lines", "in");
        return;
      }

      const words = split === "words";
      try {
        SplitText.create(el, {
          type: words ? "lines,words" : "lines",
          mask: "lines",
          aria: "auto",
          autoSplit: true,
          linesClass: "lfi-line",
          // A timeline that SETS the hidden state at 0 and then tweens to
          // rest, not a staggered gsap.from: when ScrollTrigger refreshes (a
          // fit-to-screen section changing height, say) it re-renders the
          // animation at time 0, and a staggered from() only re-applies its
          // start values to the targets whose stagger has begun - the first
          // one. Every other line or word was left showing, then jumped
          // down when its turn came.
          onSplit: (self) => {
            const targets = words ? self.words : self.lines;
            if (words) paintAccentWords(el);
            const scrollTrigger = replay
              ? // enter / leave / enter back / leave back. The reset happens
                // as the heading leaves the screen, so it is never seen.
                { trigger: el, start, end: "bottom top", toggleActions: "restart reset restart reset" }
              : { trigger: el, start, once: true };
            return gsap
              .timeline({ scrollTrigger })
              .set(targets, {
                // Words: a short rise out of a soft focus - the slow,
                // left-to-right read is carried by the stagger, not by
                // distance travelled. Lines: a full rise out of the mask,
                // with a touch of opacity so it is not a hard shutter.
                ...(words ? WORD_REVEAL.from : { yPercent: 112, opacity: 0 }),
                // The timeline waits on its trigger; hide now, not on play.
                immediateRender: true,
              })
              .to(targets, {
                ...(words
                  ? { ...WORD_REVEAL.to, stagger: wordStagger(targets.length) }
                  : { yPercent: 0, opacity: 1, duration: 1, stagger, ease: EASE.emphasis }),
                delay,
              });
          },
        });
      } catch (err) {
        // Nothing to recover - the finally below guarantees the text shows.
      } finally {
        el.setAttribute("data-lines", "in");
      }
    },
    [children, delay, stagger, start, split, replay],
    ref
  );

  return (
    <Tag ref={ref} data-lines="" className={`lfi-lines ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
