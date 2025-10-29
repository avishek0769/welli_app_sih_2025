import os
import json
from googleapiclient.discovery import build
from transformers import pipeline
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# 2. Initialize YouTube API
youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

# 3. Load emotion classifier
emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=False
)

# 4. Detect dominant emotion
def detect_emotion(text: str) -> str:
    """
    Detects the dominant emotion in the given text.
    """
    result = emotion_classifier(text[:500])
    return result[0]["label"].lower()

# 5. Fetch YouTube videos
def fetch_youtube_videos(query, max_results=5):
    """
    Fetches videos from YouTube based on a search query.
    """
    search_response = youtube.search().list(
        q=query,
        part="snippet",
        type="video",
        maxResults=max_results,
        videoEmbeddable="true",
        safeSearch="strict"
    ).execute()

    videos = []
    for item in search_response.get("items", []):
        video_id = item["id"]["videoId"]
        title = item["snippet"]["title"]
        url = f"https://www.youtube.com/watch?v={video_id}"
        videos.append({"title": title, "url": url})
    return videos

# 6. Recommend videos
def recommend_videos(conversation):
    """
    Recommends videos based on the user conversation.
    """
    user_text = " ".join([m["content"] for m in conversation if m.get("role") == "user"])
    user_query = user_text[:200]  # truncate for safety
    recs = fetch_youtube_videos(f"{user_query} relaxing music meditation motivation", max_results=7)
    return recs

# 7. Main runner 
if __name__ == "__main__":
    try:
        with open("conversation.json", "r", encoding="utf-8") as f:
            conversation = json.load(f)
    except FileNotFoundError:
        print(" No chatbot conversation found (conversation.json missing).")
        conversation = []

    if conversation:
        print("\n Last 5 conversation messages:")
        for msg in conversation[-5:]:
            role = "User" if msg["role"] == "user" else "Welli-Bot"
            print(f"{role}: {msg['content']}")

        recommendations = recommend_videos(conversation)
        if recommendations:
            print("\n Recommended YouTube Videos:")
            for v in recommendations:
                print(f"- {v['title']} -> {v['url']}")
        else:
            print("\nNo recommendations found.")
    else:
        print(" Conversation is empty.")