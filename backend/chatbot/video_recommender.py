import os
import json
from googleapiclient.discovery import build
from transformers import pipeline
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# Global clients (Lazy loaded)
_youtube_client = None
_emotion_classifier = None

def get_youtube_client():
    global _youtube_client
    if not _youtube_client:
        _youtube_client = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
    return _youtube_client

def get_emotion_classifier():
    global _emotion_classifier
    if not _emotion_classifier:
        print("Loading emotion model...")
        _emotion_classifier = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            return_all_scores=False
        )
    return _emotion_classifier

def detect_emotion(text: str) -> str:
    """Detects the dominant emotion in the given text."""
    classifier = get_emotion_classifier()
    result = classifier(text[:500])
    return result[0]["label"].lower()

def fetch_youtube_videos(query, max_results=5):
    """Fetches videos from YouTube based on a search query."""
    youtube = get_youtube_client()
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

def recommend_videos(conversation):
    """Recommends videos based on the user conversation emotion."""
    user_text = " ".join([m["content"] for m in conversation if m.get("role") == "user"])
    
    if not user_text:
        return []

    # Detect emotion to make smart recommendations
    mood = detect_emotion(user_text)
    
    # Map mood to search context
    mood_queries = {
        "sadness": "uplifting motivation and positivity",
        "anger": "calming meditation and anger management",
        "fear": "anxiety relief and grounding exercises",
        "joy": "wellness and positive vibes",
        "neutral": "relaxing music and focus",
        "disgust": "mindfulness and acceptance",
        "surprise": "calming breathing techniques"
    }
    
    suffix = mood_queries.get(mood, "mental wellness")
    # Construct query: short user context + mood-based suffix
    query = f"{user_text[:50]} {suffix}"
    
    print(f"Detected Mood: {mood} | Query: {query}")
    return fetch_youtube_videos(query, max_results=5)

if __name__ == "__main__":
    try:
        with open("conversation.json", "r", encoding="utf-8") as f:
            conversation = json.load(f)
            
        if conversation:
            print("\nLast 5 messages:")
            for msg in conversation[-5:]:
                print(f"{msg['role']}: {msg['content']}")

            recs = recommend_videos(conversation)
            print("\nRecommended Videos:")
            for v in recs:
                print(f"- {v['title']} ({v['url']})")
        else:
            print("Conversation empty.")
            
    except FileNotFoundError:
        print("conversation.json not found.")