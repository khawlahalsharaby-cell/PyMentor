
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel, Field


# تحميل متغيرات البيئة من backend/.env
load_dotenv(Path(__file__).with_name(".env"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

app = FastAPI(title="PyMentor Backend")

# إعداد الاتصال مع الواجهة الأمامية
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# شكل الرسالة الواحدة
class ChatMessage(BaseModel):
    role: str = "user"
    content: str = ""


# البيانات التي يستقبلها الخادم من الواجهة
class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)
    level: str = "beginner"
    hint_mode: str = "hints"


SYSTEM_PROMPT = """
أنت PyMentor، مساعد تعليمي متخصص في لغة Python والبرمجة للمبتدئين.

قواعدك:
1. اشرح بلغة عربية واضحة وبسيطة.
2. اشرح المفاهيم خطوة بخطوة.
3. استخدم أمثلة قصيرة وصحيحة بلغة Python.
4. وضّح وظيفة الكود ونتيجته.
5. إذا كان السؤال عن خطأ برمجي، ساعد المستخدم على فهم الخطأ وإصلاحه.
6. لا تدّعِ أنك شغّلت الكود فعليًا.
7. ركّز على تعليم Python والبرمجة للمبتدئين.
8. استخدم تنسيقًا واضحًا، وضع الأكواد داخل كتل كود.
"""


def build_prompt(request: ChatRequest) -> str:
    conversation = []

    for msg in request.history[-10:]:
        role = msg.role.lower().strip()

        if role == "user":
            speaker = "المستخدم"
        elif role in ("bot", "assistant", "model"):
            speaker = "PyMentor"
        else:
            # تجاهل أي دور غير معروف
            continue

        conversation.append(f"{speaker}: {msg.content}")

    history_text = (
        "\n".join(conversation)
        if conversation
        else "لا توجد رسائل سابقة."
    )

    return f"""
{SYSTEM_PROMPT}

مستوى المتعلم: {request.level}
إعداد التلميحات: {request.hint_mode}

سجل المحادثة السابق:
{history_text}

السؤال الحالي:
{request.message}

أجب عن السؤال الحالي مباشرة وبأسلوب تعليمي مناسب للمبتدئين.
"""


@app.get("/")
def home():
    return {
        "message": "PyMentor Backend is running",
        "status": "ok"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "api_key_configured": bool(GEMINI_API_KEY)
    }


@app.post("/chat")
def chat(request: ChatRequest):
    question = request.message.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="الرجاء كتابة سؤال أولًا."
        )

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="لم يتم ضبط GEMINI_API_KEY في ملف backend/.env"
        )

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=build_prompt(request),
        )

        reply = response.text

        if not reply or not reply.strip():
            raise HTTPException(
                status_code=502,
                detail="لم يُرجع Gemini إجابة نصية."
            )

        return {"reply": reply.strip()}

    except HTTPException:
        raise

    except Exception as error:
        print("Gemini error:", repr(error))

        raise HTTPException(
            status_code=502,
            detail=(
                "تعذر الحصول على إجابة من Gemini. "
                "تحققي من مفتاح API واسم النموذج والاتصال بالإنترنت."
            ),
        )
