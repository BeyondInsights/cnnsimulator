import React from 'react';
import styles from './ReviewVerticalsModal.module.css'; // Import CSS Module

interface VerticalFeature {
  concept: string;
  features: string[];
}

interface VerticalDescriptions {
  [verticalName: string]: VerticalFeature;
}

interface ReviewVerticalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  verticalsData: VerticalDescriptions;
}

const ReviewVerticalsModal: React.FC<ReviewVerticalsModalProps> = ({
  isOpen,
  onClose,
  verticalsData,
}) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay-base ${styles.modalOverlay}`}> {/* Using global base class */}
      <div className={`modal-content-base ${styles.modalContent}`}> {/* Using global base class and module override */}
        <h2 className={styles.modalTitle}>Review Verticals</h2>
        <div className={styles.contentArea}>
          {Object.entries(verticalsData).map(([name, verticalDetails]) => (
            <div key={name} className={styles.verticalItem}>
              <h3 className={`${styles.verticalName} cnn-purple`}>{name}</h3>
              <p className={styles.verticalConcept}><strong>Concept:</strong> {verticalDetails.concept}</p>
              <h4 className={styles.featuresTitle}>Features:</h4>
              <ul className={styles.featuresList}>
                {verticalDetails.features.map((feature, index) => (
                  <li key={index} className={styles.featureListItem}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.modalActions}>
          <button onClick={onClose} className={`button-base ${styles.closeButton}`}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReviewVerticalsModal;
