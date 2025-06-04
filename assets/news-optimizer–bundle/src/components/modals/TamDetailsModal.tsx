import React from 'react';
import styles from './TamDetailsModal.module.css'; // Import CSS Module

interface TamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TamDetailsModal: React.FC<TamDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay-base ${styles.modalOverlay}`}>
      <div className={`modal-content-base ${styles.modalContent}`}>
        <h2 className={styles.modalTitle}>Total Addressable Market (TAM) Details</h2>
        <div className={styles.contentArea}>
          <p className={styles.introParagraph}>
            The Total Addressable Market (TAM) for the CNN News Subscription Simulator is estimated based on the following methodology:
          </p>
          <section className={styles.section}>
            <h3 className={`${styles.sectionTitle} cnn-blue`}>1. US Adult Population</h3>
            <p className={styles.paragraph}>
              Starting with the total adult population in the United States.
              {/* Placeholder for specific data: e.g., "(Approximately X million adults aged 18+)" */}
            </p>
          </section>
          <section className={styles.section}>
            <h3 className={`${styles.sectionTitle} cnn-blue`}>2. Income Filters</h3>
            <p className={styles.paragraph}>
              Applying filters based on household income levels to identify potential subscribers with the financial capacity for news subscriptions.
              {/* Placeholder for specific data: e.g., "(Focusing on households with annual income above $Y)" */}
            </p>
          </section>
          <section className={styles.section}>
            <h3 className={`${styles.sectionTitle} cnn-blue`}>3. Digital Engagement Criteria</h3>
            <p className={styles.paragraph}>
              Further refining the market by considering digital engagement criteria, such as internet access, digital news consumption habits, and subscription propensity.
              {/* Placeholder for specific data: e.g., "(Includes individuals who actively consume news online and have existing digital subscriptions)" */}
            </p>
          </section>
          <section className={styles.section}>
            <h3 className={`${styles.sectionTitle} cnn-blue`}>4. Final TAM Calculation</h3>
            <p className={styles.paragraph}>
              The combination of these factors leads to the estimated Total Addressable Market.
            </p>
            <p className={styles.paragraphBold}> {/* Used composes here if you prefer that pattern */}
              Estimated TAM: 105,624,640 individuals.
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

export default TamDetailsModal;
