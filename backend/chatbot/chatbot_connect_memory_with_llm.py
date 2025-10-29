import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Optional: load environment variables from a .env file
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# STEP 1: Setup API Key (keep this in env or .env in production)
os.environ.setdefault("GROQ_API_KEY", os.getenv("GROQ_API_KEY", GROQ_API_KEY))

# STEP 2: Groq LLM Loader
def load_llm(model_name="llama-3.3-70b-versatile"):
    llm = ChatGroq(
        model=model_name,
        temperature=0.2,
        groq_api_key=os.getenv("GROQ_API_KEY")
    )
    return llm

# STEP 3: Custom Prompt (multilingual)
CUSTOM_PROMPT_TEMPLATE = """
You are a helpful medical assistant. First detect the user's language and answer in the same language.
If the user's question refers to medical facts, use the provided context to answer.
If the context is not enough, say "I don't know" — do not hallucinate medical facts.
Be concise and use clear, simple language suitable for patients.

User question: {question}

Context (retrieved documents):
{context}

Instructions:
- Reply in the same language as the user's question.
- If the question asks for instructions, include safe, general guidance and recommend consulting a healthcare professional for diagnosis or emergencies.
- Keep answers short (2-6 sentences) unless asked to elaborate.
"""

def set_custom_prompt(custom_prompt_template):
    prompt = PromptTemplate(template=custom_prompt_template, input_variables=["context", "question"])
    return prompt

# STEP 4: Load FAISS Database with multilingual embeddings
DB_FAISS_PATH = "vectorstore/db_faiss"
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-xlm-r-multilingual-v1")

# Load FAISS index
db = FAISS.load_local(DB_FAISS_PATH, embedding_model, allow_dangerous_deserialization=True)

# STEP 5: Create RetrievalQA Chain
qa_chain = RetrievalQA.from_chain_type(
    llm=load_llm("llama-3.3-70b-versatile"),
    chain_type="stuff",
    retriever=db.as_retriever(search_kwargs={'k': 5}),
    return_source_documents=False,
    chain_type_kwargs={'prompt': set_custom_prompt(CUSTOM_PROMPT_TEMPLATE)}
)

# STEP 6: Run - Text → Answer
if __name__ == "__main__":
    print("Medical chat (type 'exit' to quit)")
    while True:
        user_query = input("\nEnter your text query (or type 'exit' to quit): ")
        if user_query.lower() == "exit":
            print("Goodbye!")
            break
        response = qa_chain.invoke({'query': user_query})
        print("\nANSWER:\n", response["result"])
