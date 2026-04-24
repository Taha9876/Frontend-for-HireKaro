from openai import OpenAI
from app.core.config import settings
import json

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def evaluate_verbal_answer(question: str, answer: str) -> dict:
    if not answer or len(answer.strip()) < 10:
        return {"score": 0, "feedback": "No answer provided."}

    prompt = f"""You are an expert technical interviewer evaluating a candidate's verbal answer.

Question: {question}
Candidate's Answer: {answer}

Evaluate the answer and respond ONLY with valid JSON:
{{
  "score": 75,
  "feedback": "Brief constructive feedback in 2-3 sentences.",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area to improve 1"]
}}

Score 0-100 where:
- 90-100: Exceptional, thorough answer
- 70-89: Good answer with minor gaps
- 50-69: Adequate but missing key points
- 30-49: Weak answer, significant gaps
- 0-29: Very poor or irrelevant answer"""

    try:
        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        text = res.choices[0].message.content.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        print(f"Verbal evaluation failed: {e}")
        return {"score": 50, "feedback": "Could not evaluate automatically."}


def evaluate_coding_answer(question: str, code: str, language: str = "unknown") -> dict:
    if not code or len(code.strip()) < 10:
        return {"score": 0, "feedback": "No code provided."}

    prompt = f"""You are an expert code reviewer evaluating a candidate's coding answer.

Question: {question}
Language: {language}
Code Submitted:
{code}

Evaluate and respond ONLY with valid JSON:
{{
  "score": 70,
  "feedback": "Brief constructive feedback in 2-3 sentences.",
  "correctness": "correct/partially correct/incorrect",
  "strengths": ["clean code", "correct logic"],
  "improvements": ["add edge case handling"]
}}

Score 0-100 where:
- 90-100: Correct, efficient, clean code
- 70-89: Correct with minor issues
- 50-69: Partially correct
- 30-49: Wrong approach but shows understanding
- 0-29: No meaningful attempt"""

    try:
        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        text = res.choices[0].message.content.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        print(f"Coding evaluation failed: {e}")
        return {"score": 50, "feedback": "Could not evaluate automatically."}


def calculate_final_interview_score(verbal_scores: list, mcq_scores: list, coding_scores: list) -> dict:
    verbal_avg  = sum(verbal_scores) / len(verbal_scores)   if verbal_scores  else 0
    mcq_avg     = sum(mcq_scores) / len(mcq_scores)         if mcq_scores     else 0
    coding_avg  = sum(coding_scores) / len(coding_scores)   if coding_scores  else 0

    # Weights
    w_verbal = 0.40
    w_mcq    = 0.30
    w_coding = 0.30

    final = (verbal_avg * w_verbal) + (mcq_avg * w_mcq) + (coding_avg * w_coding)

    return {
        "verbal_score":  round(verbal_avg, 1),
        "mcq_score":     round(mcq_avg, 1),
        "coding_score":  round(coding_avg, 1),
        "final_score":   round(final, 1),
    }