import React from 'react';
import styles from './AboutModelModal.module.css'; // Import CSS Module

interface AboutModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModelModal: React.FC<AboutModelModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay-base ${styles.modalOverlay}`}> {/* Using global base class */}
      <div className={`modal-content-base ${styles.modalContent}`}> {/* Using global base class and module override */}
        <h2 className={styles.modalTitle}>About This Model</h2>
        <div className={styles.contentArea}>
          <section className={styles.section}>
            <h3 className={`${styles.sectionTitle} cnn-blue`}>DRN Methodology</h3>
            <p className={styles.paragraph}>
              Detailed explanation of the Demand-Driven Radio Network (DRN) methodology employed in this simulator. 
              This approach helps in understanding market dynamics and subscription preferences based on a robust analytical framework.
            </p>
          </section>
          <section className={styles.section}>
            <h3 className={`${styles.sectionTitle} cnn-blue`}>Conjoint Analysis Basis</h3>
            <p className={styles.paragraph}>
              The simulation model is built upon principles of conjoint analysis, a statistical technique used in market research 
              to determine how people value different attributes (features, functions, benefits) that make up an individual product or service.
            </p>
          </section>
          <section className={styles.section}>
            <h3 className={`${styles.sectionTitle} cnn-blue`}>Market Factors Impact</h3>
            <p className={styles.paragraph}>
              Learn how external market factors such as Awareness, Distribution, Competitive Response, and Marketing Effectiveness 
              are integrated into the model to provide realistic simulation outcomes under various scenarios.
            </p>
          </section>
          <section className={styles.section}>
            <h3 className={`${styles.sectionTitle} cnn-blue`}>Simulation Approach</h3>
            <p className={styles.paragraph}>
              Overview of the simulation engine, data sources, and algorithms used to predict take rates, revenue, and other key metrics. 
              The approach combines demographic data, feature preferences, and pricing sensitivity.
            </p>
          </section>
          <section className={styles.section}>
            <h3 className={`${styles.sectionTitle} cnn-blue`}>Key Summary Diagnostics</h3>
            <p className={styles.paragraph}>
              This section will provide key summary diagnostics and performance indicators of the model itself, ensuring transparency and confidence in its outputs. 
              (Further details to be added here based on specific diagnostics available).
            </p>
          </section>
        </div>
        <div className={styles.modalActions}>
          <button onClick={onClose} className={`button-base ${styles.closeButton}`}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AboutModelModal;
