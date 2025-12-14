import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from video_recommender import recommend_videos

app = Flask(__name__)
CORS(app)

@app.route('/api/recommend-videos', methods=['POST'])
def get_recommendations():
    try:
        data = request.get_json()
        user_query = data.get('userQuery', '')

        if not user_query:
            return jsonify({"success": True, "videos": []})

        # Format the single query string into the conversation list format 
        # expected by recommend_videos ([{role: 'user', content: '...'}])
        dummy_conversation = [
            {"role": "user", "content": user_query}
        ]

        # Call the existing logic
        videos = recommend_videos(dummy_conversation)

        return jsonify({
            "success": True, 
            "videos": videos
        })

    except Exception as e:
        print(f"Error in video recommendation API: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("RECOMMENDER_PORT", 4002))
    app.run(host="0.0.0.0", port=port)