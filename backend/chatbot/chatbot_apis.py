import os
import uuid
from io import BytesIO
from dotenv import load_dotenv
from threading import Lock
from flask import Flask, request, jsonify, send_file, abort, Response
from flask_cors import CORS

from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

load_dotenv()

# Configuration (match existing files)
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

# Helpers to build chain


def set_custom_prompt(template: str):
    return PromptTemplate(template=template, input_variables=["context", "question"])


def load_llm(model_name="llama-3.3-70b-versatile"):
    return ChatGroq(model=model_name, temperature=0.2, groq_api_key=os.environ.get("GROQ_API_KEY", ""))


def load_vectorstore(db_path=DB_FAISS_PATH):
    embed = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-xlm-r-multilingual-v1")
    return FAISS.load_local(db_path, embed, allow_dangerous_deserialization=True)


# Lazy initialization
_init_lock = Lock()
_vectorstore = None
_qa_chain = None


def get_qa_chain():
    global _vectorstore, _qa_chain
    with _init_lock:
        if _qa_chain:
            return _qa_chain
        _vectorstore = load_vectorstore()
        _qa_chain = RetrievalQA.from_chain_type(
            llm=load_llm(),
            chain_type="stuff",
            retriever=_vectorstore.as_retriever(search_kwargs={"k": 3}),
            return_source_documents=False,
            chain_type_kwargs={
                "prompt": set_custom_prompt(CUSTOM_PROMPT_TEMPLATE)
            },
        )
        return _qa_chain


# In-memory conversation store
_conversations = {}
_conversations_lock = Lock()

app = Flask(__name__)
CORS(app)


@app.route("/api/chats", methods=["GET"])
def list_chats():
    with _conversations_lock:
        items = [{"chat_id": cid, "name": v.get(
            "name", cid)} for cid, v in _conversations.items()]
    return jsonify(items)


@app.route("/api/chat", methods=["POST"])
def create_chat():
    """
    Create a chat. Client may provide 'chat_id' in JSON payload.
    Payload examples:
      - {"chat_id": "my-chat-123", "name": "Support chat"}
      - {"name": "Session without provided id"}
    If provided chat_id already exists -> 409 Conflict.
    """
    data = request.get_json(silent=True) or {}
    provided_id = data.get("chat_id")
    name = data.get("name") or f"Chat {len(_conversations)+1}"

    # sanitize and validate provided_id if present
    if provided_id:
        cid = str(provided_id).strip()
        if not cid:
            return jsonify({"error": "invalid chat_id"}), 400
        # optional: enforce allowed chars (alnum, hyphen, underscore)
        import re
        if not re.match(r'^[A-Za-z0-9_-]+$', cid):
            return jsonify({"error": "chat_id contains invalid characters"}), 400

        with _conversations_lock:
            if cid in _conversations:
                return jsonify({"error": "chat_id already exists"}), 409
            _conversations[cid] = {"name": name, "messages": []}
    else:
        cid = uuid.uuid4().hex
        with _conversations_lock:
            _conversations[cid] = {"name": name, "messages": []}

    return jsonify({"chat_id": cid, "name": name})


@app.route("/api/chat/<chat_id>/messages", methods=["GET"])
def get_messages(chat_id):
    with _conversations_lock:
        conv = _conversations.get(chat_id)
        if conv is None:
            return jsonify({"error": "not found"}), 404
        return jsonify(conv["messages"])


@app.route("/api/chat/<chat_id>/message", methods=["POST"])
def post_message(chat_id):
    """
    Accepts: JSON { "message": "<user text>" }
    Behavior: store user message, generate assistant text via LLM+retrieval.
    NOTE: Do NOT generate or save any audio here. Audio is generated only via /message-audio endpoint.
    Returns: { "reply": "<assistant text>" }  <-- only reply, no "messages" array
    """
    payload = request.get_json(silent=True) or {}
    user_text = (payload.get("message") or "").strip()
    if not user_text:
        return jsonify({"error": "message required"}), 400

    with _conversations_lock:
        conv = _conversations.get(chat_id)
        if conv is None:
            return jsonify({"error": "not found"}), 404
        conv["messages"].append({"role": "user", "content": user_text})

    qa = get_qa_chain()
    try:
        resp = qa.invoke({"query": user_text})
        assistant_text = (resp.get("result") if isinstance(
            resp, dict) else str(resp)) or ""
    except Exception:
        assistant_text = "Error generating response."

    with _conversations_lock:
        conv["messages"].append(
            {"role": "assistant", "content": assistant_text})

    return jsonify({"reply": assistant_text})


@app.route("/api/chat/message-audio", methods=["POST"])
def post_message_audio():
    data = request.get_json(silent=True) or {}
    user_text = data.get("message", "").strip()

    if not user_text:
        return jsonify({"error": "message required"}), 400

    # Example: replace with your LLM logic
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
