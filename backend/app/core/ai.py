from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_interview_questions(
    job_title: str,
    description: str,
    responsibilities: str,
    requirements: str,
    skills: list,
    count: int = 10
) -> list:
    skills_str = ", ".join([s["skill_name"] for s in skills]) if skills else "Not specified"

    prompt = f"""You are an expert technical interviewer. Generate exactly {count} interview questions for the following job position.

Job Title: {job_title}
Description: {description}
Responsibilities: {responsibilities or 'Not provided'}
Requirements: {requirements or 'Not provided'}
Required Skills: {skills_str}

Generate a mix of question types:
- verbal: behavioral and situational questions
- coding: technical/coding challenges
- mcq: multiple choice questions (include 4 options A, B, C, D)

Respond ONLY with a valid JSON array. No explanation, no markdown, no extra text.
Format:
[
  {{
    "question_text": "question here",
    "question_type": "verbal",
    "difficulty": "medium"
  }},
  {{
    "question_text": "question with options\\nA) option1\\nB) option2\\nC) option3\\nD) option4",
    "question_type": "mcq",
    "difficulty": "easy"
  }},
  {{
    "question_text": "coding challenge here",
    "question_type": "coding",
    "difficulty": "hard"
  }}
]

difficulty must be: easy, medium, or hard
question_type must be: verbal, coding, or mcq
Generate exactly {count} questions total."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    import json
    text = response.choices[0].message.content.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()
    questions = json.loads(text)
    return questions