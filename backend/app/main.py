from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import auth, posts, tags, projects


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="Personal Blog API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(tags.router)
app.include_router(projects.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
