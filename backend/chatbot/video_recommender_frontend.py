import json
import streamlit as st
from googleapiclient.discovery import build
from transformers import pipeline
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get the YouTube API key from the environment
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# Initialize YouTube API
youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

# Load emotion model 
emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=False
)

# Detect dominant emotion 
def detect_emotion(text: str) -> str:
    result = emotion_classifier(text[:500])
    return result[0]["label"].lower()

# Fetch videos dynamically from YouTube
def fetch_youtube_videos(query, max_results=5):
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

# Recommend videos based purely on user query
def recommend_videos(conversation):
    user_text = " ".join([m["content"] for m in conversation if m.get("role") == "user"])
    user_query = user_text[:200]  # truncate to 200 chars for safety
    recs = fetch_youtube_videos(f"{user_query} relaxing music meditation motivation", max_results=7)
    return recs

# Streamlit UI
def main():
    st.title("Video Recommender")

    try:
        with open("conversation.json", "r", encoding="utf-8") as f:
            conversation = json.load(f)
    except FileNotFoundError:
        conversation = []

    if not conversation:
        st.warning("No chatbot conversation found yet.")
        return

    st.subheader("Recent Conversation")
    for msg in conversation[-5:]:
        role = "User" if msg["role"] == "user" else "Welli-Bot"
        st.markdown(f"**{role}:** {msg['content']}")

    recs = recommend_videos(conversation)

    if recs:
        st.subheader("Recommended YouTube Videos:")
        for v in recs:
            st.markdown(f"[{v['title']}]({v['url']})")
    else:
        st.info("No recommendations found.")

if __name__ == "__main__":
    main()
