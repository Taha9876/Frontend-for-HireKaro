import cv2
import base64
import json
from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def extract_key_frames(video_path: str, num_frames: int = 10) -> list:
    import os
    import subprocess
    import tempfile

    print(f"[VIDEO] Path: {video_path}")
    print(f"[VIDEO] File exists: {os.path.exists(video_path)}")

    # Duration nikalne ki koshish — packets scan karo
    try:
        probe = subprocess.run([
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            "-analyzeduration", "100M",
            "-probesize", "100M",
            video_path
        ], capture_output=True, text=True, timeout=60)

        duration_str = probe.stdout.strip()
        print(f"[VIDEO] Duration raw: '{duration_str}'")

        if duration_str and duration_str != 'N/A':
            duration_sec = float(duration_str)
        else:
            # Duration nahi mili — file ko scan karke last timestamp lo
            print("[VIDEO] Duration N/A — scanning file for last timestamp...")
            scan = subprocess.run([
                "ffprobe", "-v", "error",
                "-show_entries", "packet=pts_time",
                "-of", "csv=print_section=0",
                "-read_intervals", "%+#999999",
                "-select_streams", "v",
                video_path
            ], capture_output=True, text=True, timeout=120)

            timestamps = []
            for line in scan.stdout.strip().split('\n'):
                line = line.strip()
                if line and line != 'N/A':
                    try:
                        timestamps.append(float(line))
                    except:
                        pass

            if timestamps:
                duration_sec = max(timestamps)
                print(f"[VIDEO] Duration from scan: {duration_sec:.1f}s")
            else:
                print("[VIDEO] Could not determine duration")
                return []

    except Exception as e:
        print(f"[VIDEO] Probe failed: {e}")
        return []

    print(f"[VIDEO] Final duration: {duration_sec:.1f}s")

    if duration_sec <= 5:
        print("[VIDEO] Video too short")
        return []

    # Pehle 15% aur last 2% skip
    start_sec = duration_sec * 0.15
    end_sec = duration_sec * 0.98
    usable_sec = end_sec - start_sec

    print(f"[VIDEO] Sampling from {start_sec:.1f}s to {end_sec:.1f}s")

    interval = usable_sec / num_frames
    timestamps_to_capture = [start_sec + (i * interval) for i in range(num_frames)]

    frames_b64 = []
    with tempfile.TemporaryDirectory() as tmpdir:
        for i, ts in enumerate(timestamps_to_capture):
            output_path = os.path.join(tmpdir, f"frame_{i:03d}.jpg")

            try:
                result = subprocess.run([
                    "ffmpeg", "-y",
                    "-ss", f"{ts:.3f}",
                    "-i", video_path,
                    "-vframes", "1",
                    "-vf", "scale=640:480",
                    "-q:v", "5",
                    output_path
                ], capture_output=True, timeout=30)

                if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                    with open(output_path, "rb") as f:
                        b64 = base64.b64encode(f.read()).decode('utf-8')
                        frames_b64.append(b64)
                    print(f"[VIDEO] Frame {i} at {ts:.1f}s: OK")
                else:
                    print(f"[VIDEO] Frame {i} at {ts:.1f}s: FAILED")

            except Exception as e:
                print(f"[VIDEO] Frame {i} error: {e}")

    print(f"[VIDEO] Total frames extracted: {len(frames_b64)}")
    return frames_b64


def analyze_frames_with_gpt(frames_b64: list) -> dict:
    """
    Frames GPT-4o Vision ko bhejo aur analysis lo
    """
    if not frames_b64:
        return _empty_analysis("No frames extracted from video")

    # Images prepare karo for GPT
    content = [
        {
            "type": "text",
            "text": """You are analyzing video frames from a job interview. 
These frames are sampled evenly throughout the interview (early setup frames excluded).

Analyze the candidate's behavior across all frames and respond ONLY with valid JSON:
{
  "eye_contact_score": 75,
  "face_visible_score": 90,
  "confidence_score": 70,
  "distraction_count": 3,
  "lighting_quality": "good",
  "summary": "2-3 sentence summary for HR about candidate behavior",
  "flags": ["looking away frequently", "good posture"]
}

Scoring guide (0-100):
- eye_contact_score: How often candidate looks toward camera
- face_visible_score: How consistently face is visible and centered
- confidence_score: Based on posture, stillness, expressions
- distraction_count: Number of frames where candidate seems distracted
- lighting_quality: "good", "poor", or "average"
- flags: Notable observations (max 4 points)

Respond ONLY with JSON. No explanation."""
        }
    ]

    # Har frame add karo — low detail mode
    for b64 in frames_b64:
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{b64}",
                "detail": "low"
            }
        })

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": content}],
            max_tokens=500,
            temperature=0.2
        )

        text = response.choices[0].message.content.strip()
        
        # Markdown fence strip karo agar ho
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        result = json.loads(text)
        result["frames_analyzed"] = len(frames_b64)
        result["status"] = "completed"
        return result

    except Exception as e:
        print(f"GPT Vision analysis failed: {e}")
        return _empty_analysis(f"Analysis failed: {str(e)}")


def analyze_interview_video(video_path: str) -> dict:
    """
    Main function — frames extract karo phir analyze karo
    """
    try:
        print(f"Video analysis shuru: {video_path}")
        
        frames = extract_key_frames(video_path, num_frames=10)
        
        if not frames:
            return _empty_analysis("Could not extract frames from video")

        print(f"{len(frames)} frames extracted, GPT ko bhej rahe hain...")
        
        result = analyze_frames_with_gpt(frames)
        
        print(f"Video analysis complete. Eye contact: {result.get('eye_contact_score')}")
        return result

    except Exception as e:
        print(f"Video analysis error: {e}")
        return _empty_analysis(str(e))


def _empty_analysis(reason: str) -> dict:
    return {
        "status": "failed",
        "reason": reason,
        "eye_contact_score": None,
        "face_visible_score": None,
        "confidence_score": None,
        "distraction_count": None,
        "lighting_quality": None,
        "summary": "Video analysis could not be completed.",
        "flags": [],
        "frames_analyzed": 0
    }