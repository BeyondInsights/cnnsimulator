import streamlit as st
from openpyxl import load_workbook

# ── 0. PAGE CONFIG ────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="CNN News Subscription Simulator",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── 1. LOAD CUSTOM CSS (FORCED UTF-8) ────────────────────────────────────────
with open("assets/custom.css", encoding="utf-8") as f:
    st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# ── 2. HEADER: TITLE + LOGO + “Powered by BEYOND Insights” ───────────────────
c1, c2, c3 = st.columns([1, 6, 1])
with c1:
    st.write("")  # spacer
with c2:
    st.markdown(
        "<div class='app-header'>"
        "  <h1 class='app-title'>CNN News Subscription Simulator</h1>"
        "  <div class='branding'>"
        "    <img src='assets/logo.png' class='branding-logo'>"
        "    <span class='branding-text'>Powered by BEYOND Insights</span>"
        "  </div>"
        "</div>",
        unsafe_allow_html=True,
    )
with c3:
    st.write("")

st.markdown("---")


# ── 3. DATA: FEATURES, VERTICALS, BASE PRODUCTS, PRICING TABLE ────────────────
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

DISCOUNTS = [
    "Free Month / 3-Mo",
    "30% off 12-Mo Sub",
    "50% off 12-Mo Sub",
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
    """
    Returns (min_price, max_price) for the given base product
    and the number of verticals. “Standalone Vertical” forces 1 vertical.
    """
    if base_prod == "Standalone Vertical":
        key = (base_prod, 1)
    else:
        n = min(len(selected_verticals), 3)
        key = (base_prod, n)
    return PRICING_TABLE.get(key, (0.0, 0.0))


# ── 4. TOP TOOLBAR: 8 BUTTONS IN BEYOND PURPLE (GOLD ON HOVER) ───────────────
toolbar_cols = st.columns([1, 1, 1, 1, 1, 1, 1, 1, 4])
with toolbar_cols[0]:
    if st.button("🗑 Clear All", key="btn_clear"):
        for i in range(1, 7):
            st.session_state[f"base_{i}"] = "Select Base Product"
            st.session_state[f"all_{i}"] = False  # for Select All
            st.session_state[f"rf_{i}"] = []
            st.session_state[f"sf_{i}"] = []
            st.session_state[f"vert_{i}"] = []
            st.session_state[f"slider_{i}"] = None
            st.session_state[f"exclude_{i}"] = False
            st.session_state[f"discount_{i}"] = DISCOUNTS[0]
        st.experimental_rerun()
with toolbar_cols[1]:
    if st.button("📊 Set Report Type", key="btn_report"):
        st.info("Set Report Type clicked (stub)")
with toolbar_cols[2]:
    if st.button("▶️ Run Simulation", key="btn_run"):
        try:
            wb = load_workbook("cnn_simulator.xlsx")
            # … your simulation logic here …
            wb.save("cnn_simulator_out.xlsx")
            st.success("Simulation complete—download your results below.")
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
    st.write("")  # spacer

st.markdown("---")


# ── 5. SIX PRODUCT CARDS ───────────────────────────────────────────────────────
total_products = 6
cols = st.columns(total_products, gap="small")

for idx in range(total_products):
    with cols[idx]:
        slot = idx + 1

        # A) “Exclude” checkbox in top-left corner
        excluded = st.checkbox(
            "",
            key=f"exclude_{slot}",
            label_visibility="hidden",
            help="Check to exclude this product from simulation",
        )
        if excluded:
            st.markdown(
                "<div class='overlay'><span class='overlay-text'>EXCLUDED</span></div>",
                unsafe_allow_html=True,
            )

        # B) Base-product selectbox (enlarged via CSS)
        base_selection = st.selectbox(
            "",
            options=BASE_PRODUCTS,
            index=0,
            key=f"base_{slot}",
            label_visibility="collapsed",
        )

        # C) Card header: CNN Red (#cc0000) if active; gray if not
        if base_selection != "Select Base Product" and not excluded:
            header_color = "#cc0000"  # CNN Red
        else:
            header_color = "#555"  # Muted gray
        st.markdown(
            f"<div class='card-header' style='background-color:{header_color};'>"
            f"PRODUCT {slot}</div>",
            unsafe_allow_html=True,
        )

        # D) If excluded or no base, show muted prompt and skip
        if excluded or base_selection == "Select Base Product":
            st.markdown(
                "<div class='card-body-muted'>"
                "Select a base product to enable this card.</div>",
                unsafe_allow_html=True,
            )
            continue  # Skip the rest of this card

        # E) “Discount” radio buttons (Free Month/3-Mo, 30% off, 50% off)
        st.markdown("<p class='section-title'>Choose Discount</p>", unsafe_allow_html=True)
        discount_choice = st.radio(
            "",
            options=DISCOUNTS,
            index=0,
            key=f"discount_{slot}",
            label_visibility="collapsed",
        )

        # F) Feature selection with “Select All” and MultiSelect
        if base_selection == "CNN Reader":
            # “Select All” checkbox
            all_feat_key = f"all_{slot}"
            selected_reader = st.session_state.get(f"rf_{slot}", [])
            select_all_reader = st.checkbox(
                "Select All Reader Features",
                key=all_feat_key,
                label_visibility="visible",
            )
            if select_all_reader:
                st.session_state[f"rf_{slot}"] = READER_FEATURES.copy()
                selected_reader = READER_FEATURES.copy()
            else:
                # If user unchecks “Select All,” do nothing special
                pass

            st.markdown("<p class='section-title'>Reader Features</p>", unsafe_allow_html=True)
            selected_reader = st.multiselect(
                "",
                options=READER_FEATURES,
                key=f"rf_{slot}",
                default=selected_reader,
                label_visibility="collapsed",
            )

            selected_streaming = []
            st.markdown("<p class='section-title'>Verticals (0–3)</p>", unsafe_allow_html=True)

            # G) Vertical multiselect with count & max‐3 enforcement
            selected_verticals = st.multiselect(
                "",
                options=VERTICALS,
                key=f"vert_{slot}",
                default=st.session_state.get(f"vert_{slot}", []),
                label_visibility="collapsed",
            )
        elif base_selection == "CNN Streaming":
            all_feat_key = f"all_{slot}"
            selected_streaming = st.session_state.get(f"sf_{slot}", [])
            select_all_stream = st.checkbox(
                "Select All Streaming Features",
                key=all_feat_key,
                label_visibility="visible",
            )
            if select_all_stream:
                st.session_state[f"sf_{slot}"] = STREAMING_FEATURES.copy()
                selected_streaming = STREAMING_FEATURES.copy()
            else:
                pass

            st.markdown("<p class='section-title'>Streaming Features</p>", unsafe_allow_html=True)
            selected_streaming = st.multiselect(
                "",
                options=STREAMING_FEATURES,
                key=f"sf_{slot}",
                default=selected_streaming,
                label_visibility="collapsed",
            )

            selected_reader = []
            st.markdown("<p class='section-title'>Verticals (0–3)</p>", unsafe_allow_html=True)
            selected_verticals = st.multiselect(
                "",
                options=VERTICALS,
                key=f"vert_{slot}",
                default=st.session_state.get(f"vert_{slot}", []),
                label_visibility="collapsed",
            )
        elif base_selection == "CNN All Access":
            # Reader “Select All”
            all_feat_key_r = f"allR_{slot}"
            selected_reader = st.session_state.get(f"rf_{slot}", [])
            select_all_reader = st.checkbox(
                "Select All Reader Features",
                key=all_feat_key_r,
                label_visibility="visible",
            )
            if select_all_reader:
                st.session_state[f"rf_{slot}"] = READER_FEATURES.copy()
                selected_reader = READER_FEATURES.copy()

            st.markdown("<p class='section-title'>Reader Features</p>", unsafe_allow_html=True)
            selected_reader = st.multiselect(
                "",
                options=READER_FEATURES,
                key=f"rf_{slot}",
                default=selected_reader,
                label_visibility="collapsed",
            )

            # Streaming “Select All”
            all_feat_key_s = f"allS_{slot}"
            selected_streaming = st.session_state.get(f"sf_{slot}", [])
            select_all_stream = st.checkbox(
                "Select All Streaming Features",
                key=all_feat_key_s,
                label_visibility="visible",
            )
            if select_all_stream:
                st.session_state[f"sf_{slot}"] = STREAMING_FEATURES.copy()
                selected_streaming = STREAMING_FEATURES.copy()

            st.markdown("<p class='section-title'>Streaming Features</p>", unsafe_allow_html=True)
            selected_streaming = st.multiselect(
                "",
                options=STREAMING_FEATURES,
                key=f"sf_{slot}",
                default=selected_streaming,
                label_visibility="collapsed",
            )

            st.markdown("<p class='section-title'>Verticals (0–3)</p>", unsafe_allow_html=True)
            selected_verticals = st.multiselect(
                "",
                options=VERTICALS,
                key=f"vert_{slot}",
                default=st.session_state.get(f"vert_{slot}", []),
                label_visibility="collapsed",
            )
        else:
            # Standalone Vertical: just 1 dropdown
            selected_reader = []
            selected_streaming = []
            st.markdown("<p class='section-title'>Choose One Vertical</p>", unsafe_allow_html=True)
            single_vert = st.selectbox(
                "",
                options=["Select Vertical"] + VERTICALS,
                key=f"vert_{slot}",
                label_visibility="collapsed",
            )
            selected_verticals = [single_vert] if single_vert != "Select Vertical" else []

        # H) Enforce max 3 verticals and show count
        if len(selected_verticals) > 3:
            selected_verticals = selected_verticals[:3]
            st.session_state[f"vert_{slot}"] = selected_verticals
            st.warning("You can select up to 3 verticals. Extra items have been removed.")

        st.markdown(
            f"<p class='vertical-count'>{len(selected_verticals)}/3 selected</p>",
            unsafe_allow_html=True,
        )

        # ── 6. “Configure Pricing” INSIDE GOLD‐BORDERED EXPANDER ─────────────────
        min_p, max_p = get_price_range(base_selection, selected_verticals)
        if min_p and max_p:
            with st.expander("🔧 Configure Pricing"):
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
                    f"<span>${price:,.2f}/mo</span>"
                    f"<span>(${price*12:,.2f}/yr)</span></div>",
                    unsafe_allow_html=True,
                )
        else:
            st.markdown(
                "<div class='price-text-muted'>"
                "Pricing not available for this combination.</div>",
                unsafe_allow_html=True,
            )

# ── 7. FOOTER ────────────────────────────────────────────────────────────────
st.markdown("---")
st.markdown("<div class='footer'>© 2025 BEYOND Insights. All Rights Reserved.</div>", unsafe_allow_html=True)
