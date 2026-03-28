from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import score, demo

app = FastAPI(title="MannChill API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(score.router)
app.include_router(demo.router)


@app.get("/health")
def health():
    return {"status": "ok"}
