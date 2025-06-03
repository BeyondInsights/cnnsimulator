import streamlit as st
import pandas as pd
import numpy as np
from openpyxl import load_workbook


# ── 1. PAGE CONFIG & CSS ─────────────────────────────────────────────────────
st.set_page_config(
    page_title="CNN News Subscription Simulator",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Inject our custom CSS (to tighten spacing, shrink padding, etc.)
with open("assets/custom.css") as f:
    st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)


# ── 2. “Welcome” HEADER (MOVED UP CLOSER TO TOP) ───────────────────────────────
col1, col2, col3 = st.columns([1, 6, 1])
with col2:
    st.image("assets/logo.png", width=120)  # Your CNN logo (replace if needed)
    st.markdown(
        "<h2 style='text-align:center; margin-top: 0.25rem;'>"
        "CNN News Subscription Simulator</h2>",
        unsafe_allow_html=True,
    )
st.markdown("---")


# ── 3. DATA FROM NOTES (features, verticals, pricing) ─────────────────────────
# Source: notes.txt :contentReference[oaicite:1]{index=1}

# 3a) Reader features (rank order)
READER_FEATURES = [
    "Podcast Club",
    "CNN Reality Check",
    "News from Local Providers",
    "AI Anchor",
    "CNN Live Events and Expert Q&A",
    "Ask CNN",
    "CNN Business & Markets Insider",
    "Bonus Subscription",
    "CNN Archive",
    "News from Global Providers",
    "CNN Technology Insider",
    "CNN You",
]

# 3b) Streaming features
STREAMING_FEATURES = [
    "Personalized Daily Video Briefing",
    "RealTime Fact Checking",
    "Live Q&A with CNN Experts",
    "CNN You Streaming",
    "Multiview",
    "Customized Local News",
    "RealTime News Ticker",
    "Live Global Feeds",
    "Original ShortForm CNN Series",
    "Exclusive Subscriber-Only Event",
    "Interactive Video Companions",
    "Live Text Commentary from CNN",
]

# 3c) Verticals (anywhere from 0–3 for Reader/Streaming/All-Access; exactly 1 if Standalone)
VERTICALS = [
    "CNN Entertainment Tracker",
    "CNN Meditation & Mindfulness",
    "CNN Personal Finance",
    "CNN Fitness",
    "CNN Expert Buying Guide",
    "CNN Weather & Natural Phenomena",
    "CNN Longevity",
    "CNN Beauty",
    "CNN Travel",
    "CNN Home",
]

# 3d) Base products
BASE_PRODUCTS = [
    "Select Base Product",
    "CNN Reader",
    "CNN Streaming",
    "CNN All Access",
    "Standalone Vertical",
]

# 3e) Pricing table: (product_key, number_of_verticals) → (min_price, max_price)
# Source: notes.txt :contentReference[oaicite:2]{index=2}
#
#         0 Vert   1 Vert    2 Vert     3 Vert
# CNN Reader    3.99–14.99  5.49–16.99  6.99–19.49   8.49–21.99
# CNN Streaming 4.99–16.99  6.49–17.99  7.99–21.49   9.49–24.99
# CNN All Access5.99–24.99  7.99–25.99  9.99–30.49  11.99–34.99
# Standalone:    1.99–7.99   (always 1 vertical)
#
PRICING_TABLE = {
    ("CNN Reader",       0): (3.99, 14.99),
    ("CNN Reader",       1): (5.49, 16.99),
    ("CNN Reader",       2): (6.99, 19.49),
    ("CNN Reader",       3): (8.49, 21.99),
    ("CNN Streaming",    0): (4.99, 16.99),
    ("CNN Streaming",    1): (6.49, 17.99),
    ("CNN Streaming",    2): (7.99, 21.49),
    ("CNN Streaming",    3): (9.49, 24.99),
    ("CNN All Access",   0): (5.99, 24.99),
    ("CNN All Access",   1): (7.99, 25.99),
    ("CNN All Access",   2): (9.99, 30.49),
    ("CNN All Access",   3): (11.99, 34.99),
    # Standalone vertical: we force “vertical_count = 1” internally
    ("Standalone Vertical", 1): (1.99, 7.99),
}


# ── 4. HELPER: GET PRICE RANGE BASED ON (product, #verticals) ──────────────────
def get_price_range(base_prod: str, selected_verticals: list[str]) -> tuple[float, float]:
    """
    Returns (min_price, max_price) based on the selected base product
    and the number of verticals. If Standalone Vertical, we treat as 1 vertical.
    """
    if base_prod == "Standalone Vertical":
        key = (base_prod, 1)
    else:
        # cap at 3 verticals (anything >3 uses the 3-vertical pricing)
        n = min(len(selected_verticals), 3)
        key = (base_prod, n)

    return PRICING_TABLE.get(key, (0.0, 0.0))  # (0,0) if no valid price (e.g., no base selected)


# ── 5. PRODUCT CARDS (SIX SLOTS) ────────────────────────────────────────────────
total_products = 6
cols = st.columns(total_products, gap="small")

for idx in range(total_products):
    with cols[idx]:
        product_slot = idx + 1  # because idx is 0-based, slots are 1-based

        # (a) Dropdown to choose base product
        base_selection = st.selectbox(
            f"",  # hide the label (we’ll show “PRODUCT X” in the header)
            options=BASE_PRODUCTS,
            index=0,
            key=f"base_{product_slot}",
            label_visibility="collapsed",
        )

        # (b) Card Header: “PRODUCT 1”, “PRODUCT 2”, etc., turns RED if a valid base is chosen
        header_color = "#c00" if base_selection != "Select Base Product" else "#e0e0e0"
        st.markdown(
            f"<div class='product-header' style='background-color:{header_color}; "
            "border-radius:5px; text-align:center; color:white;'>"
            f"PRODUCT {product_slot}</div>",
            unsafe_allow_html=True,
        )

        # (c) Conditional Feature & Vertical Pickers
        if base_selection == "CNN Reader":
            # Show Reader features:
            st.markdown("**Reader Features (select any)**")
            selected_reader = st.multiselect(
                "",
                options=READER_FEATURES,
                key=f"rf_{product_slot}",
                label_visibility="collapsed",
            )
            # No streaming features for CNN Reader
            selected_streaming = []

            # Vertical picker (0–3):
            st.markdown("**Verticals (0–3)**")
            selected_verticals = st.multiselect(
                "",
                options=VERTICALS,
                key=f"vert_{product_slot}",
                label_visibility="collapsed",
            )

        elif base_selection == "CNN Streaming":
            # Show Streaming features:
            st.markdown("**Streaming Features (select any)**")
            selected_streaming = st.multiselect(
                "",
                options=STREAMING_FEATURES,
                key=f"sf_{product_slot}",
                label_visibility="collapsed",
            )
            # No reader features for streaming
            selected_reader = []

            # Vertical picker (0–3):
            st.markdown("**Verticals (0–3)**")
            selected_verticals = st.multiselect(
                "",
                options=VERTICALS,
                key=f"vert_{product_slot}",
                label_visibility="collapsed",
            )

        elif base_selection == "CNN All Access":
            # Show both Reader and Streaming feature lists:
            st.markdown("**Reader Features (select any)**")
            selected_reader = st.multiselect(
                "",
                options=READER_FEATURES,
                key=f"rf_{product_slot}",
                label_visibility="collapsed",
            )
            st.markdown("**Streaming Features (select any)**")
            selected_streaming = st.multiselect(
                "",
                options=STREAMING_FEATURES,
                key=f"sf_{product_slot}",
                label_visibility="collapsed",
            )

            # Vertical picker (0–3):
            st.markdown("**Verticals (0–3)**")
            selected_verticals = st.multiselect(
                "",
                options=VERTICALS,
                key=f"vert_{product_slot}",
                label_visibility="collapsed",
            )

        elif base_selection == "Standalone Vertical":
            # No multiple features—only pick exactly **one** vertical:
            selected_reader = []
            selected_streaming = []

            st.markdown("**Choose a Single Vertical**")
            single_vert = st.selectbox(
                "",
                options=["Select Vertical"] + VERTICALS,
                key=f"vert_{product_slot}",
                label_visibility="collapsed",
            )
            # If they chose a valid vertical, wrap in a 1-element list; else empty
            selected_verticals = [single_vert] if single_vert != "Select Vertical" else []

        else:
            # “Select Base Product” or unrecognized
            selected_reader = []
            selected_streaming = []
            selected_verticals = []

        # (d) Pricing slider (min/max depend on base + #verticals)
        if base_selection != "Select Base Product":
            min_price, max_price = get_price_range(base_selection, selected_verticals)
            if min_price > 0 and max_price > 0:
                price = st.slider(
                    f"${min_price:,.2f} – ${max_price:,.2f}",
                    min_value=min_price,
                    max_value=max_price,
                    value=min_price,
                    step=0.01,
                    key=f"slider_{product_slot}",
                    label_visibility="collapsed",
                )
                st.markdown(
                    f"**${price:,.2f}/mo**\n**Annual (${'{:,}'.format(int(price*12))})**",
                    unsafe_allow_html=True,
                )
            else:
                st.markdown("*Pricing not available for this combination*", unsafe_allow_html=True)
        else:
            st.markdown("*Set base product to see pricing*", unsafe_allow_html=True)


# ── 6. CONTROL BAR (ALL 8 BUTTONS) ───────────────────────────────────────────────
st.markdown("---")
btn_cols = st.columns(8, gap="small")
with btn_cols[0]:
    if st.button("🗑 Clear All"):
        # Reset every session_state value we created above
        for i in range(1, total_products + 1):
            st.session_state[f"base_{i}"] = "Select Base Product"
            st.session_state[f"rf_{i}"] = []
            st.session_state[f"sf_{i}"] = []
            st.session_state[f"vert_{i}"] = []
            st.session_state[f"slider_{i}"] = None
        st.experimental_rerun()  # refresh everything

with btn_cols[1]:
    if st.button("📊 Set Report Type"):
        st.info("Set Report Type clicked (stub)")

with btn_cols[2]:
    if st.button("▶️ Run Simulation"):
        st.write("Running simulation logic…")
        # Example logic: read cnn_simulator.xlsx (if it exists), do your math, then save
        try:
            wb = load_workbook("cnn_simulator.xlsx")
            # … insert real simulation logic here …
            wb.save("cnn_simulator_out.xlsx")
            st.success("Simulation complete—download the results below.")
            st.download_button("Download Model Output", "cnn_simulator_out.xlsx")
        except FileNotFoundError:
            st.error("Error: ‘cnn_simulator.xlsx’ not found in working directory.")

with btn_cols[3]:
    if st.button("👤 Show Profiles"):
        st.info("Show Profiles clicked (stub)")

with btn_cols[4]:
    if st.button("🌎 Market Factors"):
        st.info("Market Factors clicked (stub)")

with btn_cols[5]:
    if st.button("ℹ️ About this Model"):
        st.info("About this Model clicked (stub)")

with btn_cols[6]:
    if st.button("🧠 Model Insights"):
        st.info("Model Insights clicked (stub)")

with btn_cols[7]:
    if st.button("🤖 AI Configurator"):
        st.info("AI Configurator clicked (stub)")
