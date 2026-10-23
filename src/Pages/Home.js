import React, { useEffect } from "react";
import Layout from "../components/layout/Layout";
import ProfileHero from "../components/profile/ProfileHero";
import WhoWeAre from "../components/profile/WhoWeAre";
import Culture from "../components/profile/Culture";
import Scale from "../components/profile/Scale";
import GlobalReach from "../components/profile/GlobalReach";
import Portfolios from "../components/profile/Portfolios";
import Products from "../components/sections/Products";
import IndustriesGrid from "../components/profile/IndustriesGrid";
import Clients from "../components/profile/Clients";
import Partners from "../components/profile/Partners";
import Engage from "../components/profile/Engage";
import WhyChoose from "../components/profile/WhyChoose";
import Faq from "../components/profile/Faq";
import Contact from "../components/sections/Contact";
import { setMeta } from "../utils/meta";
import { ROUTES } from "../data/seo";

/**
 * The homepage: the Linkfields Corporate Profile 2026, as a site.
 *
 * It follows the deck's argument, with one change of order:
 *
 *   Hero         - the promise, and the globe the company delivers across.
 *   Who we are   - positioning, five portfolios, mission and vision.
 *   Culture      - rooted in Africa.
 *   Scale        - the figures.
 *   Global reach - where the people are.
 *   Portfolios   - what they do. Moved up from after the partner slides: on
 *                  a page people scroll rather than click through, the offer
 *                  must arrive before the proof, not after two logo walls.
 *   Products     - the Linkfields software, each with its live demo.
 *   Industries   - where they do it.
 *   Clients      - who trusts them.
 *   Partners     - who they build with, and recognition.
 *   Engage       - how to buy.
 *   Why          - the summary argument.
 *   FAQ          - the same facts as direct answers, for people and for
 *                  answer engines.
 *   Contact      - the ask.
 */
export default function Home() {
  useEffect(() => {
    setMeta(ROUTES.home);
  }, []);

  return (
    <Layout>
      <ProfileHero />
      <WhoWeAre />
      <Culture />
      <Scale />
      <GlobalReach />
      <Portfolios />
      <Products />
      <IndustriesGrid />
      <Clients />
      <Partners />
      <Engage />
      <WhyChoose />
      <Faq />
      <Contact />
    </Layout>
  );
}
