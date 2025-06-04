import React, { useState, useEffect } from 'react';
import styles from './SetReportTypeModal.module.css'; // Import CSS Module

interface SetReportTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReportType: string;
  currentOutputMetric: string;
  onApplySettings: (settings: { reportType: string; outputMetric: string }) => void;
}

const REPORT_TYPES = ["Tiered Bundles", "A La Carte", "Market Penetration"];
const OUTPUT_METRICS = ["Take Rates (%)", "Revenue Projection ($)", "Population Count"];

const SetReportTypeModal: React.FC<SetReportTypeModalProps> = ({
  isOpen,
  onClose,
  currentReportType,
  currentOutputMetric,
  onApplySettings,
}) => {
  const [selectedReportType, setSelectedReportType] = useState(currentReportType);
  const [selectedOutputMetric, setSelectedOutputMetric] = useState(currentOutputMetric);

  useEffect(() => {
    if (isOpen) {
      setSelectedReportType(currentReportType);
      setSelectedOutputMetric(currentOutputMetric);
    }
  }, [isOpen, currentReportType, currentOutputMetric]);

  const handleApply = () => {
    onApplySettings({ reportType: selectedReportType, outputMetric: selectedOutputMetric });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay-base ${styles.modalOverlay}`}>
      <div className={`modal-content-base ${styles.modalContent}`}>
        <h2 className={styles.modalTitle}>Set Report Type & Output</h2>
        
        <div className={styles.formGroup}>
          <label htmlFor="reportType" className={styles.label}>Report Type:</label>
          <select 
            id="reportType" 
            value={selectedReportType} 
            onChange={(e) => setSelectedReportType(e.target.value)} 
            className={styles.select}
          >
            {REPORT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="outputMetric" className={styles.label}>Output Metric:</label>
          <select 
            id="outputMetric" 
            value={selectedOutputMetric} 
            onChange={(e) => setSelectedOutputMetric(e.target.value)} 
            className={styles.select}
          >
            {OUTPUT_METRICS.map(metric => (
              <option key={metric} value={metric}>{metric}</option>
            ))}
          </select>
        </div>

        <div className={styles.modalActions}>
          <button onClick={handleApply} className={`button-base bg-cnn-blue ${styles.applyButton}`}>Apply Settings</button>
          <button onClick={onClose} className={`button-base ${styles.cancelButton}`}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SetReportTypeModal;
