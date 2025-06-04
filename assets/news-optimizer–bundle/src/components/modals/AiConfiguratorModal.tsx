import React from 'react';
import styles from './AiConfiguratorModal.module.css';

interface AiConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiConfiguratorModal: React.FC<AiConfiguratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay-base ${styles.modalOverlay}`}>
      <div className={`modal-content-base ${styles.modalContent}`}>
        <h2 className={`${styles.modalTitle} cnn-purple`}>🤖 AI Configurator</h2>
        <div className={styles.contentArea}>
          <p className={styles.paragraph}>
            Welcome to the AI Configurator!
          </p>
          <p className={styles.paragraph}>
            This advanced feature will leverage artificial intelligence to help you automatically generate and optimize product configurations based on market data and your strategic goals.
          </p>
          <p className={`${styles.comingSoon} cnn-purple`}>
            Feature Coming Soon!
          </p>
          <p className={styles.paragraph}>
            Stay tuned for AI-powered suggestions, automated scenario testing, and intelligent product bundling recommendations.
          </p>
        </div>
        <div className={styles.modalActions}>
          <button onClick={onClose} className={`button-base ${styles.closeButton}`}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AiConfiguratorModal;
