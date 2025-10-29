import json
import re
from typing import List, Dict, Tuple

# Frequency and negation helpers
FREQ_KEYWORDS = {
    3: [r"\bdaily\b", r"\bevery day\b", r"\balways\b", r"\bconstant\b", r"\bconstantly\b", r"\bnearly every day\b"],
    2: [r"\boften\b", r"\bmost days\b", r"\bfrequently\b", r"\bregularly\b", r"\busually\b"],
    1: [r"\bsometimes\b", r"\ba few days\b", r"\ba couple of days\b", r"\boccasionally\b", r"\bsome days\b", r"\bnow and then\b"],
    0: [r"\bnot at all\b", r"\bnever\b", r"\bno\b"]
}

NEGATION_PATTERN = re.compile(r"\b(no|not|never|n't|none|without|nothing)\b", flags=re.I)

def find_best_freq(text: str) -> int:
    text_lower = text.lower()
    score = None
    for lvl, patterns in FREQ_KEYWORDS.items():
        for pat in patterns:
            if re.search(pat, text_lower):
                if score is None or lvl > score:
                    score = lvl
    return score if score is not None else None

def negated_nearby(pos: int, text: str, window=20) -> bool:
    start = max(pos - window, 0)
    end = min(pos + window, len(text))
    segment = text[start:end]
    return bool(NEGATION_PATTERN.search(segment))

def clamp(v, a, b):
    return max(a, min(b, v))

# Scale keywords
PHQ9_ITEMS = {
    1: ["little interest", "pleasure", "anhedonia", "not interested", "no interest", "bored", "lack of motivation", "disinterest", "uninspired"],
    2: ["feeling down", "depressed", "sad", "hopeless", "blue", "low mood", "unhappy", "gloomy", "miserable"],
    3: ["trouble sleeping", "insomnia", "sleep problems", "sleeping too much", "oversleep", "can't sleep", "restless sleep", "nightmares", "early waking"],
    4: ["feeling tired", "low energy", "fatigue", "exhausted", "lethargy", "drained", "sluggish", "worn out", "lack of energy"],
    5: ["poor appetite", "loss of appetite", "eating less", "overeating", "weight gain", "weight loss", "overeats", "undereats", "changes in eating"],
    6: ["feeling bad about yourself", "feeling worthless", "guilt", "self-blame", "worthless", "regret", "shame", "self-critical", "inferior"],
    7: ["trouble concentrating", "difficulty concentrating", "hard to concentrate", "can't concentrate", "mind wandering", "forgetful", "scattered thoughts"],
    8: ["moving or speaking slowly", "moving slowly", "restless", "agitated", "psychomotor", "fidgety", "sluggish movements", "restlessness"],
    9: ["suicidal", "suicide", "self-harm", "want to die", "kill myself", "thoughts of death", "ending life", "suicidal thoughts", "self-injury"]
}

GAD7_ITEMS = {
    1: ["feeling nervous", "nervous", "anxious", "anxiety", "on edge", "tense", "worried", "uneasy"],
    2: ["not being able to stop worrying", "worrying too much", "can't stop worrying", "excessive worry", "overthinking", "persistent worry", "ruminating"],
    3: ["worry about different things", "worry about many things", "trouble controlling worrying", "multitopic worry", "scatterbrained concern"],
    4: ["trouble relaxing", "can't relax", "hard to relax", "tense", "restless", "uneasy", "stiff", "anxious muscles"],
    5: ["restlessness", "restless", "so restless", "can't sit still", "fidgeting", "agitated", "constantly moving"],
    6: ["becoming easily annoyed", "irritable", "getting annoyed easily", "short-tempered", "snappy", "frustrated quickly"],
    7: ["feeling afraid", "fearful", "scared", "terrified", "frightened", "panic", "alarmed"]
}

GHQ12_ITEMS = {
    1: ["concentration", "unable to concentrate", "difficulty concentrating", "focus", "can't focus", "mind wandering", "distracted"],
    2: ["lost sleep", "sleep problems", "sleep disturbance", "insomnia", "trouble sleeping", "restless nights", "night waking", "early waking"],
    3: ["playing useful part", "useful", "worthwhile role", "useful role", "meaningful", "contributing", "valuable"],
    4: ["capable of making decisions", "can't make decisions", "unable to make decisions", "decision", "indecisive", "confused", "uncertain"],
    5: ["constantly under strain", "under strain", "stressed", "pressure", "overwhelmed", "tense", "burned out"],
    6: ["able to enjoy day-to-day", "enjoy", "pleasure in day-to-day", "happy moments", "fun", "satisfaction"],
    7: ["able to face problems", "face problems", "cope with problems", "handle problems", "manage issues", "problem solving"],
    8: ["feeling unhappy or depressed", "unhappy", "depressed", "sad", "down", "low spirits", "blue"],
    9: ["losing confidence", "lost confidence", "confidence", "self-doubt", "insecure", "uncertain of myself"],
    10: ["thinking of yourself as worthless", "worthless", "no good", "inferior", "useless", "inadequate"],
    11: ["general happiness", "happy", "happiness", "content", "joyful", "satisfied", "pleased"],
    12: ["feeling reasonably well", "well", "good health", "better than usual", "fine", "healthy", "energetic"]
}

# Scoring logic
def score_item_from_text(item_keywords: List[str], text: str) -> Tuple[int, str]:
    text_lower = text.lower()
    best_score = 0
    best_evidence = ""
    for kw in item_keywords:
        for match in re.finditer(re.escape(kw.lower()), text_lower):
            pos = match.start()
            snippet = text[max(0, pos-60): min(len(text), pos+60)].strip()
            if negated_nearby(pos, text_lower):
                continue
            freq = find_best_freq(snippet)
            if freq is None:
                if re.search(r"\b(depress|suicid|worthless|panic|overwhelmed|can't cope|can't breathe)\b", snippet):
                    score = 3
                else:
                    score = 1
            else:
                score = freq
            score = clamp(score, 0, 3)
            if score > best_score:
                best_score = score
                best_evidence = snippet
            if best_score == 3:
                return best_score, best_evidence
    return best_score, best_evidence

def aggregate_conversations(convos: List[str]) -> str:
    return "\n\n".join(convos)

def estimate_phq9(text: str) -> Dict:
    total, per_item = 0, {}
    for no, keys in PHQ9_ITEMS.items():
        s, e = score_item_from_text(keys, text)
        per_item[no] = {"score": s, "evidence": e}
        total += s
    if total <= 4: level = "Minimal"
    elif total <= 9: level = "Mild"
    elif total <= 14: level = "Moderate"
    elif total <= 19: level = "Moderately severe"
    else: level = "Severe"
    return {"total": total, "level": level, "per_item": per_item}

def estimate_gad7(text: str) -> Dict:
    total, per_item = 0, {}
    for no, keys in GAD7_ITEMS.items():
        s, e = score_item_from_text(keys, text)
        per_item[no] = {"score": s, "evidence": e}
        total += s
    if total <= 4: level = "Minimal"
    elif total <= 9: level = "Mild"
    elif total <= 14: level = "Moderate"
    else: level = "Severe"
    return {"total": total, "level": level, "per_item": per_item}

def estimate_ghq12(text: str, scoring="binary") -> Dict:
    total, per_item = 0, {}
    for no, keys in GHQ12_ITEMS.items():
        s, e = score_item_from_text(keys, text)
        if scoring == "binary":
            b = 1 if s >= 1 else 0
            per_item[no] = {"score": b, "evidence": e}
            total += b
        else:
            per_item[no] = {"score": s, "evidence": e}
            total += s
    if scoring == "binary":
        level = "Probable psychiatric case" if total >= 3 else "Unlikely case"
    else:
        if total <= 11: level = "Low distress"
        elif total <= 20: level = "Moderate distress"
        else: level = "High distress"
    return {"total": total, "level": level, "per_item": per_item}

def estimate_scores(convos: List[str]) -> Dict:
    text = aggregate_conversations(convos)
    phq9 = estimate_phq9(text)
    gad7 = estimate_gad7(text)
    ghq_bin = estimate_ghq12(text, "binary")
    ghq_lik = estimate_ghq12(text, "likert")

    # Determine overall risk
    overall = "Low"
    if phq9["total"] >= 15 or gad7["total"] >= 15 or ghq_bin["total"] >= 6:
        overall = "High"
    elif phq9["total"] >= 10 or gad7["total"] >= 10 or ghq_bin["total"] >= 3:
        overall = "Moderate"

    flags = []
    if phq9["per_item"][9]["score"] >= 1:
        flags.append(" Suicidal ideation detected — urgent attention recommended.")

    return {
        "PHQ-9": phq9,
        "GAD-7": gad7,
        "GHQ-12_binary": ghq_bin,
        "GHQ-12_likert": ghq_lik,
        "overall_risk": overall,
        "flags": flags
    }

# Load conversation JSON
def load_conversation_json(path="conversation.json") -> List[str]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return [m["content"] for m in data if isinstance(m, dict) and m.get("role") == "user"]
    except FileNotFoundError:
        return []

# Example usage
if __name__ == "__main__":
    user_msgs = load_conversation_json()
    if not user_msgs:
        print("No conversation.json found or empty file.")
    else:
        scores = estimate_scores(user_msgs)
        print(json.dumps(scores, indent=2, ensure_ascii=False))