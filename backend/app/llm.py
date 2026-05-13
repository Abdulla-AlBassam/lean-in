import os
from openai import OpenAI

# NVIDIA NIM exposes an OpenAI-compatible /v1 endpoint. Free tier covers the
# instruction-tuned Llama models we use for citation extraction. We use the
# OpenAI SDK with base_url overridden rather than importing anthropic.
NIM_BASE_URL = "https://integrate.api.nvidia.com/v1"


def client() -> OpenAI:
    key = os.environ.get("NVIDIA_NIM_API_KEY")
    if not key:
        raise RuntimeError("NVIDIA_NIM_API_KEY not set")
    return OpenAI(base_url=NIM_BASE_URL, api_key=key)
