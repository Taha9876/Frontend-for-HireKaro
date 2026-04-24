# from typing import List, Dict
# from openai import OpenAI
# from app.core.config import settings
# import json

# client = OpenAI(api_key=settings.OPENAI_API_KEY)

# # In-memory job cache — screening ke dauran job text store karo
# _job_cache = {}


# def embed_job_description(job_id: int, job_title: str, description: str,
#                            requirements: str, skills: List[str]) -> str:
#     job_text = f"""Job Title: {job_title}
# Description: {description}
# Requirements: {requirements or ''}
# Required Skills: {', '.join(skills)}""".strip()
#     _job_cache[job_id] = job_text
#     return job_text


# def get_semantic_score(job_id: int, resume_text: str) -> float:
#     try:
#         import numpy as np

#         job_text = _job_cache.get(job_id)
#         if not job_text:
#             return 0.5

#         def get_embedding(text):
#             response = client.embeddings.create(
#                 model="text-embedding-3-small",
#                 input=text[:4000]
#             )
#             return response.data[0].embedding

#         job_emb = get_embedding(job_text)
#         resume_emb = get_embedding(resume_text[:2000])

#         job_arr = np.array(job_emb)
#         res_arr = np.array(resume_emb)
#         similarity = float(
#             np.dot(job_arr, res_arr) /
#             (np.linalg.norm(job_arr) * np.linalg.norm(res_arr))
#         )
#         return round(max(0.0, min(1.0, similarity)), 3)

#     except Exception as e:
#         print(f"Semantic scoring failed: {e}")
#         return 0.5


# def calculate_skills_score(job_skills: List[Dict], resume_skills: List[str]) -> Dict:
#     if not job_skills:
#         return {"score": 0.5, "matched_required": [], "missing_required": [],
#                 "matched_optional": [], "total_required": 0, "total_matched": 0}

#     resume_skills_lower = [s.lower().strip() for s in resume_skills]
#     required_skills = [s for s in job_skills if s.get("is_required", True)]
#     optional_skills = [s for s in job_skills if not s.get("is_required", True)]

#     matched_required = []
#     missing_required = []

#     for skill in required_skills:
#         skill_name = skill["skill_name"].lower().strip()
#         found = any(
#             skill_name in rs or rs in skill_name or
#             _fuzzy_match(skill_name, rs)
#             for rs in resume_skills_lower
#         )
#         if found:
#             matched_required.append(skill["skill_name"])
#         else:
#             missing_required.append(skill["skill_name"])

#     matched_optional = []
#     for skill in optional_skills:
#         skill_name = skill["skill_name"].lower().strip()
#         if any(skill_name in rs or rs in skill_name for rs in resume_skills_lower):
#             matched_optional.append(skill["skill_name"])

#     if required_skills:
#         required_score = len(matched_required) / len(required_skills)
#     else:
#         required_score = 1.0

#     optional_bonus = (len(matched_optional) / len(optional_skills) * 0.15) if optional_skills else 0
#     score = min(1.0, required_score + optional_bonus)

#     return {
#         "score": round(score, 3),
#         "matched_required": matched_required,
#         "missing_required": missing_required,
#         "matched_optional": matched_optional,
#         "total_required": len(required_skills),
#         "total_matched": len(matched_required)
#     }


# def _fuzzy_match(skill: str, resume_skill: str) -> bool:
#     aliases = {
#         "javascript": ["js", "es6", "es2015", "vanilla js"],
#         "typescript": ["ts"],
#         "react": ["react.js", "reactjs", "react js"],
#         "node": ["node.js", "nodejs", "node js"],
#         "express": ["express.js", "expressjs"],
#         "mongodb": ["mongo", "mongoose"],
#         "postgresql": ["postgres", "pg"],
#         "python": ["py"],
#         "kubernetes": ["k8s"],
#     }
#     for key, vals in aliases.items():
#         if (skill == key or skill in vals) and (resume_skill == key or resume_skill in vals):
#             return True
#     return False


# def calculate_experience_relevance(
#     required_level: str,
#     work_experience: List[Dict],
#     job_title: str,
#     job_skills: List[str]
# ) -> Dict:
#     if not work_experience:
#         level_map = {"junior": 0.6, "mid": 0.3, "senior": 0.1, "lead": 0.05}
#         base_score = level_map.get(required_level, 0.3)
#         return {
#             "score": base_score,
#             "total_years": 0,
#             "relevant_years": 0,
#             "relevance_ratio": 0,
#             "required_level": required_level,
#             "expected_min": _get_expected_years(required_level)["min"]
#         }

#     total_years = sum(exp.get("years", 0) for exp in work_experience)
#     job_title_lower = job_title.lower()
#     job_skills_lower = [s.lower() for s in job_skills]

#     relevant_years = 0.0
#     for exp in work_experience:
#         exp_title = (exp.get("title") or "").lower()
#         exp_desc = (exp.get("description") or "").lower()
#         exp_years = exp.get("years", 0)

#         title_relevant = any(
#             keyword in exp_title or keyword in exp_desc
#             for keyword in job_title_lower.split() + job_skills_lower[:5]
#         )
#         desc_skill_matches = sum(
#             1 for skill in job_skills_lower
#             if skill in exp_desc or skill in exp_title
#         )

#         if title_relevant or desc_skill_matches >= 2:
#             relevant_years += exp_years
#         elif desc_skill_matches == 1:
#             relevant_years += exp_years * 0.5

#     relevance_ratio = (relevant_years / total_years) if total_years > 0 else 0
#     expected = _get_expected_years(required_level)

#     if relevant_years >= expected["ideal"]:
#         relevance_score = 1.0
#     elif relevant_years >= expected["min"]:
#         relevance_score = 0.65 + (0.35 * (relevant_years - expected["min"]) /
#                                    max(1, expected["ideal"] - expected["min"]))
#     elif relevant_years >= expected["min"] * 0.5:
#         relevance_score = 0.4
#     elif total_years >= expected["min"]:
#         relevance_score = 0.35
#     else:
#         relevance_score = max(0.1, total_years / max(1, expected["min"]) * 0.35)

#     if relevance_ratio >= 0.8:
#         relevance_score = min(1.0, relevance_score * 1.1)
#     elif relevance_ratio <= 0.2 and total_years > 0:
#         relevance_score = relevance_score * 0.7

#     return {
#         "score": round(relevance_score, 3),
#         "total_years": round(total_years, 1),
#         "relevant_years": round(relevant_years, 1),
#         "relevance_ratio": round(relevance_ratio, 2),
#         "required_level": required_level,
#         "expected_min": expected["min"],
#         "expected_ideal": expected["ideal"]
#     }


# def calculate_project_relevance(
#     projects: List[Dict],
#     job_title: str,
#     job_skills: List[str],
#     job_description: str
# ) -> Dict:
#     if not projects:
#         return {
#             "score": 0.3,
#             "relevant_projects": 0,
#             "total_projects": 0,
#             "relevance_ratio": 0,
#             "matched_techs": []
#         }

#     job_skills_lower = [s.lower().strip() for s in job_skills]
#     job_keywords = set(job_skills_lower)
#     for word in job_title.lower().split():
#         if len(word) > 3:
#             job_keywords.add(word)

#     relevant_count = 0
#     all_matched_techs = []

#     for project in projects:
#         proj_name = (project.get("name") or "").lower()
#         proj_desc = (project.get("description") or "").lower()
#         proj_techs = [t.lower().strip() for t in project.get("technologies", [])]
#         proj_full_text = f"{proj_name} {proj_desc} {' '.join(proj_techs)}"

#         skill_matches = []
#         for skill in job_skills_lower:
#             skill_found = (
#                 skill in proj_techs or
#                 any(_fuzzy_match(skill, t) for t in proj_techs) or
#                 skill in proj_full_text
#             )
#             if skill_found:
#                 skill_matches.append(skill)

#         if len(skill_matches) >= 2:
#             relevant_count += 1
#             all_matched_techs.extend(skill_matches)
#         elif len(skill_matches) == 1:
#             core_skills = job_skills_lower[:3]
#             relevant_count += 0.7 if skill_matches[0] in core_skills else 0.3
#             all_matched_techs.extend(skill_matches)

#     relevance_ratio = relevant_count / len(projects) if projects else 0

#     if relevance_ratio >= 0.8:
#         score = 0.95
#     elif relevance_ratio >= 0.6:
#         score = 0.82
#     elif relevance_ratio >= 0.4:
#         score = 0.65
#     elif relevance_ratio >= 0.2:
#         score = 0.45
#     elif relevant_count > 0:
#         score = 0.30
#     else:
#         score = 0.15

#     return {
#         "score": round(score, 3),
#         "relevant_projects": round(relevant_count, 1),
#         "total_projects": len(projects),
#         "relevance_ratio": round(relevance_ratio, 2),
#         "matched_techs": list(set(all_matched_techs))[:8]
#     }


# def calculate_education_score(parsed_data: dict, requirements: str) -> float:
#     education = parsed_data.get("education", [])
#     if not education:
#         return 0.4

#     degree_weights = {
#         "phd": 1.0, "doctorate": 1.0,
#         "master": 0.9, "msc": 0.9, "mba": 0.85,
#         "bachelor": 0.75, "bsc": 0.75, "be": 0.75, "bs": 0.75,
#         "associate": 0.5, "diploma": 0.45,
#     }

#     max_score = 0.4
#     for edu in education:
#         degree = edu.get("degree", "").lower()
#         for key, weight in degree_weights.items():
#             if key in degree:
#                 max_score = max(max_score, weight)
#                 break
#     return round(max_score, 3)


# def _get_expected_years(level: str) -> Dict:
#     level_map = {
#         "junior": {"min": 0, "ideal": 1.5, "max": 3},
#         "mid":    {"min": 2, "ideal": 4,   "max": 7},
#         "senior": {"min": 5, "ideal": 7,   "max": 15},
#         "lead":   {"min": 8, "ideal": 10,  "max": 20},
#     }
#     return level_map.get(level, {"min": 2, "ideal": 4, "max": 7})


# def calculate_final_score(
#     skills_score: float,
#     experience_score: float,
#     project_score: float,
#     education_score: float,
#     semantic_score: float
# ) -> float:
#     w_skills     = 0.35
#     w_experience = 0.25
#     w_projects   = 0.20
#     w_education  = 0.10
#     w_semantic   = 0.10

#     return round(
#         skills_score     * w_skills +
#         experience_score * w_experience +
#         project_score    * w_projects +
#         education_score  * w_education +
#         semantic_score   * w_semantic,
#         3
#     )


# def generate_rejection_reason(
#     parsed_data: dict,
#     skills_result: dict,
#     experience_result: dict,
#     project_result: dict,
#     match_score: float
# ) -> str:
#     reasons = []

#     if skills_result.get("missing_required"):
#         missing = ", ".join(skills_result["missing_required"][:3])
#         reasons.append(f"Missing required skills: {missing}")

#     if experience_result.get("score", 0) < 0.4:
#         if experience_result.get("relevance_ratio", 1) < 0.3:
#             reasons.append(
#                 f"Work experience ({experience_result.get('total_years', 0)} years) "
#                 f"is not relevant to this role"
#             )
#         else:
#             reasons.append(
#                 f"Insufficient experience ({experience_result.get('relevant_years', 0)} relevant years, "
#                 f"{experience_result.get('expected_min', 0)}+ required)"
#             )

#     if project_result.get("score", 0) < 0.3 and project_result.get("total_projects", 0) > 0:
#         reasons.append(
#             f"Projects ({project_result['total_projects']} found) are not relevant to this role"
#         )

#     if not reasons:
#         reasons.append(
#             f"Overall profile match ({int(match_score * 100)}%) is below our minimum threshold"
#         )

#     return ". ".join(reasons) + "."

from typing import List, Dict
import chromadb
from chromadb.utils import embedding_functions
from openai import OpenAI
from app.core.config import settings
import json
import os  # ← add this import

client = OpenAI(api_key=settings.OPENAI_API_KEY)



# ── Ensure folder exists ──
os.makedirs("./chromadb_data", exist_ok=True)

# ChromaDB setup
chroma_client = chromadb.PersistentClient(path="./chromadb_data")
# openai_ef = embedding_functions.OpenAIEmbeddingFunction(
#     api_key=settings.OPENAI_API_KEY,
#     model_name="text-embedding-3-small"
# )
# Sentence Transformers use karo — free, no API needed
# chroma_client = chromadb.PersistentClient(path="./chromadb_data")
# sentence_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
#     model_name="all-MiniLM-L6-v2"
# )


# def get_or_create_collection(job_id: int):
#     return chroma_client.get_or_create_collection(
#         name=f"job_{job_id}",
#         embedding_function=openai_ef
#     )
# def get_or_create_collection(job_id: int):
#     return chroma_client.get_or_create_collection(
#         name=f"job_{job_id}",
#         embedding_function=sentence_ef
#     )
def get_or_create_collection(job_id: int):
    return chroma_client.get_or_create_collection(
        name=f"job_{job_id}"
        # No embedding function — ChromaDB default use karega
    )

def embed_job_description(job_id: int, job_title: str, description: str,
                           requirements: str, skills: List[str]):
    collection = get_or_create_collection(job_id)
    job_text = f"""
    Job Title: {job_title}
    Description: {description}
    Requirements: {requirements or ''}
    Required Skills: {', '.join(skills)}
    """.strip()
    collection.upsert(
        documents=[job_text],
        ids=[f"job_{job_id}_desc"]
    )
    return job_text


def get_semantic_score(job_id: int, resume_text: str) -> float:
    try:
        collection = get_or_create_collection(job_id)
        results = collection.query(
            query_texts=[resume_text[:2000]],
            n_results=1
        )
        if results and results['distances'] and results['distances'][0]:
            distance = results['distances'][0][0]
            similarity = max(0.0, 1.0 - (distance / 2.0))
            return round(similarity, 3)
        return 0.5
    except Exception as e:
        print(f"Semantic scoring failed: {e}")
        return 0.5


def calculate_skills_score(job_skills: List[Dict], resume_skills: List[str]) -> Dict:
    if not job_skills:
        return {"score": 0.5, "matched_required": [], "missing_required": [],
                "matched_optional": [], "total_required": 0, "total_matched": 0}

    resume_skills_lower = [s.lower().strip() for s in resume_skills]
    required_skills = [s for s in job_skills if s.get("is_required", True)]
    optional_skills = [s for s in job_skills if not s.get("is_required", True)]

    matched_required = []
    missing_required = []

    for skill in required_skills:
        skill_name = skill["skill_name"].lower().strip()
        found = any(
            skill_name in rs or rs in skill_name or
            _fuzzy_match(skill_name, rs)
            for rs in resume_skills_lower
        )
        if found:
            matched_required.append(skill["skill_name"])
        else:
            missing_required.append(skill["skill_name"])

    matched_optional = []
    for skill in optional_skills:
        skill_name = skill["skill_name"].lower().strip()
        if any(skill_name in rs or rs in skill_name for rs in resume_skills_lower):
            matched_optional.append(skill["skill_name"])

    if required_skills:
        required_score = len(matched_required) / len(required_skills)
    else:
        required_score = 1.0

    optional_bonus = (len(matched_optional) / len(optional_skills) * 0.15) if optional_skills else 0
    score = min(1.0, required_score + optional_bonus)

    return {
        "score": round(score, 3),
        "matched_required": matched_required,
        "missing_required": missing_required,
        "matched_optional": matched_optional,
        "total_required": len(required_skills),
        "total_matched": len(matched_required)
    }


def _fuzzy_match(skill: str, resume_skill: str) -> bool:
    """Common aliases aur partial matches handle karo"""
    aliases = {
        "javascript": ["js", "es6", "es2015", "vanilla js"],
        "typescript": ["ts"],
        "react": ["react.js", "reactjs", "react js"],
        "node": ["node.js", "nodejs", "node js"],
        "express": ["express.js", "expressjs"],
        "mongodb": ["mongo", "mongoose"],
        "postgresql": ["postgres", "pg"],
        "python": ["py"],
        "kubernetes": ["k8s"],
        "javascript": ["js"],
    }
    for key, vals in aliases.items():
        if (skill == key or skill in vals) and (resume_skill == key or resume_skill in vals):
            return True
    return False


def calculate_experience_relevance(
    required_level: str,
    work_experience: List[Dict],
    job_title: str,
    job_skills: List[str]
) -> Dict:
    """
    Sirf years nahi — relevant experience bhi check karo.
    Kisi ne 5 saal DevOps kiya aur MERN job apply kiya toh low score milega.
    """
    if not work_experience:
        # Fresher — junior ke liye okay, senior ke liye nahi
        level_map = {"junior": 0.6, "mid": 0.3, "senior": 0.1, "lead": 0.05}
        base_score = level_map.get(required_level, 0.3)
        return {
            "score": base_score,
            "total_years": 0,
            "relevant_years": 0,
            "relevance_ratio": 0,
            "required_level": required_level,
            "expected_min": _get_expected_years(required_level)["min"]
        }

    # Total years
    total_years = sum(exp.get("years", 0) for exp in work_experience)

    # Relevant years — job title aur skills se match karo
    job_title_lower = job_title.lower()
    job_skills_lower = [s.lower() for s in job_skills]

    relevant_years = 0.0
    for exp in work_experience:
        exp_title = (exp.get("title") or "").lower()
        exp_desc = (exp.get("description") or "").lower()
        exp_years = exp.get("years", 0)

        # Title similarity check
        title_relevant = any(
            keyword in exp_title or keyword in exp_desc
            for keyword in job_title_lower.split() + job_skills_lower[:5]
        )

        # Description mein skills mention hain?
        desc_skill_matches = sum(
            1 for skill in job_skills_lower
            if skill in exp_desc or skill in exp_title
        )

        if title_relevant or desc_skill_matches >= 2:
            relevant_years += exp_years
        elif desc_skill_matches == 1:
            relevant_years += exp_years * 0.5  # partial credit

    relevance_ratio = (relevant_years / total_years) if total_years > 0 else 0

    # Expected years for the level
    expected = _get_expected_years(required_level)

    # Score calculation
    # Relevant experience zyada important hai total se
    if relevant_years >= expected["ideal"]:
        relevance_score = 1.0
    elif relevant_years >= expected["min"]:
        relevance_score = 0.65 + (0.35 * (relevant_years - expected["min"]) /
                                   max(1, expected["ideal"] - expected["min"]))
    elif relevant_years >= expected["min"] * 0.5:
        relevance_score = 0.4
    elif total_years >= expected["min"]:
        # Total years enough but not relevant
        relevance_score = 0.35
    else:
        relevance_score = max(0.1, total_years / max(1, expected["min"]) * 0.35)

    # Relevance ratio bonus/penalty
    if relevance_ratio >= 0.8:
        relevance_score = min(1.0, relevance_score * 1.1)
    elif relevance_ratio <= 0.2 and total_years > 0:
        relevance_score = relevance_score * 0.7  # penalty for irrelevant exp

    return {
        "score": round(relevance_score, 3),
        "total_years": round(total_years, 1),
        "relevant_years": round(relevant_years, 1),
        "relevance_ratio": round(relevance_ratio, 2),
        "required_level": required_level,
        "expected_min": expected["min"],
        "expected_ideal": expected["ideal"]
    }


def calculate_project_relevance(
    projects: List[Dict],
    job_title: str,
    job_skills: List[str],
    job_description: str
) -> Dict:
    if not projects:
        return {
            "score": 0.3,
            "relevant_projects": 0,
            "total_projects": 0,
            "relevance_ratio": 0,
            "matched_techs": []
        }

    job_skills_lower = [s.lower().strip() for s in job_skills]

    # Job se important keywords nikalo
    job_keywords = set(job_skills_lower)
    for word in job_title.lower().split():
        if len(word) > 3:
            job_keywords.add(word)

    relevant_count = 0
    all_matched_techs = []

    for project in projects:
        proj_name = (project.get("name") or "").lower()
        proj_desc = (project.get("description") or "").lower()
        proj_techs_raw = project.get("technologies", [])
        proj_techs = [t.lower().strip() for t in proj_techs_raw]

        # Combine all project text for matching
        proj_full_text = f"{proj_name} {proj_desc} {' '.join(proj_techs)}"

        # Skills match — check in technologies AND description
        skill_matches = []
        for skill in job_skills_lower:
            skill_found = (
                skill in proj_techs or
                any(_fuzzy_match(skill, t) for t in proj_techs) or
                skill in proj_full_text
            )
            if skill_found:
                skill_matches.append(skill)

        # Relevance decision
        if len(skill_matches) >= 2:
            relevant_count += 1
            all_matched_techs.extend(skill_matches)
        elif len(skill_matches) == 1:
            # Check if it's a core skill
            core_skills = job_skills_lower[:3]  # first 3 are usually most important
            if skill_matches[0] in core_skills:
                relevant_count += 0.7
            else:
                relevant_count += 0.3
            all_matched_techs.extend(skill_matches)

    relevance_ratio = relevant_count / len(projects) if projects else 0

    if relevance_ratio >= 0.8:
        score = 0.95
    elif relevance_ratio >= 0.6:
        score = 0.82
    elif relevance_ratio >= 0.4:
        score = 0.65
    elif relevance_ratio >= 0.2:
        score = 0.45
    elif relevant_count > 0:
        score = 0.30
    else:
        score = 0.15

    unique_matched = list(set(all_matched_techs))

    return {
        "score": round(score, 3),
        "relevant_projects": round(relevant_count, 1),
        "total_projects": len(projects),
        "relevance_ratio": round(relevance_ratio, 2),
        "matched_techs": unique_matched[:8]
    }


def calculate_education_score(parsed_data: dict, requirements: str) -> float:
    education = parsed_data.get("education", [])
    if not education:
        return 0.4

    degree_weights = {
        "phd": 1.0, "doctorate": 1.0,
        "master": 0.9, "msc": 0.9, "mba": 0.85,
        "bachelor": 0.75, "bsc": 0.75, "be": 0.75, "bs": 0.75,
        "associate": 0.5, "diploma": 0.45,
    }

    max_score = 0.4
    for edu in education:
        degree = edu.get("degree", "").lower()
        for key, weight in degree_weights.items():
            if key in degree:
                max_score = max(max_score, weight)
                break
    return round(max_score, 3)


def _get_expected_years(level: str) -> Dict:
    level_map = {
        "junior": {"min": 0, "ideal": 1.5, "max": 3},
        "mid":    {"min": 2, "ideal": 4,   "max": 7},
        "senior": {"min": 5, "ideal": 7,   "max": 15},
        "lead":   {"min": 8, "ideal": 10,  "max": 20},
    }
    return level_map.get(level, {"min": 2, "ideal": 4, "max": 7})


def calculate_final_score(
    skills_score: float,
    experience_score: float,
    project_score: float,
    education_score: float,
    semantic_score: float
) -> float:
    """Updated weighted scoring"""
    w_skills      = 0.35
    w_experience  = 0.25
    w_projects    = 0.20
    w_education   = 0.10
    w_semantic    = 0.10

    final = (
        skills_score     * w_skills +
        experience_score * w_experience +
        project_score    * w_projects +
        education_score  * w_education +
        semantic_score   * w_semantic
    )
    return round(final, 3)


def generate_rejection_reason(
    parsed_data: dict,
    skills_result: dict,
    experience_result: dict,
    project_result: dict,
    match_score: float
) -> str:
    reasons = []

    if skills_result.get("missing_required"):
        missing = ", ".join(skills_result["missing_required"][:3])
        reasons.append(f"Missing required skills: {missing}")

    exp_score = experience_result.get("score", 0)
    if exp_score < 0.4:
        actual = experience_result.get("relevant_years", 0)
        expected_min = experience_result.get("expected_min", 0)
        if experience_result.get("relevance_ratio", 1) < 0.3:
            reasons.append(
                f"Work experience ({experience_result.get('total_years', 0)} years) "
                f"is not relevant to this role"
            )
        else:
            reasons.append(
                f"Insufficient experience ({actual} relevant years, "
                f"{expected_min}+ required)"
            )

    proj_score = project_result.get("score", 0)
    if proj_score < 0.3 and project_result.get("total_projects", 0) > 0:
        reasons.append(
            f"Projects ({project_result['total_projects']} found) "
            f"are not relevant to this role"
        )

    if not reasons:
        reasons.append(
            f"Overall profile match ({int(match_score * 100)}%) "
            f"is below our minimum threshold"
        )

    return ". ".join(reasons) + "."