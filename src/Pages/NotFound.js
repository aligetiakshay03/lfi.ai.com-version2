import React, { useEffect } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import { setMeta } from "../utils/meta";
import { ROUTES } from "../data/seo";
import "./NotFound.css";

export default function NotFound() {
  useEffect(() => {
    setMeta(ROUTES.notFound);
  }, []);

  return (
    <Layout>
      <section className="lfi-404">
        <div className="lfi-container">
          <p className="lfi-eyebrow">404</p>
          <h1>That page is not here.</h1>
          <p className="lfi-lede">
            The link may be out of date. The demo catalogue is the best place
            to pick things up again.
          </p>
          <div className="lfi-404__actions">
            <Button to="/demos" variant="primary">
              Browse the catalogue
            </Button>
            <Button to="/" variant="secondary">
              Back to home
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
