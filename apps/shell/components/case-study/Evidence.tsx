import { illustrative } from "@skj/content";
import { RemoteWidget } from "../RemoteWidget";
import { MfeDiagram } from "../diagrams/MfeDiagram";
import { BillingFlowDiagram } from "../diagrams/BillingFlowDiagram";
import styles from "./CaseStudy.module.css";

/**
 * Per-project evidence. Interactive widgets come from the case-studies remote; static
 * diagrams render on the server. Returns null for projects without evidence.
 */
export function Evidence({ slug }: { slug: string }) {
  switch (slug) {
    case "ai-agentic-platform":
      return (
        <div className={styles.evidenceStack}>
          <RemoteWidget
            id="caseStudies/LighthouseSlider"
            label="The Lighthouse comparison"
            minHeight={440}
            props={{ data: illustrative.lighthouse }}
          />
          <RemoteWidget
            id="caseStudies/BundleChart"
            label="The bundle chart"
            minHeight={480}
            props={{ data: illustrative.bundle }}
          />
        </div>
      );
    case "saas-elearning":
      return <MfeDiagram />;
    case "edtech-platform":
      return <BillingFlowDiagram />;
    default:
      return null;
  }
}

export const EVIDENCE_TITLES: Record<string, string> = {
  "ai-agentic-platform": "Performance, visualized",
  "saas-elearning": "Architecture",
  "edtech-platform": "Billing flow",
};
