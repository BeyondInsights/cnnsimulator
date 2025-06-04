import React, { useState, useEffect } from 'react';
import styles from './FeatureSelectionModal.module.css'; // Import CSS Module

interface FeatureSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  features: { [key: string]: string };
  featureType: 'Reader' | 'Streaming';
  onAddFeatures: (selectedFeatures: string[]) => void;
  initiallySelectedFeatures: string[];
}

const FeatureSelectionModal: React.FC<FeatureSelectionModalProps> = ({
  isOpen,
  onClose,
  features,
  featureType,
  onAddFeatures,
  initiallySelectedFeatures,
}) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(initiallySelectedFeatures);

  useEffect(() => {
    if (isOpen) {
      setSelectedFeatures(initiallySelectedFeatures);
    }
  }, [initiallySelectedFeatures, isOpen]);

  if (!isOpen) return null;

  const handleCheckboxChange = (featureName: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureName)
        ? prev.filter(f => f !== featureName)
        : [...prev, featureName]
    );
  };

  const handleSelectAll = () => {
    if (selectedFeatures.length === Object.keys(features).length) {
      setSelectedFeatures([]);
    } else {
      setSelectedFeatures(Object.keys(features));
    }
  };

  const handleSubmit = () => {
    onAddFeatures(selectedFeatures);
    onClose();
  };

  return (
    <div className={`modal-overlay-base ${styles.modalOverlay}`}>
      <div className={`modal-content-base ${styles.modalContent}`}>
        <h2 className={styles.modalTitle}>Select {featureType} Features</h2>
        <button 
          onClick={handleSelectAll} 
          className={`button-base bg-cnn-blue ${styles.selectAllButton}`}
        >
          {selectedFeatures.length === Object.keys(features).length ? 'Deselect All' : 'Select All Available'}
        </button>
        <div className={styles.featuresList}>
          {Object.entries(features).map(([name, description], index) => (
            <div key={name} className={`${styles.featureItem} ${selectedFeatures.includes(name) ? styles.featureItemSelected : ''}`}>
              <input
                type="checkbox"
                id={`${featureType}-${name}`}
                checked={selectedFeatures.includes(name)}
                onChange={() => handleCheckboxChange(name)}
                className={styles.checkbox}
              />
              <label htmlFor={`${featureType}-${name}`} title={description} className={styles.featureLabel}>
                {index + 1}. {name}
              </label>
            </div>
          ))}
        </div>
        <div className={styles.modalActions}>
          <button onClick={handleSubmit} className={`button-base bg-cnn-red ${styles.addSelectedButton}`}>Add Selected</button> {/* Changed to red */}
          <button onClick={onClose} className={`button-base ${styles.cancelButton}`}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default FeatureSelectionModal;
