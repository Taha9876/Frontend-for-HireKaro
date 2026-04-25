import sys
import os

# Path fix
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.video_analysis import analyze_interview_video

# Apna actual video path yahan daalo
video_path = r"uploads\interview_videos\8\bilalsha_14_2403.webm"

print("=== Video Analysis Test ===")
result = analyze_interview_video(video_path)
print("\n=== Result ===")
import json
print(json.dumps(result, indent=2))