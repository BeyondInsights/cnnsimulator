import streamlit as st
from openpyxl import load_workbook

# ── 0. PAGE CONFIG ────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="CNN News Subscription Simulator",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── 1. CUSTOM CSS ──────────────────────────────────────────────────────────────
with open("assets/custom.css", encoding="utf-8") as f:
    st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# ── 2. TOP TOOLBAR (BUTTONS + BRANDING) ────────────────────────────────────────
# We place all eight buttons in a styled container at the top
toolbar_cols = st.columns([1, 1, 1, 1, 1, 1, 1, 1, 4])
with toolbar_cols[0]:
    if st.button("🗑 Clear All", key="btn_clear"):
        # Reset every product card’s session_state:
        for i in range(1, 7):
            st.session_state[f"base_{i}"] = "Select Base Product"
            st.session_state[f"rf_{i}"] = []
            st.session_state[f"sf_{i}"] = []
            st.session_state[f"vert_{i}"] = []
            st.session_state[f"slider_{i}"] = None
            st.session_state[f"exclude_{i}"] = False
        st.experimental_rerun()
with toolbar_cols[1]:
    if st.button("📊 Set Report Type", key="btn_report"):
        st.info("Set Report Type clicked (stub)")
with toolbar_cols[2]:
    if st.button("▶️ Run Simulation", key="btn_run"):
        try:
            wb = load_workbook("cnn_simulator.xlsx")
            # … your simulation logic goes here …
            wb.save("cnn_simulator_out.xlsx")
            st.success("Simulation complete—download below.")
            st.download_button("Download Results", "cnn_simulator_out.xlsx", key="btn_dl")
        except FileNotFoundError:
            st.error("Error: ‘cnn_simulator.xlsx’ not found.")
with toolbar_cols[3]:
    if st.button("👤 Show Profiles", key="btn_profiles"):
        st.info("Show Profiles clicked (stub)")
with toolbar_cols[4]:
    if st.button("🌎 Market Factors", key="btn_market"):
        st.info("Market Factors clicked (stub)")
with toolbar_cols[5]:
    if st.button("ℹ️ About this Model", key="btn_about"):
        st.info("About this Model clicked (stub)")
with toolbar_cols[6]:
    if st.button("🧠 Model Insights", key="btn_insights"):
        st.info("Model Insights clicked (stub)")
with toolbar_cols[7]:
    if st.button("🤖 AI Configurator", key="btn_ai"):
        st.info("AI Configurator clicked (stub)")
with toolbar_cols[8]:
    # Branding: “Powered by BEYOND Insights” with your logo
    st.markdown(
        "<div class='branding'>"
        "<img src='assets/logo.png' class='branding-logo'>"
        "<span class='branding-text'>Powered by BEYOND Insights</span>"
        "</div>",
        unsafe_allow_html=True,
    )

st.markdown("---")

# ── 3. DATA FROM NOTES (features, verticals, pricing table) ───────────────────
# Source: notes.txt :contentReference[oaicite:0]{index=0}

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

BASE_PRODUCTS = [
    "Select Base Product",
    "CNN Reader",
    "CNN Streaming",
    "CNN All Access",
    "Standalone Vertical",
]

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
    ("Standalone Vertical", 1): (1.99,  7.99),
}


def get_price_range(base_prod: str, selected_verticals: list[str]) -> tuple[float, float]:
    """Return (min_price, max_price) based on base product + # of verticals."""
    if base_prod == "Standalone Vertical":
        key = (base_prod, 1)
    else:
        n = min(len(selected_verticals), 3)
        key = (base_prod, n)
    return PRICING_TABLE.get(key, (0.0, 0.0))


# ── 4. SIX PRODUCT CARDS ───────────────────────────────────────────────────────
total_products = 6
cols = st.columns(total_products, gap="small")

for idx in range(total_products):
    with cols[idx]:
        slot = idx + 1
        # Checkbox to EXCLUDE this product from the simulation:
        excluded = st.checkbox(
            f"Exclude",
            key=f"exclude_{slot}",
            label_visibility="collapsed",
            help="Check to exclude this product from the simulation",
        )

        # Gray‐out overlay if excluded:
        if excluded:
            st.markdown(
                "<div class='overlay'>"
                "<span class='overlay-text'>EXCLUDED</span>"
                "</div>",
                unsafe_allow_html=True,
            )

        # Base‐product dropdown
        base_selection = st.selectbox(
            "",
            options=BASE_PRODUCTS,
            index=0,
            key=f"base_{slot}",
            label_visibility="collapsed",
        )

        # Card header (bold, colored once a base is selected)
        if base_selection != "Select Base Product" and not excluded:
            header_color = "#c00"
        else:
            header_color = "#555"  # darker gray for unselected/disabled
        st.markdown(
            f"<div class='card-header' style='background-color:{header_color};'>"
            f"PRODUCT {slot}</div>",
            unsafe_allow_html=True,
        )

        if excluded or base_selection == "Select Base Product":
            st.markdown(
                "<div class='card-body-muted'>"
                "Select a base product to enable.</div>",
                unsafe_allow_html=True,
            )
            continue  # skip the rest of this card

        # Depending on base_selection, show appropriate feature/vertical pickers:
        if base_selection == "CNN Reader":
            st.markdown("**Reader Features**")
            selected_reader = st.multiselect(
                " ",
                options=READER_FEATURES,
                key=f"rf_{slot}",
                label_visibility="collapsed",
            )
            selected_streaming = []
            st.markdown("**Verticals (0–3)**")
            selected_verticals = st.multiselect(
                " ",
                options=VERTICALS,
                key=f"vert_{slot}",
                label_visibility="collapsed",
            )

        elif base_selection == "CNN Streaming":
            st.markdown("**Streaming Features**")
            selected_streaming = st.multiselect(
                " ",
                options=STREAMING_FEATURES,
                key=f"sf_{slot}",
                label_visibility="collapsed",
            )
            selected_reader = []
            st.markdown("**Verticals (0–3)**")
            selected_verticals = st.multiselect(
                " ",
                options=VERTICALS,
                key=f"vert_{slot}",
                label_visibility="collapsed",
            )

        elif base_selection == "CNN All Access":
            st.markdown("**Reader Features**")
            selected_reader = st.multiselect(
                " ",
                options=READER_FEATURES,
                key=f"rf_{slot}",
                label_visibility="collapsed",
            )
            st.markdown("**Streaming Features**")
            selected_streaming = st.multiselect(
                " ",
                options=STREAMING_FEATURES,
                key=f"sf_{slot}",
                label_visibility="collapsed",
            )
            st.markdown("**Verticals (0–3)**")
            selected_verticals = st.multiselect(
                " ",
                options=VERTICALS,
                key=f"vert_{slot}",
                label_visibility="collapsed",
            )

        else:  # Standalone Vertical
            selected_reader = []
            selected_streaming = []
            st.markdown("**Choose One Vertical**")
            single_vert = st.selectbox(
                " ",
                options=["Select Vertical"] + VERTICALS,
                key=f"vert_{slot}",
                label_visibility="collapsed",
            )
            selected_verticals = [single_vert] if single_vert != "Select Vertical" else []

        # Pricing Slider
        min_p, max_p = get_price_range(base_selection, selected_verticals)
        if min_p and max_p:
            price = st.slider(
                f"${min_p:,.2f} – ${max_p:,.2f}",
                min_value=min_p,
                max_value=max_p,
                value=min_p,
                step=0.01,
                key=f"slider_{slot}",
                label_visibility="collapsed",
            )
            st.markdown(
                f"<div class='price-text'>"
                f"<span>${price:,.2f}/mo</span>   "
                f"<span>(${price*12:,.2f}/yr)</span></div>",
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                "<div class='price-text-muted'>"
                "Pricing unavailable for this combination</div>",
                unsafe_allow_html=True,
            )

# ── 5. FOOTER NOTE (Optional: show disclaimers, etc.) ──────────────────────────
st.markdown("---")
st.markdown("<div class='footer'>© 2025 BEYOND Insights. All Rights Reserved.</div>", unsafe_allow_html=True)
