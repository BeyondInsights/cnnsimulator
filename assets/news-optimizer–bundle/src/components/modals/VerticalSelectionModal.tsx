import React, { useState, useEffect } from 'react';
import styles from './VerticalSelectionModal.module.css'; // Ensure this CSS module has .featureItem, .checkbox etc. like FeatureSelectionModal

interface VerticalDescription { concept: string; features: string[]; }
interface VerticalDescriptions { [verticalName: string]: VerticalDescription; }

interface VerticalSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableVerticals: VerticalDescriptions;
  initiallySelectedVerticals: string[];
  onAddVerticals: (selectedVerticals: string[]) => void;
  baseProductName: string; // To determine selection limits
}

const VerticalSelectionModal: React.FC<VerticalSelectionModalProps> = ({
  isOpen,
  onClose,
  availableVerticals,
  initiallySelectedVerticals,
  onAddVerticals,
  baseProductName,
}) => {
  const [currentSelections, setCurrentSelections] = useState<string[]>(initiallySelectedVerticals);

  useEffect(() => {
    if (isOpen) {
      setCurrentSelections(initiallySelectedVerticals);
    }
  }, [isOpen, initiallySelectedVerticals]);

  if (!isOpen) return null;

  const verticalNames = Object.keys(availableVerticals);
  const maxSelectable = baseProductName === "CNN Standalone Vertical" ? 1 : 3;

  const handleCheckboxChange = (verticalName: string) => {
    setCurrentSelections(prev => {
      const isSelected = prev.includes(verticalName);
      if (isSelected) {
        return prev.filter(v => v !== verticalName);
      } else {
        if (prev.length < maxSelectable) {
          return [...prev, verticalName];
        } else {
          alert(`Maximum ${maxSelectable} vertical${maxSelectable > 1 ? 's' : ''} allowed for ${baseProductName}.`);
          return prev; // Do not add if limit reached
        }
      }
    });
  };

  const handleSelectAll = () => {
    if (currentSelections.length === verticalNames.length) {
      setCurrentSelections([]);
    } else {
      // Respect maxSelectable when selecting all
      setCurrentSelections(verticalNames.slice(0, maxSelectable));
      if(verticalNames.length > maxSelectable) {
        alert(`Selected the first ${maxSelectable} verticals. Maximum ${maxSelectable} allowed for ${baseProductName}.`);
      }
    }
  };

  const handleSubmit = () => {
    onAddVerticals(currentSelections);
    onClose();
  };

  return (
    <div className={`modal-overlay-base ${styles.modalOverlay}`}>
      <div className={`modal-content-base ${styles.modalContent}`}>
        <h2 className={`${styles.modalTitle} cnn-purple`}>Select Verticals (Up to {maxSelectable})</h2>
        
        {verticalNames.length > 0 && (
          <button 
            onClick={handleSelectAll} 
            className={`button-base bg-cnn-blue ${styles.selectAllButton}`} // Assuming similar class from FeatureSelectionModal CSS
            disabled={verticalNames.length === 0}
          >
            {currentSelections.length === verticalNames.length && verticalNames.length <= maxSelectable ? 'Deselect All' : 'Select All (Up to Limit)'}
          </button>
        )}
        
        <div className={styles.featuresList}> {/* Assuming similar class from FeatureSelectionModal CSS */}
          {verticalNames.length > 0 ? (
            verticalNames.map((name, index) => (
              <div key={name} className={`${styles.featureItem} ${currentSelections.includes(name) ? styles.featureItemSelected : ''}`}> {/* Reuse styles */}
                <input
                  type="checkbox"
                  id={`vertical-${name}`}
                  checked={currentSelections.includes(name)}
                  onChange={() => handleCheckboxChange(name)}
                  className={styles.checkbox} /* Reuse styles */
                />
                <label htmlFor={`vertical-${name}`} title={availableVerticals[name]?.concept} className={styles.featureLabel}> {/* Reuse styles */}
                  {index + 1}. {name}
                </label>
              </div>
            ))
          ) : (
            <p className={styles.placeholderText}>No verticals available.</p>
          )}
        </div>

        <div className={styles.modalActions}>
          <button onClick={handleSubmit} className={`button-base bg-cnn-purple ${styles.button}`}>Add Selected Verticals</button> 
          <button onClick={onClose} className={`button-base ${styles.button}`} style={{backgroundColor: '#6c757d'}}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default VerticalSelectionModal;
