import os
import random
from anthropic import Anthropic

# Round-robin across whatever ANTHROPIC_API_KEY_* vars are set in the env.
# Each call bills to one teammate; spreads cost and rate limits.
_KEYS: list[str] = []


def _keys() -> list[str]:
    global _KEYS
    if _KEYS:
        return _KEYS
    # Only accept keys long enough to be real — filters out placeholder "sk-ant-..." values
    _KEYS = [v for k, v in os.environ.items() if k.startswith("ANTHROPIC_API_KEY") and len(v) > 20]
    if not _KEYS:
        raise RuntimeError("No ANTHROPIC_API_KEY_* env vars found")
    return _KEYS


def client() -> Anthropic:
    return Anthropic(api_key=random.choice(_keys()))
