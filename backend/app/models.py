from typing import Literal
from pydantic import BaseModel, Field


Nation = Literal["UK", "ENG", "SCO", "WAL", "NIR"]


class Citation(BaseModel):
    quote: str
    source: str  # e.g. "Labour Manifesto 2024, p.34"


class PartyPOV(BaseModel):
    id: str  # "labour", "conservative", "libdem", "snp", "plaid"
    name: str
    colour: str  # hex
    summary: str = Field(..., max_length=400)
    citations: list[Citation] = Field(..., min_length=1, max_length=3)


class SearchResponse(BaseModel):
    axisId: str
    axisLabel: str
    parties: list[PartyPOV]


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
