from typing import Literal
from pydantic import BaseModel, Field


Nation = Literal["UK", "ENG", "SCO", "WAL", "NIR"]


class Citation(BaseModel):
    quote: str
    source: str


class PartyPOV(BaseModel):
    id: str
    name: str
    colour: str
    summary: str = Field(..., max_length=400)
    citations: list[Citation] = Field(..., min_length=1, max_length=3)
    results: list = Field(default_factory=list)


class SearchResponse(BaseModel):
    axisId: str
    axisLabel: str
    parties: list[PartyPOV]


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"


class PersonLink(BaseModel):
    label: str
    url: str


class TimelineEntry(BaseModel):
    type: str
    date: str
    headline: str
    quote: str
    source_label: str
    source_url: str


class PersonResponse(BaseModel):
    id: str
    name: str
    party_id: str
    constituency: str
    role: str
    photo_url: str
    bio: str
    links: list[PersonLink]
    person_summary: str
    citations: list[Citation]
    timeline: list[TimelineEntry]
