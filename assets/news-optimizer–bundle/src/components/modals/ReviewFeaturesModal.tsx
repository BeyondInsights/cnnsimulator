import React, { useState } from 'react';
import styles from './ReviewFeaturesModal.module.css'; // Import CSS Module

interface FeatureDescriptions { [featureName: string]: string; }

interface ReviewFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  readerFeatures: FeatureDescriptions;
  streamingFeatures: FeatureDescriptions;
}

const ReviewFeaturesModal: React.FC<ReviewFeaturesModalProps> = ({
  isOpen,
  onClose,
  readerFeatures,
  streamingFeatures,
}) => {
  const [activeTab, setActiveTab] = useState<'Reader' | 'Streaming'>('Reader');

  if (!isOpen) return null;

  const featuresToDisplay = activeTab === 'Reader' ? readerFeatures : streamingFeatures;

  return (
    <div className={`modal-overlay-base ${styles.modalOverlay}`}> {/* Using global base class */}
      <div className={`modal-content-base ${styles.modalContent}`}> {/* Using global base class and module override */}
        <h2 className={styles.modalTitle}>Review Features</h2>
        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'Reader' ? `${styles.activeTabButton} cnn-red` : ''}`}
            onClick={() => setActiveTab('Reader')}
          >
            Reader Features
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'Streaming' ? `${styles.activeTabButton} cnn-red` : ''}`}
            onClick={() => setActiveTab('Streaming')}
          >
            Streaming Features
          </button>
        </div>
        <div className={styles.contentArea}>
          {Object.entries(featuresToDisplay).map(([name, description], index) => (
            <div key={name} className={styles.featureItem}>
              <h3 className={`${styles.featureName} cnn-blue`}>{index + 1}. {name}</h3>
              <p className={styles.featureDescription}>{description}</p>
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

export default ReviewFeaturesModal;
