import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import score, demo, resources, scenario


class UTF8JSONResponse(JSONResponse):
    def render(self, content) -> bytes:
        return json.dumps(content, ensure_ascii=False).encode("utf-8")


app = FastAPI(title="MannChill API", version="0.1.0", default_response_class=UTF8JSONResponse)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(score.router)
app.include_router(demo.router)
app.include_router(resources.router, prefix="/api")
app.include_router(scenario.router)


@app.get("/health")
def health():
    return {"status": "ok"}
