"use client";

import React, { useState, useEffect } from "react";
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

// ─── Import your top‐level components (files live under src/components/) ─────────
import ProductCard from "../components/ProductCard";

// ─── Import UI primitives (files live under src/components/ui/) ───────────────
// We only import what we actually use below:
import PricingConfig from "../components/ui/PricingConfig";
import Slider from "../components/ui/Slider";
import ProductCardContainer from "../components/ui/ProductCardContainer";

// ─── Import your modals (files live under src/components/modals/) ──────────────
import ReviewFeaturesModal from "../components/modals/ReviewFeaturesModal";
import ReviewVerticalsModal from "../components/modals/ReviewVerticalsModal";
import MarketFactorsModal from "../components/modals/MarketFactorsModal";
import MarketRealizationModal from "../components/modals/MarketRealizationModal";
import SetReportTypeModal from "../components/modals/SetReportTypeModal";
import AboutModelModal from "../components/modals/AboutModelModal";
import AiConfiguratorModal from "../components/modals/AiConfiguratorModal";
import FeatureModal from "../components/modals/FeatureModal";
import FeatureSelectionModal from "../components/modals/FeatureSelectionModal";
import ModelInsightsModal from "../components/modals/ModelInsightsModal";
import TamDetailsModal from "../components/modals/TamDetailsModal";

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

  // ─── 2. FETCH JSON DATA AT RUNTIME (FROM public/data/) ──────────────────────────
  const [coreProductDescriptionsData, setCoreProductDescriptionsData] = useState<any>(null);
  const [readerFeatureDescriptionsData, setReaderFeatureDescriptionsData] = useState<any>(null);
  const [streamingFeatureDescriptionsData, setStreamingFeatureDescriptionsData] = useState<any>(null);
  const [verticalDescriptionsData, setVerticalDescriptionsData] = useState<any>(null);
  const [attributeImportanceSample, setAttributeImportanceSample] = useState<any>(null);
  const [partWorthUtilitiesSample, setPartWorthUtilitiesSample] = useState<any>(null);

  useEffect(() => {
    if (!isAuthorized) return;

    // Helper to fetch JSON by URL and store in state under the given setter
    const fetchJson = async (url: string, setter: (data: any) => void) => {
      try {
        const resp = await fetch(url);
        const json = await resp.json();
        setter(json);
      } catch (e) {
        console.error(`Error loading ${url}:`, e);
      }
    };

    // Fetch each JSON file (all under public/data/)
    fetchJson("/data/coreProductDescriptions.json", setCoreProductDescriptionsData);
    fetchJson("/data/readerFeatureDescriptions.json", setReaderFeatureDescriptionsData);
    fetchJson("/data/streamingFeatureDescriptions.json", setStreamingFeatureDescriptionsData);
    fetchJson("/data/verticalDescriptions.json", setVerticalDescriptionsData);
    fetchJson("/data/attributeImportance.json", setAttributeImportanceSample);
    fetchJson("/data/partWorthUtilities.json", setPartWorthUtilitiesSample);
  }, [isAuthorized]);

  // ─── 3. PRODUCT CARDS STATE ───────────────────────────────────────────────────
  const [productConfigs, setProductConfigs] = useState<ProductConfig[]>(
    INITIAL_PRODUCT_CONFIGS.map((cfg) => ({
      ...cfg,
      chosenTier: cfg.defaultTier || "Moderate",
      chosenFeatures: cfg.defaultFeatures || [],
      chosenVerticals: [],           // new: track selected verticals
      sensitivityPoints: [] as SensitivityPoint[],
      monthlyRate: 10,
      pricingType: "monthly",
      discount: "",
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

  const [showReportTypeModal, setShowReportTypeModal] = useState(false);

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
      chosenVerticals: cfg.chosenVerticals || [],
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

  // ─── 6. FEATURE‐REVIEW & VERTICAL‐REVIEW MODAL STATE ──────────────────────────
  const [featuresModalFor, setFeaturesModalFor] = useState<string | null>(null);
  const [verticalsModalFor, setVerticalsModalFor] = useState<string | null>(null);

  // ─── 7. “ABOUT” and “AI CONFIGURATOR” MODAL STATE ─────────────────────────────
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAiConfigurator, setShowAiConfigurator] = useState(false);

  // ─── 8. “FEATURE SELECTION” MODAL STATE (for deeper selection flows) ──────────
  const [showFeatureSelectModal, setShowFeatureSelectModal] = useState(false);

  // ─── 9. MODEL INSIGHTS & TAM DETAILS MODAL STATE ─────────────────────────────
  const [showModelInsightsModal, setShowModelInsightsModal] = useState(false);
  const [showTamDetailsModal, setShowTamDetailsModal] = useState(false);

  // ─── 10. RENDER ─────────────────────────────────────────────────────────────────
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
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="mb-4">That email is not on our approved list.</p>
              <button
                onClick={() => setShowEmailAlert(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Only render the main UI once all JSON lookups have loaded
  const allJsonLoaded =
    coreProductDescriptionsData &&
    readerFeatureDescriptionsData &&
    streamingFeatureDescriptionsData &&
    verticalDescriptionsData &&
    attributeImportanceSample &&
    partWorthUtilitiesSample;

  if (!allJsonLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading data…</p>
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
          <div className="space-x-4">
            <button
              onClick={() => setShowAboutModal(true)}
              className="text-sm text-gray-700 hover:underline"
            >
              About
            </button>
            <button
              onClick={() => setIsAuthorized(false)}
              className="text-sm text-red-600 hover:underline"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* ─── TOOLBAR BUTTONS ────────────────────────────────────────────── */}
        <nav className="flex space-x-4 mb-8">
          <button
            onClick={() => setShowResultModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Show Last Results
          </button>
          <button
            onClick={() => setShowReportTypeModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Set Report Type
          </button>
          <button
            onClick={() => setShowResultModal(false)}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Clear Results
          </button>
          <button
            onClick={() => setShowModelInsightsModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Model Insights
          </button>
          <button
            onClick={() => setShowAiConfigurator(true)}
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
          >
            AI Configurator
          </button>
        </nav>

        {/* ─── PRODUCT CARDS GRID ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {productConfigs.map((cfg) => (
            <ProductCard key={cfg.productId} {...cfg}>
              <PricingConfig
                productConfig={cfg}
                onUpdate={(updates) => updateProductCard(cfg.productId, updates)}
              />
              <button
                onClick={() => setFeaturesModalFor(cfg.productId)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Review Features
              </button>
              <button
                onClick={() => setVerticalsModalFor(cfg.productId)}
                className="mt-1 text-sm text-blue-600 hover:underline"
              >
                Review Verticals
              </button>
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
                    <label className="text-sm capitalize">{factorKey}</label>
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
                    <div className="text-xs text-gray-500 flex justify-between">
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

      {/* 1) Market Realization (Results) Modal */}
      {showResultModal && simulationResult && (
        <MarketRealizationModal
          visible={showResultModal}
          result={simulationResult}
          onClose={() => setShowResultModal(false)}
        />
      )}

      {/* 2) Market Factor “Info” Modal */}
      {infoModalForFactor && (
        <MarketFactorsModal
          visible={!!infoModalForFactor}
          factorKey={infoModalForFactor}
          definition={verticalDescriptionsData[infoModalForFactor].definition}
          guidance={verticalDescriptionsData[infoModalForFactor].guidance}
          onClose={() => setInfoModalForFactor(null)}
        />
      )}

      {/* 3) Review Features Modal (per product) */}
      {featuresModalFor && (
        <ReviewFeaturesModal
          visible={!!featuresModalFor}
          productId={featuresModalFor}
          availableFeatures={Object.keys(readerFeatureDescriptionsData)}
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
            const allKeys = Object.keys(readerFeatureDescriptionsData);
            updateProductCard(featuresModalFor, { chosenFeatures: allKeys });
          }}
          onAddFeatures={() => setFeaturesModalFor(null)}
          onClose={() => setFeaturesModalFor(null)}
        />
      )}

      {/* 4) Review Verticals Modal (per product) */}
      {verticalsModalFor && (
        <ReviewVerticalsModal
          visible={!!verticalsModalFor}
          productId={verticalsModalFor}
          availableVerticals={Object.keys(verticalDescriptionsData)}
          selectedVerticals={
            productConfigs.find((c) => c.productId === verticalsModalFor)!
              .chosenVerticals
          }
          onToggleVertical={(vert: string) => {
            const current = productConfigs.find(
              (c) => c.productId === verticalsModalFor
            )!.chosenVerticals;
            const isOn = current.includes(vert);
            const updated = isOn
              ? current.filter((v) => v !== vert)
              : [...current, vert];
            updateProductCard(verticalsModalFor, { chosenVerticals: updated });
          }}
          onSelectAll={() => {
            const allKeys = Object.keys(verticalDescriptionsData);
            updateProductCard(verticalsModalFor, { chosenVerticals: allKeys });
          }}
          onAddVerticals={() => setVerticalsModalFor(null)}
          onClose={() => setVerticalsModalFor(null)}
        />
      )}

      {/* 5) Set Report Type Modal */}
      {showReportTypeModal && (
        <SetReportTypeModal
          visible={showReportTypeModal}
          onClose={() => setShowReportTypeModal(false)}
        />
      )}

      {/* 6) About Model Modal */}
      {showAboutModal && (
        <AboutModelModal
          visible={showAboutModal}
          onClose={() => setShowAboutModal(false)}
        />
      )}

      {/* 7) AI Configurator Modal */}
      {showAiConfigurator && (
        <AiConfiguratorModal
          visible={showAiConfigurator}
          onClose={() => setShowAiConfigurator(false)}
        />
      )}

      {/* 8) Feature Selection Modal (nested flow/example) */}
      {showFeatureSelectModal && (
        <FeatureSelectionModal
          visible={showFeatureSelectModal}
          onClose={() => setShowFeatureSelectModal(false)}
        />
      )}

      {/* 9) Model Insights Modal */}
      {showModelInsightsModal && (
        <ModelInsightsModal
          visible={showModelInsightsModal}
          onClose={() => setShowModelInsightsModal(false)}
        />
      )}

      {/* 10) TAM Details Modal */}
      {showTamDetailsModal && (
        <TamDetailsModal
          visible={showTamDetailsModal}
          onClose={() => setShowTamDetailsModal(false)}
        />
      )}
    </>
  );
}
