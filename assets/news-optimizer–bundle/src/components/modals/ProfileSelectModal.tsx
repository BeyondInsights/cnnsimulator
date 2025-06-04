import React, { useState, useEffect } from 'react';
import styles from './ProfileSelectModal.module.css'; // Import CSS Module

interface ProfileSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProducts: string[];
  onGenerateProfiles: (selectedProductIds: string[]) => void;
}

const ProfileSelectModal: React.FC<ProfileSelectModalProps> = ({
  isOpen,
  onClose,
  activeProducts,
  onGenerateProfiles,
}) => {
  const [selectedProductsForProfile, setSelectedProductsForProfile] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Filter to ensure only currently active products can be pre-selected or remain selected
      setSelectedProductsForProfile(prevSelected => prevSelected.filter(p => activeProducts.includes(p)));
    } else {
      // Optionally clear selection when modal is closed if that's desired behavior
      // setSelectedProductsForProfile([]); 
    }
  }, [isOpen, activeProducts]);

  const handleCheckboxChange = (productId: string) => {
    setSelectedProductsForProfile(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleGenerate = () => {
    if (selectedProductsForProfile.length === 0) {
      alert("Please select at least one product to generate profiles.");
      return;
    }
    onGenerateProfiles(selectedProductsForProfile);
    onClose(); 
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay-base ${styles.modalOverlay}`}>
      <div className={`modal-content-base ${styles.modalContent}`}>
        <h2 className={styles.modalTitle}>Select Products for Profile Comparison</h2>
        
        {activeProducts.length === 0 ? (
          <p className={styles.noProductsText}>No products are currently active. Please activate products on the dashboard to compare profiles.</p>
        ) : (
          <div className={styles.productList}>
            {activeProducts.map(productId => (
              <div key={productId} className={styles.productItem}>
                <input
                  type="checkbox"
                  id={`profile-select-${productId}`}
                  checked={selectedProductsForProfile.includes(productId)}
                  onChange={() => handleCheckboxChange(productId)}
                  className={styles.checkbox}
                />
                <label htmlFor={`profile-select-${productId}`} className={styles.label}>{productId}</label>
              </div>
            ))}
          </div>
        )}

        <div className={styles.modalActions}>
          <button 
            onClick={handleGenerate} 
            className={`button-base bg-cnn-green ${styles.generateButton}`}
            disabled={activeProducts.length === 0 || selectedProductsForProfile.length === 0}
          >
            Show Profile
          </button>
          <button onClick={onClose} className={`button-base ${styles.cancelButton}`}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelectModal;
