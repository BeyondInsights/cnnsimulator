"use client";
import React from "react";

export default function MarketRealizationModal({
  visible, factors, baseRate, updateFactor, calcStep, onClose, onApply
}: {
  visible: boolean;
  factors: Record<string,number>;
  baseRate: number;
  updateFactor: (k:string,v:number)=>void;
  calcStep: (k:string)=>number;
  onClose: ()=>void;
  onApply: ()=>void;
}) {
  if (!visible) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Market Realization Settings</h2>
        {Object.entries(factors).map(([k,v]) => (
          <div key={k} style={{ margin: "1rem 0" }}>
            <label>{k}</label>
            <input type="range" min={0} max={100} value={v}
              onChange={e => updateFactor(k,+e.target.value)} />
            <span>{v}%</span>
          </div>
        ))}
        <div className="modal-buttons">
          <button onClick={onApply} className="modal-add">Apply</button>
          <button onClick={onClose} className="modal-cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
}
