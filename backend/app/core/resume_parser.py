import fitz  # PyMuPDF
import json
from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def extract_text_from_pdf(file_path: str) -> str:
    """PDF se raw text extract karo"""
    try:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"PDF extraction failed: {e}")
        return ""


def extract_text_from_docx(file_path: str) -> str:
    """DOCX se raw text extract karo"""
    try:
        from docx import Document
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text.strip()
    except Exception as e:
        print(f"DOCX extraction failed: {e}")
        return ""


def extract_text(file_path: str) -> str:
    """File type detect karke text extract karo"""
    if file_path.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.lower().endswith('.docx'):
        return extract_text_from_docx(file_path)
    else:
        # Try PDF first
        text = extract_text_from_pdf(file_path)
        return text


def parse_resume_with_ai(raw_text: str) -> dict:
    if not raw_text or len(raw_text) < 50:
        return {}

    prompt = f"""Extract structured information from this resume.
Respond ONLY with valid JSON, no markdown, no explanation.

Resume Text:
{raw_text[:4000]}

IMPORTANT RULES:
- total_experience_years: calculate from ALL work experience durations combined (e.g. 2 months = 0.17, 1 year = 1.0, 1 year 6 months = 1.5)
- skills: extract ALL technical skills mentioned anywhere in the resume
- projects technologies: extract ALL tech stack mentioned in each project
- For internships: calculate months as fraction of year (2 months = 0.17 years)

Return this exact JSON:
{{
  "name": "full name or null",
  "email": "email address or null",
  "phone": "phone number or null",
  "total_experience_years": 0.5,
  "current_role": "current job title or null",
  "skills": ["MongoDB", "Express.js", "React.js", "Node.js", "JavaScript", "Git"],
  "education": [
    {{
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "institution": "FAST University",
      "year": 2026
    }}
  ],
  "work_experience": [
    {{
      "title": "MERN Stack Developer Intern",
      "company": "Code Practitioners",
      "years": 0.17,
      "description": "Developed full-stack web applications using MongoDB Express React Node.js JWT authentication REST APIs"
    }}
  ],
  "projects": [
    {{
      "name": "Palate Recipe Sharing Platform",
      "technologies": ["MongoDB", "Express.js", "React.js", "Node.js", "REST APIs", "Vercel"],
      "description": "Full-stack social platform using MERN Stack with authentication user profiles recipe posts"
    }}
  ],
  "languages": ["English", "Urdu"],
  "summary": "professional summary here"
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )
        text = response.choices[0].message.content.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        return json.loads(text)
    except Exception as e:
        print(f"AI parsing failed: {e}")
        return {}