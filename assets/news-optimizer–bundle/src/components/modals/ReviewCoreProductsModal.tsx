import React from 'react';
import styles from './ReviewCoreProductsModal.module.css'; // Import CSS Module

interface CoreProductDescriptions { [productName: string]: string; }

interface ReviewCoreProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coreProducts: CoreProductDescriptions;
}

const ReviewCoreProductsModal: React.FC<ReviewCoreProductsModalProps> = ({
  isOpen,
  onClose,
  coreProducts,
}) => {
  if (!isOpen) return null;

  return (
    <div className={`${styles.modalOverlay} modal-overlay-base`}> {/* Using global base class */}
      <div className={`${styles.modalContent} modal-content-base`}> {/* Using global base class */}
        <h2 className={styles.modalTitle}>Core News Products</h2>
        <div className={styles.contentArea}>
          {Object.entries(coreProducts).map(([name, description]) => (
            <div key={name} className={styles.productItem}>
              <h3 className={`${styles.productName} cnn-red`}>{name}</h3>
              <p className={styles.productDescription}>{description}</p>
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

export default ReviewCoreProductsModal;
