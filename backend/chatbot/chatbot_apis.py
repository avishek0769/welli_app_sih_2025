import os
from io import BytesIO
from dotenv import load_dotenv
from threading import Lock
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

load_dotenv()

# Configuration
DB_FAISS_PATH = "vectorstore/db_faiss"

CUSTOM_PROMPT_TEMPLATE = """
You are a helpful medical assistant. First detect the user's language and answer in the same language. Don't need to mention the language you are using.
If the user's question refers to medical facts, use the provided context to answer.
If the context is not enough, say "I don't know" — do not hallucinate medical facts.
Be concise and use clear, simple language suitable for patients.

User question: {question}

Context (retrieved documents):
{context}
"""

os.environ.setdefault("GROQ_API_KEY", os.getenv("GROQ_API_KEY", ""))


def set_custom_prompt(template: str):
    return PromptTemplate(template=template, input_variables=["context", "question"])


def load_llm(model_name="llama-3.3-70b-versatile"):
    return ChatGroq(model=model_name, temperature=0.2, groq_api_key=os.environ.get("GROQ_API_KEY", ""))


def load_vectorstore(db_path=DB_FAISS_PATH):
    embed = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-xlm-r-multilingual-v1")
    return FAISS.load_local(db_path, embed, allow_dangerous_deserialization=True)


# Lazy initialization for QA chain (thread-safe)
_init_lock = Lock()
_qa_chain = None


def get_qa_chain():
    global _qa_chain
    with _init_lock:
        if _qa_chain:
            return _qa_chain
        vectorstore = load_vectorstore()
        _qa_chain = RetrievalQA.from_chain_type(
            llm=load_llm(),
            chain_type="stuff",
            retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
            return_source_documents=False,
            chain_type_kwargs={
                "prompt": set_custom_prompt(CUSTOM_PROMPT_TEMPLATE)
            },
        )
        return _qa_chain


app = Flask(__name__)
CORS(app)


@app.route("/api/chat/message", methods=["POST"])
def chat_message():
    """
    Accepts JSON: { "message": "<user text>" }
    Returns JSON: { "reply": "<assistant text>" }
    Stateless endpoint — doesn't store any conversation.
    """
    payload = request.get_json(silent=True) or {}
    user_text = (payload.get("message") or "").strip()
    if not user_text:
        return jsonify({"error": "message required"}), 400

    qa = get_qa_chain()
    try:
        # Use the chain to generate a reply. API may return dict or string depending on chain.
        resp = qa.invoke({"query": user_text})
        assistant_text = (resp.get("result") if isinstance(
            resp, dict) else str(resp)) or ""
    except Exception:
        assistant_text = "Error generating response."

    return jsonify({"reply": assistant_text})


@app.route("/api/chat/message-audio", methods=["POST"])
def post_message_audio():
    data = request.get_json(silent=True) or {}
    user_text = data.get("message", "").strip()

    if not user_text:
        return jsonify({"error": "message required"}), 400

    assistant_text = f"{user_text}"

    try:
        from gtts import gTTS
        import traceback
        mp = BytesIO()
        gTTS(assistant_text).write_to_fp(mp)
        mp.seek(0)
        audio_bytes = mp.getvalue()
        return Response(audio_bytes, mimetype="audio/mpeg")
    except Exception:
        print("TTS failed:", traceback.format_exc())
        return jsonify({"reply": assistant_text, "audio_available": False})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
