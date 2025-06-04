import React, { useState, useEffect } from 'react';
import styles from './MarketFactorsModal.module.css'; // Import CSS Module

interface MarketFactorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onApplyFactors: (factors: MarketFactorSettings) => void; // Callback to apply factors
}

interface MarketFactorSettings {
  scenario: string;
  awareness: number;
  distribution: number;
  competitive: number;
  marketing: number;
}

const PRESET_SCENARIOS: { [key: string]: MarketFactorSettings } = {
  "Conservative Launch": { scenario: "Conservative Launch", awareness: 30, distribution: 30, competitive: 70, marketing: 30 },
  "Standard Launch": { scenario: "Standard Launch", awareness: 50, distribution: 50, competitive: 50, marketing: 50 },
  "Aggressive Launch": { scenario: "Aggressive Launch", awareness: 70, distribution: 70, competitive: 30, marketing: 70 },
  "Custom": { scenario: "Custom", awareness: 50, distribution: 50, competitive: 50, marketing: 50 },
};

const MarketFactorsModal: React.FC<MarketFactorsModalProps> = ({
  isOpen,
  onClose,
  // onApplyFactors,
}) => {
  const [scenario, setScenario] = useState<string>("Standard Launch");
  const [awareness, setAwareness] = useState<number>(PRESET_SCENARIOS["Standard Launch"].awareness);
  const [distribution, setDistribution] = useState<number>(PRESET_SCENARIOS["Standard Launch"].distribution);
  const [competitive, setCompetitive] = useState<number>(PRESET_SCENARIOS["Standard Launch"].competitive);
  const [marketing, setMarketing] = useState<number>(PRESET_SCENARIOS["Standard Launch"].marketing);

  useEffect(() => {
    if (isOpen) { // Reset to default when modal is opened, or load saved if available
      const currentPreset = PRESET_SCENARIOS[scenario] || PRESET_SCENARIOS["Standard Launch"];
      setAwareness(currentPreset.awareness);
      setDistribution(currentPreset.distribution);
      setCompetitive(currentPreset.competitive);
      setMarketing(currentPreset.marketing);
    }
  }, [isOpen, scenario]); // Re-run if isOpen changes or scenario changes (to load preset)

  const handleScenarioChange = (newScenario: string) => {
    setScenario(newScenario);
    if (newScenario !== "Custom") {
      const preset = PRESET_SCENARIOS[newScenario];
      if (preset) {
        setAwareness(preset.awareness);
        setDistribution(preset.distribution);
        setCompetitive(preset.competitive);
        setMarketing(preset.marketing);
      }
    }
  };

  const handleSliderChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    setScenario("Custom"); 
    setter(Number(value));
  };

  const handleApply = () => {
    const currentFactors: MarketFactorSettings = { scenario, awareness, distribution, competitive, marketing };
    console.log("Applying Market Factors:", currentFactors); 
    // onApplyFactors(currentFactors);
    onClose();
  };

  const combinedEffect = Math.round((awareness + distribution + (100 - competitive) + marketing) / 4);

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay-base ${styles.modalOverlay}`}>
      <div className={`modal-content-base ${styles.modalContent}`}>
        <h2 className={styles.modalTitle}>Market Factors Configuration</h2>
        
        <div className={styles.formGroup}>
          <label htmlFor="presetScenario" className={styles.label}>Preset Scenarios:</label>
          <select 
            id="presetScenario" 
            value={scenario} 
            onChange={(e) => handleScenarioChange(e.target.value)} 
            className={styles.select}
          >
            {Object.keys(PRESET_SCENARIOS).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        {[ 
          { label: "Awareness", value: awareness, setter: setAwareness, info: "Brand recognition and reach" },
          { label: "Distribution", value: distribution, setter: setDistribution, info: "Market channel access and availability" },
          { label: "Competitive Response", value: competitive, setter: setCompetitive, info: "Strength and reaction of competitors (lower value means stronger competitive response, more challenging for you)" },
          { label: "Marketing Effectiveness", value: marketing, setter: setMarketing, info: "Impact of marketing campaigns" }
        ].map(factor => (
          <div key={factor.label} className={styles.formGroup}>
            <div className={styles.sliderLabelContainer}>
              <label htmlFor={factor.label} className={styles.label}>{factor.label}: {factor.value}%</label>
              <a href="#" onClick={(e)=> e.preventDefault()} className={`${styles.learnMoreLink} cnn-blue`} title={factor.info}>Learn More</a>
            </div>
            <input 
              type="range" 
              id={factor.label} 
              min="0" 
              max="100" 
              value={factor.value} 
              onChange={(e) => handleSliderChange(factor.setter, e.target.value)} 
              className={styles.slider}
            />
          </div>
        ))}

        <div className={styles.impactMeterContainer}>
          <h4 className={styles.impactMeterTitle}>Overall Market Impact Potential:</h4>
          <div className={styles.impactMeterBar}>
            <div className={`${styles.impactMeterFill} bg-cnn-green`} style={{width: `${combinedEffect}%`}}>
              {combinedEffect}%
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button onClick={handleApply} className={`button-base bg-cnn-red ${styles.applyButton}`}>Apply Factors</button> {/* Changed to red */}
          <button onClick={onClose} className={`button-base ${styles.cancelButton}`}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default MarketFactorsModal;
