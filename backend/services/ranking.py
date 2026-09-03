"""
There's no single reliable "country" field across YouTube/Telegram,
so we classify a post as India-related using a combination of signals:

1. Explicit metadata (YouTube regionCode, known Indian Telegram channels / YouTube channels)
2. Keyword matching against an India-related term list (states, cities, leaders, orgs, media)
3. Indic script detection (Devanagari, Bengali, Tamil, Telugu, Gurmukhi, Gujarati, etc.)

This is a heuristic, not a guarantee — tune the keyword lists below for
your use case (e.g. add more regional languages, cities, teams).
"""
import re
from typing import Iterable

INDIA_KEYWORDS = {
    # Country & national identity
    "india", "indian", "bharat", "bharatiya", "hindustan", "hindustani", "desi",
    # Currency & economy
    "rupee", "₹", "inr", "rbi", "sebi", "upi", "aadhaar", "startup india", "make in india",
    # Science, space & technology
    "isro", "drdo", "chandrayaan", "gaganyaan", "mangalyaan",
    # Institutions, agencies & education
    "bcci", "ipl", "aiims", "iit", "iim", "lic", "sbi", "reliance", "jio", "tata",
    "adani", "infosys", "wipro", "tcs", "zomato", "swiggy", "paytm",
    # Political leaders, parties & governance
    "lok sabha", "rajya sabha", "vidhan sabha", "sansad", "modi", "narendra modi",
    "pm modi", "bjp", "congress party", "inc india", "rahul gandhi", "amit shah",
    "yogi adityanath", "kejriwal", "arvind kejriwal", "aap", "trinamool", "dmk",
    "nda", "upa", "eci", "election commission of india", "supreme court of india",
    "high court", "constitution of india",
    # Defense & armed forces
    "indian army", "indian navy", "indian air force", "iaf", "crpf", "bsf",
    # States & Union Territories
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh", "goa",
    "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka", "kerala",
    "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland",
    "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu", "telangana", "tripura",
    "uttar pradesh", "uttarakhand", "west bengal", "delhi", "jammu", "kashmir",
    "ladakh", "puducherry", "chandigarh",
    # Major Cities & Regions
    "mumbai", "bengaluru", "bangalore", "kolkata", "chennai", "hyderabad", "pune",
    "ahmedabad", "jaipur", "lucknow", "kanpur", "nagpur", "indore", "thane",
    "bhopal", "visakhapatnam", "patna", "vadodara", "ghaziabad", "ludhiana",
    "agra", "nashik", "faridabad", "meerut", "rajkot", "varanasi", "srinagar",
    "aurangabad", "dhanbad", "amritsar", "navi mumbai", "allahabad", "prayagraj",
    "ranchi", "howrah", "coimbatore", "jabalpur", "gwalior", "vijayawada",
    "jodhpur", "madurai", "raipur", "kota", "guwahati", "noida", "gurgaon",
    "gurugram", "ayodhya",
    # Culture, entertainment & sports
    "bollywood", "tollywood", "kollywood", "sandalwood", "team india",
    "virat kohli", "rohit sharma", "ms dhoni", "hardik pandya", "shubman gill",
    "jasprit bumrah",
    # Prominent Indian media & news channels
    "ndtv", "aaj tak", "aajtak", "india today", "republic bharat", "republic world",
    "abp news", "abp live", "zee news", "zee business", "times now", "cnn-news18",
    "news18", "wion", "dd news", "sansad tv", "the lallantop", "lallantop",
    "the print", "theprint", "the wire", "firstpost", "hindustan times",
    "times of india", "the hindu", "indian express", "livemint", "moneycontrol",
    "cricbuzz", "espncricinfo", "ani news", "press trust of india", "pti",
}

INDIAN_TELEGRAM_CHANNELS = {
    # Public Telegram channel usernames (without @) known to be India-focused
    "ndtv", "aajtakofficial", "aajtak", "indiatoday", "republicbharat",
    "abpnewshindi", "zeenews", "zeenewshindi", "espncricinfo", "cricbuzz",
    "hindustantimes", "theprintindia", "timesofindia", "livemint", "moneycontrolcom",
}

# Regex covering Indic scripts:
# Devanagari (0900-097F), Bengali/Assamese (0980-09FF), Gurmukhi (0A00-0A7F),
# Gujarati (0A80-0AFF), Oriya (0B00-0B7F), Tamil (0B80-0BFF),
# Telugu (0C00-0C7F), Kannada (0C80-0CFF), Malayalam (0D00-0D7F)
_INDIC_SCRIPTS_RE = re.compile(r"[\u0900-\u0D7F]")


def _text_has_india_keyword(text: str) -> bool:
    lowered = text.lower()
    return any(kw in lowered for kw in INDIA_KEYWORDS)


def is_india_related(
    title: str,
    snippet: str = "",
    channel_username: str = "",
    region_code: str = "",
) -> bool:
    if region_code and region_code.upper() == "IN":
        return True

    channel_clean = (channel_username or "").lower().lstrip("@").strip()
    if channel_clean and channel_clean in INDIAN_TELEGRAM_CHANNELS:
        return True

    # Combine text including channel/author name
    combined_text = f"{title} {snippet} {channel_username}"

    if _INDIC_SCRIPTS_RE.search(combined_text):
        return True
    if _text_has_india_keyword(combined_text):
        return True

    return False


def split_india_first(posts: Iterable[dict]):
    """Split a list of post-dicts (each must have 'is_india') into (india, others)."""
    india, others = [], []
    for p in posts:
        (india if p["is_india"] else others).append(p)
    return india, others
