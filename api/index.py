import sys
from pathlib import Path

# Vercel mounts the function bundle at /var/task/. Adding backend/ to sys.path
# lets `from app.main import app` resolve the same way local uvicorn does
# (uvicorn is invoked from inside backend/, so `app` is the top-level package
# there too). Keeping the import shape identical means no path-aware code in
# the FastAPI app itself.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app  # noqa: F401, E402
