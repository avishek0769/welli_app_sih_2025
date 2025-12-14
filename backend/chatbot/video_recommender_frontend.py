import json
import streamlit as st
from video_recommender import recommend_videos

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

    # Use the shared logic from video_recommender.py
    with st.spinner('Analyzing emotion and finding videos...'):
        recs = recommend_videos(conversation)

    if recs:
        st.subheader("Recommended YouTube Videos:")
        for v in recs:
            st.markdown(f"[{v['title']}]({v['url']})")
    else:
        st.info("No recommendations found.")

if __name__ == "__main__":
    main()
