import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import score, demo, resources, scenario, voice


class UTF8JSONResponse(JSONResponse):
    def render(self, content) -> bytes:
        return json.dumps(content, ensure_ascii=False).encode("utf-8")


app = FastAPI(title="MannChill API", version="0.1.0", default_response_class=UTF8JSONResponse)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(score.router)
app.include_router(demo.router)
app.include_router(resources.router, prefix="/api")
app.include_router(scenario.router)
app.include_router(voice.router)


@app.get("/health")
def health():
    return {"status": "ok"}
