from __future__ import annotations

import json
import os
from typing import Any, Dict, Generator, List, Tuple
import requests


def get_provider_status() -> Dict[str, Any]:
    ollama_model = os.getenv("OLLAMA_MODEL", "llama3.2")
    gemini_key_present = bool(os.getenv("GEMINI_API_KEY", "").strip())
    status = {
        "provider_order": ["ollama_local", "gemini_api", "kb_fallback"],
        "ollama_model": ollama_model,
        "gemini_key_present": gemini_key_present,
        "ollama_reachable": False,
    }
    try:
        res = requests.get("http://127.0.0.1:11434/api/tags", timeout=2)
        status["ollama_reachable"] = res.ok
    except Exception:
        status["ollama_reachable"] = False
    return status


def stream_explanation_words(text: str, max_words_per_chunk: int = 8) -> Generator[str, None, None]:
    """
    Streams the explanation in small word-based chunks.
    This works for both LLM and fallback modes (keeps UX streaming without SDK dependency).
    """
    words = (text or "").split(" ")
    chunk: List[str] = []
    for w in words:
        if not w:
            continue
        chunk.append(w)
        if len(chunk) >= max_words_per_chunk:
            yield " ".join(chunk) + " "
            chunk = []
    if chunk:
        yield " ".join(chunk)


def retrieve_policy_references(
    *,
    ods_reasons: List[str],
    signals: Dict[str, Any],
    policy_kb: Dict[str, Any],
) -> List[Dict[str, str]]:
    """
    Phase-2 retrieval: select relevant KB snippets using deterministic rules.
    (No vector DB yet; avoids unpredictable retrieval quality.)
    """
    sources = policy_kb.get("sources", [])
    reasons_set = set([r.lower() for r in ods_reasons or []])

    def include_source(src: Dict[str, Any]) -> bool:
        domain = (src.get("domain") or "").lower()
        title = (src.get("title") or "").lower()

        if domain == "internet_access":
            return any(
                key in reasons_set
                for key in {"no reliable internet access", "no reliable internet", "intermittent internet access", "intermittent internet access"}
            ) or (signals.get("internet_access_reliability") in {"Low", "Medium"})

        if domain == "first_generation":
            return any("first-generation" in (r or "").lower() for r in (ods_reasons or []))

        if domain == "distance":
            # Reasons include strings like ">30km from nearest institution (45km)"
            return any(
                ("nearest institution" in (r or "").lower()) or ("distance from institution" in (r or "").lower())
                for r in (ods_reasons or [])
            )

        # Fallback: include if title keywords match
        return any(keyword in title for keyword in ("rural", "internet", "first", "distance"))

    selected: List[Dict[str, str]] = []
    for s in sources:
        if include_source(s):
            selected.append(
                {
                    "id": str(s.get("id", "")),
                    "title": str(s.get("title", "")),
                    "domain": str(s.get("domain", "")),
                    "stat": str(s.get("stat", "")),
                    "usage": str(s.get("usage", "")),
                }
            )

    # If nothing matched, include one generic grounding snippet.
    if not selected and sources:
        first = sources[0]
        selected.append(
            {
                "id": str(first.get("id", "")),
                "title": str(first.get("title", "")),
                "domain": str(first.get("domain", "")),
                "stat": str(first.get("stat", "")),
                "usage": str(first.get("usage", "")),
            }
        )

    return selected


def build_fallback_explanation(
    *,
    applicant_name: str,
    ods_score: float,
    ods_reasons: List[str],
    base_threshold: float,
    adj_threshold: float,
    policy_refs: List[Dict[str, str]],
) -> str:
    reduction_pct = round((base_threshold - adj_threshold) * 100)

    kb_lines = []
    for ref in policy_refs[:3]:
        if ref.get("stat"):
            kb_lines.append(f"- {ref['title']}: {ref['stat']}")

    kb_block = "\n".join(kb_lines) if kb_lines else "- Policy KB grounding was not found for this context."

    reasons_str = ", ".join(ods_reasons or [])
    ods_pct = round(ods_score * 100)

    return (
        f"For {applicant_name}, the Opportunity Deficit Score (ODS) is {ods_pct}/100 based on: {reasons_str}.\n\n"
        f"Because structural disadvantage is present, the baseline approval threshold was reduced "
        f"from {base_threshold:.0%} to {adj_threshold:.0%} (a {reduction_pct}% reduction). "
        f"This helps ensure the decision reflects access barriers rather than penalizing circumstances outside the student’s control.\n\n"
        f"Context grounding (NFHS-based snippets):\n{kb_block}\n\n"
        f"This demo explanation is generated deterministically when the LLM is unavailable, "
        f"so the output remains reliable for review."
    )


def generate_explanation_text(
    *,
    applicant_name: str,
    ods_score: float,
    ods_reasons: List[str],
    base_threshold: float,
    adj_threshold: float,
    policy_refs: List[Dict[str, str]],
    policy_kb: Dict[str, Any],
    preferred_provider: str = "auto",
) -> Tuple[str, str]:
    """
    Returns (explanation_text, source_label).
    source_label is one of: 'ollama_local', 'gemini_api', 'kb_fallback'.
    preferred_provider can be 'auto', 'ollama_local', or 'gemini_api'.
    """
    ollama_model = os.getenv("OLLAMA_MODEL", "llama3.2")
    gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
    gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    kb_json = json.dumps(policy_kb, ensure_ascii=False)
    refs_json = json.dumps(policy_refs, ensure_ascii=False)
    reasons_str = ", ".join(ods_reasons or [])

    system_prompt = (
        "You are generating an explainability report for an educational fairness demo. "
        "Be concrete, avoid making up numbers, and only use the provided policy KB snippets as evidence. "
        "Write 2-3 short paragraphs."
    )

    user_prompt = (
        f"Applicant: {applicant_name}\n\n"
        f"ODS score (0-1): {ods_score}\n"
        f"ODS reasons: {reasons_str}\n"
        f"Baseline threshold: {base_threshold}\n"
        f"Adjusted threshold: {adj_threshold}\n\n"
        f"Policy KB snippets (JSON): {refs_json}\n"
        f"Full policy KB (JSON): {kb_json}\n\n"
        "Task: explain why the threshold adjustment occurred and how the KB facts relate to "
        "access barriers for this applicant. End with a short, clear fairness note."
    )

    # Provider 1 (free/local): Ollama
    if preferred_provider in ("auto", "ollama_local"):
        try:
            prompt = f"{system_prompt}\n\n{user_prompt}"
            response = requests.post(
                "http://127.0.0.1:11434/api/generate",
                json={
                    "model": ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.2},
                },
                timeout=120,
            )
            response.raise_for_status()
            payload = response.json()
            explanation = str(payload.get("response", "")).strip()

            if not explanation:
                raise RuntimeError("Ollama returned empty explanation")

            return explanation, "ollama_local"

        except Exception as e:
            if preferred_provider == "ollama_local":
                print(f"Ollama requested but failed: {e}")
            pass

    # Provider 2 (free tier cloud): Gemini API
    if preferred_provider in ("auto", "gemini_api"):
        try:
            if not gemini_api_key:
                raise RuntimeError("Missing GEMINI_API_KEY")

            gemini_url = (
                f"https://generativelanguage.googleapis.com/v1beta/models/"
                f"{gemini_model}:generateContent?key={gemini_api_key}"
            )
            gemini_payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": f"{system_prompt}\n\n{user_prompt}"
                            }
                        ],
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 650,
                },
            }
            response = requests.post(gemini_url, json=gemini_payload, timeout=25)
            response.raise_for_status()
            data = response.json()
            candidates = data.get("candidates", [])
            text = ""
            if candidates:
                parts = (
                    candidates[0]
                    .get("content", {})
                    .get("parts", [])
                )
                text = "".join(str(p.get("text", "")) for p in parts).strip()

            if not text:
                raise RuntimeError("Gemini returned empty explanation")

            return text, "gemini_api"
        except Exception as e:
            if preferred_provider == "gemini_api":
                print(f"Gemini requested but failed: {e}")
            pass

    fallback = build_fallback_explanation(
        applicant_name=applicant_name,
        ods_score=ods_score,
        ods_reasons=ods_reasons,
        base_threshold=base_threshold,
        adj_threshold=adj_threshold,
        policy_refs=policy_refs,
    )
    return fallback, "kb_fallback"


def generate_interview_chat(
    messages: List[Dict[str, str]], preferred_provider: str = "auto"
) -> Dict[str, Any]:
    """
    Takes a conversation history (list of {"role": "user"|"assistant", "content": "..."})
    and returns a parsed JSON dict from the LLM with instructions to either continue
    or complete the evaluation.
    """
    ollama_model = os.getenv("OLLAMA_MODEL", "llama3.2")
    gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
    gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    system_prompt = (
        "You are an empathetic, conversational AI interviewer for the EquiDecide educational evaluation platform. "
        "Your goal is to gather a few key details about the applicant to evaluate them fairly. "
        "You need to know:\n"
        "1. Their Name\n"
        "2. Academic Score (percentage 0-100)\n"
        "3. Family Income (monthly in INR)\n"
        "4. Location (Are they from an Urban, Semi-Urban, or Rural area?)\n"
        "5. Distance from nearest educational institution (in km)\n"
        "6. Internet reliability (High, Medium, or Low)\n"
        "7. Are they a first-generation student? (True/False)\n\n"
        "Ask friendly questions. Do NOT ask for everything at once. "
        "If the user tells you to just give the results or forces an answer, output status 'complete', leave missing fields as null, "
        "and the system will infer the missing fields automatically using traditional defaults.\n"
        "When you have all the fields OR the user demands results, set status to 'complete'.\n\n"
        "IMPORTANT: You MUST ONLY output valid raw JSON. No markdown code blocks, no text outside JSON.\n"
        "JSON SCHEMA:\n"
        "{\n"
        '  "status": "continue" or "complete",\n'
        '  "reply": "Your conversational reply to the user...",\n'
        '  "extracted_data": {\n'
        '     "name": null,\n'
        '     "standard_metrics": {"academic_score_percentage": null, "family_income_monthly_inr": null},\n'
        '     "contextual_signals": {\n'
        '        "location_tier": null,\n'
        '        "distance_from_institution_km": null,\n'
        '        "internet_reliability": null,\n'
        '        "first_generation": null\n'
        "     }\n"
        "  }\n"
        "}"
    )

    if preferred_provider in ("auto", "ollama_local"):
        try:
            # For Ollama, we convert the messages into a single prompt string since 
            # some basic models handle raw text better, or we can use the /api/chat endpoint.
            # We'll use the /api/chat endpoint which takes `messages`.
            ollama_messages = [{"role": "system", "content": system_prompt}]
            for m in messages:
                ollama_messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})
            
            res = requests.post(
                "http://127.0.0.1:11434/api/chat",
                json={
                    "model": ollama_model,
                    "messages": ollama_messages,
                    "stream": False,
                    "format": "json",
                    "options": {"temperature": 0.1},
                },
                timeout=120,
            )
            res.raise_for_status()
            text = res.json().get("message", {}).get("content", "")
            if text:
                return json.loads(text)
        except Exception as e:
            if preferred_provider == "ollama_local":
                print(f"Ollama chat failed: {e}")
            pass

    if preferred_provider in ("auto", "gemini_api") and gemini_api_key:
        try:
            gemini_url = (
                f"https://generativelanguage.googleapis.com/v1beta/models/"
                f"{gemini_model}:generateContent?key={gemini_api_key}"
            )
            contents = [{"role": "user", "parts": [{"text": system_prompt}]}]
            for m in messages:
                role = "user" if m.get("role") == "user" else "model"
                contents.append({"role": role, "parts": [{"text": m.get("content", "")}]})
            
            gemini_payload = {
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.1,
                    "responseMimeType": "application/json",
                },
            }
            res = requests.post(gemini_url, json=gemini_payload, timeout=25)
            res.raise_for_status()
            candidates = res.json().get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                text = "".join(str(p.get("text", "")) for p in parts).strip()
                return json.loads(text)
        except Exception as e:
            if preferred_provider == "gemini_api":
                print(f"Gemini chat failed: {e}")
            pass

    # Fallback if both fail
    return {
        "status": "complete",
        "reply": "I'm having trouble connecting to my AI backend. I will stop the interview and process whatever information you've already given me.",
        "extracted_data": {
            "name": "Applicant",
            "standard_metrics": {"academic_score_percentage": 50.0, "family_income_monthly_inr": None},
            "contextual_signals": {}
        }
    }

