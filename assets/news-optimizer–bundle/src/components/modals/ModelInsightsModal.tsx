import React from 'react';
import styles from './ModelInsightsModal.module.css'; // Import CSS Module

interface ModelInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModelInsightsModal: React.FC<ModelInsightsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay-base ${styles.modalOverlay}`}>
      <div className={`modal-content-base ${styles.modalContent}`}>
        <h2 className={styles.modalTitle}>Model Insights</h2>
        <div className={styles.contentArea}>
          <p className={styles.paragraph}>
            This section will provide deeper insights derived from the simulation model. 
            Currently, this is a placeholder. In a full implementation, you might find:
          </p>
          <ul className={styles.list}>
            <li>Key drivers of subscription choice.</li>
            <li>Sensitivity analysis summaries.</li>
            <li>Optimal feature combinations for different segments.</li>
            <li>Market share predictions under various scenarios.</li>
          </ul>
          <p className={styles.paragraph}>
            A dedicated insights page or more detailed reports would typically be linked here, offering advanced analytics 
            and visualizations to help understand the underlying data and model behavior.
          </p>
        </div>
        <div className={styles.modalActions}>
          <button onClick={onClose} className={`button-base ${styles.closeButton}`}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ModelInsightsModal;
