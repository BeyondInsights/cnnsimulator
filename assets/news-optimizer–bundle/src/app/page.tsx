"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// ─── Import actions (file lives at src/app/actions.ts) ────────────────────────
import {
  runServerSimulation,
  getProductProfile,
  runPriceSensitivityAnalysis,
} from "./actions";

// ─── Import types (file lives at src/lib/types.ts) ────────────────────────────
import type {
  ProductConfig,
  ReportData,
  ReportType,
  OutputType,
  ProductProfileData,
  SensitivityPoint,
  MarketFactors,
  SimulationInput,
  SimulationResult,
} from "../lib/types";

// ─── Import static JSON lookups (files live under src/data/) ───────────────────
import coreProductDescriptionsData from "../data/coreProductDescriptions.json";
import readerFeatureDescriptionsData from "../data/readerFeatureDescriptions.json";
import streamingFeatureDescriptionsData from "../data/streamingFeatureDescriptions.json";
import verticalDescriptionsData from "../data/verticalDescriptions.json";
import attributeImportanceSample from "../data/attributeImportance.json";
import partWorthUtilitiesSample from "../data/partWorthUtilities.json";

// ─── Import your top‐level components (files live under src/components/) ─────────
import ProductCard from "../components/ProductCard";

// ─── Import UI primitives (files live under src/components/ui/) ───────────────
// We only import what we actually use below:
import PricingConfig from "../components/ui/PricingConfig";
import Slider from "../components/ui/slider";

// ─── Import your modals (files live under src/components/modals/) ──────────────
import ReviewFeaturesModal from "../components/modals/ReviewFeaturesModal";
import MarketFactorsModal from "../components/modals/MarketFactorsModal";
import MarketRealizationModal from "../components/modals/MarketRealizationModal";
import CustomAlertModal from "../components/modals/CustomAlertModal";

// ─── Import global CSS (file lives at src/styles/globals.css) ──────────────────
import "../styles/globals.css";

// ─── Allowed emails for access ─────────────────────────────────────────────────
const ALLOWED_EMAILS = ["admin@beyondinsights.com", "client@cnn.com"];

// ─── Define initial card configurations (8 products) ───────────────────────────
const INITIAL_PRODUCT_CONFIGS: ProductConfig[] = [
  { productId: "cnn_reader", name: "CNN Reader" },
  { productId: "cnn_premium", name: "CNN Premium" },
  { productId: "cnn_plus", name: "CNN+", defaultTier: "Moderate" },
  { productId: "cnn_stream", name: "CNN Streaming" },
  { productId: "cnn_newswire", name: "CNN Newswire" },
  { productId: "cnn_audio", name: "CNN Audio" },
  { productId: "cnn_local", name: "CNN Local" },
  { productId: "cnn_insider", name: "CNN Insider" },
];

// ─── Default market‐factor values ───────────────────────────────────────────────
const INITIAL_MARKET_FACTORS: MarketFactors = {
  awareness: 70,
  distribution: 85,
  competitive: 90,
  marketing: 80,
};

export default function SimulatorPage() {
  // ─── 1. LOADING & AUTH (EMAIL) ────────────────────────────────────────────────
  const [emailInput, setEmailInput] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showEmailAlert, setShowEmailAlert] = useState(false);

  const handleEmailSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (ALLOWED_EMAILS.includes(emailInput.trim().toLowerCase())) {
      setIsAuthorized(true);
    } else {
      setShowEmailAlert(true);
    }
  };

  // ─── 2. FETCH LARGE JSONS ON MOUNT ─────────────────────────────────────────────
  const [fullRespondentData, setFullRespondentData] = useState<any[]>([]);
  const [fullRespondentUtils, setFullRespondentUtils] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthorized) return;

    // Fetch respondentData.json from public/data/respondentData.json
    fetch("/data/respondentData.json")
      .then((res) => res.json())
      .then((data) => setFullRespondentData(data))
      .catch((e) => console.error("Error loading respondentData.json:", e));

    // Fetch respondentUtilities.json from public/data/respondentUtilities.json
    fetch("/data/respondentUtilities.json")
      .then((res) => res.json())
      .then((data) => setFullRespondentUtils(data))
      .catch((e) => console.error("Error loading respondentUtilities.json:", e));
  }, [isAuthorized]);

  // ─── 3. PRODUCT CARDS STATE ───────────────────────────────────────────────────
  const [productConfigs, setProductConfigs] = useState<ProductConfig[]>(
    INITIAL_PRODUCT_CONFIGS.map((cfg) => ({
      ...cfg,
      chosenTier: cfg.defaultTier || "Moderate",
      chosenFeatures: cfg.defaultFeatures || [],
      sensitivityPoints: [] as SensitivityPoint[],
      monthlyRate: 10,
      pricingType: "monthly",
      discount: "",
      verticals: [],
    }))
  );

  const updateProductCard = (
    productId: string,
    updated: Partial<ProductConfig>
  ) =>
    setProductConfigs((prev) =>
      prev.map((pc) => (pc.productId === productId ? { ...pc, ...updated } : pc))
    );

  // ─── 4. MARKET FACTOR MODAL STATE ──────────────────────────────────────────────
  const [marketFactors, setMarketFactors] =
    useState<MarketFactors>(INITIAL_MARKET_FACTORS);
  const [
    infoModalForFactor,
    setInfoModalForFactor,
  ] = useState<keyof MarketFactors | null>(null);

  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  const handleFactorChange = (factorKey: keyof MarketFactors, newVal: number) => {
    setMarketFactors((prev) => ({
      ...prev,
      [factorKey]: newVal,
    }));
  };

  // ─── 5. SIMULATION RESULTS STATE ──────────────────────────────────────────────
  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const handleRunSimulation = async () => {
    const inputs: SimulationInput[] = productConfigs.map((cfg) => ({
      productId: cfg.productId,
      chosenTier: cfg.chosenTier!,
      chosenFeatures: cfg.chosenFeatures || [],
    }));
    try {
      const result = await runServerSimulation(inputs);
      setSimulationResult(result);
      setShowResultModal(true);
    } catch (err) {
      console.error("Simulation error:", err);
      setShowResultModal(false);
      setShowEmailAlert(true);
    }
  };

  // ─── 6. FEATURE‐REVIEW MODAL STATE ────────────────────────────────────────────
  const [featuresModalFor, setFeaturesModalFor] = useState<string | null>(null);

  // ─── 7. CUSTOM ALERT MODAL STATE ──────────────────────────────────────────────
  type AlertType = "alert" | "confirm";
  interface AlertState {
    title: string;
    message: string;
    type: AlertType;
    onConfirm?: () => void;
  }
  const [customAlert, setCustomAlert] = useState<AlertState | null>(null);
  const closeCustomAlert = () => setCustomAlert(null);

  // ─── 8. RENDER ─────────────────────────────────────────────────────────────────
  if (!isAuthorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleEmailSubmit}
          className="bg-white p-8 rounded shadow-md w-96"
        >
          <h2 className="text-2xl font-semibold mb-4">
            Enter your work email
          </h2>
          <input
            type="email"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="you@yourcompany.com"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>
        {showEmailAlert && (
          <CustomAlertModal
            title="Access Denied"
            message="That email is not on our approved list."
            type="alert"
            onConfirm={closeCustomAlert}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6">
        {/* ─── HEADER & NAV ───────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-6">
          <Link href="/">
            <img src="/logo.svg" alt="CNN Logo" className="h-10" />
          </Link>
          <h1 className="text-3xl font-bold">CNN Product Simulator</h1>
          <button
            onClick={() => setIsAuthorized(false)}
            className="text-sm text-red-600 hover:underline"
          >
            Sign Out
          </button>
        </header>

        <nav className="flex space-x-4 mb-8">
          <button
            onClick={() => setShowResultModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Show Last Results
          </button>
          <button
            onClick={() => setIsPresetModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Preset Scenarios
          </button>
          <button
            onClick={() => setShowResultModal(false)}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Clear Results
          </button>
        </nav>

        {/* ─── PRODUCT CARDS GRID ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {productConfigs.map((cfg) => (
            <ProductCard
              key={cfg.productId}
              productId={cfg.productId}
              name={cfg.name}
              defaultTier={cfg.chosenTier!}
              defaultFeatures={cfg.chosenFeatures!}
              onTierChange={(newTier) =>
                updateProductCard(cfg.productId, { chosenTier: newTier })
              }
              onReviewFeatures={() => setFeaturesModalFor(cfg.productId)}
              utilityData={fullRespondentUtils}
            >
              {/* ─── Product‐level pricing UI ────────────────────────── */}
              <PricingConfig
                productConfig={cfg}
                onUpdate={(updates) => updateProductCard(cfg.productId, updates)}
              />
            </ProductCard>
          ))}
        </div>

        {/* ─── RUN SIMULATION BUTTON ─────────────────────────────────── */}
        <div className="flex justify-center mt-10">
          <button
            onClick={handleRunSimulation}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded shadow-lg"
          >
            Run Simulation
          </button>
        </div>

        {/* ─── MARKET FACTORS SLIDERS & INFO ICONS ────────────────────── */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">Market Factors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(marketFactors) as (keyof MarketFactors)[]).map(
              (factorKey) => (
                <div key={factorKey} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="text-sm capitalize">
                      {factorKey}
                    </label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[marketFactors[factorKey]]}
                      onValueChange={(val) =>
                        handleFactorChange(factorKey, val[0])
                      }
                      className="mt-1"
                    />
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>0</span>
                      <span>100</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setInfoModalForFactor(factorKey)}
                    className="text-gray-500 hover:text-gray-700"
                    title="What is this?"
                  >
                    ℹ️
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ─── MODALS ────────────────────────────────────────────────────────── */}

      {/* Market Realization (Results) Modal */}
      {showResultModal && simulationResult && (
        <MarketRealizationModal
          visible={showResultModal}
          result={simulationResult}
          onClose={() => setShowResultModal(false)}
        />
      )}

      {/* Market Factor “Info” Modal */}
      {infoModalForFactor && (
        <MarketFactorsModal
          visible={!!infoModalForFactor}
          factorKey={infoModalForFactor}
          definition={verticalDescriptionsData[infoModalForFactor].definition}
          guidance={verticalDescriptionsData[infoModalForFactor].guidance}
          onClose={() => setInfoModalForFactor(null)}
        />
      )}

      {/* Review Features Modal (per product) */}
      {featuresModalFor && (
        <ReviewFeaturesModal
          visible={!!featuresModalFor}
          productId={featuresModalFor}
          availableFeatures={Object.keys(verticalDescriptionsData)}
          selectedFeatures={
            productConfigs.find((c) => c.productId === featuresModalFor)!
              .chosenFeatures
          }
          onToggleFeature={(feat: string) => {
            const current = productConfigs.find(
              (c) => c.productId === featuresModalFor
            )!.chosenFeatures;
            const isOn = current.includes(feat);
            const updated = isOn
              ? current.filter((f) => f !== feat)
              : [...current, feat];
            updateProductCard(featuresModalFor, { chosenFeatures: updated });
          }}
          onSelectAll={() => {
            const allKeys = Object.keys(verticalDescriptionsData);
            updateProductCard(featuresModalFor, { chosenFeatures: allKeys });
          }}
          onAddFeatures={() => setFeaturesModalFor(null)}
          onClose={() => setFeaturesModalFor(null)}
        />
      )}

      {/* Preset Scenarios “info” modal */}
      {isPresetModalOpen && (
        <CustomAlertModal
          title="Preset Scenarios"
          message="Here you could show predefined market‐factor packs."
          type="alert"
          onConfirm={() => setIsPresetModalOpen(false)}
        />
      )}

      {/* Custom Alert Dialog */}
      {customAlert && (
        <CustomAlertModal
          title={customAlert.title}
          message={customAlert.message}
          type={customAlert.type}
          onConfirm={() => {
            if (customAlert.onConfirm) customAlert.onConfirm();
            closeCustomAlert();
          }}
        />
      )}
    </>
  );
}
