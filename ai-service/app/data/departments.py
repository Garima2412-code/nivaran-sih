"""
Static configuration for department <-> category <-> sub-category mapping.

This is the single source of truth used to:
  1. Constrain the LLM's classification output (prompt-injected).
  2. Validate/repair whatever the LLM returns so an invalid or
     hallucinated department/category can never leave the API.
  3. Drive SLA duration, escalation levels, and routing info for the
     predictive SLA-risk engine.

Deliberately kept as a plain Python module (not a database) for the
prototype -- swap this module for a DB-backed repository later without
touching any calling code, since callers only use the functions below.
"""

from typing import Dict, List, Optional, TypedDict


class DepartmentConfig(TypedDict):
    sub_categories: List[str]
    sla_hours: int
    routing_office: str
    escalation_levels: List[str]
    default_priority: str


# department -> full configuration
DEPARTMENT_CONFIG: Dict[str, DepartmentConfig] = {
    "Roads": {
        "sub_categories": ["Pothole", "Damaged Road", "Footpath Damage", "Road Obstruction"],
        "sla_hours": 72,
        "routing_office": "Municipal Roads & Infrastructure Office",
        "escalation_levels": ["Junior Engineer", "Assistant Engineer", "Executive Engineer", "Commissioner"],
        "default_priority": "MEDIUM",
    },
    "Water Supply": {
        "sub_categories": ["Water Leakage", "No Water Supply", "Contaminated Water", "Low Water Pressure"],
        "sla_hours": 48,
        "routing_office": "Water Supply & Sewerage Board",
        "escalation_levels": ["Field Technician", "Assistant Engineer", "Executive Engineer", "Commissioner"],
        "default_priority": "HIGH",
    },
    "Sewerage": {
        "sub_categories": ["Sewage Overflow", "Open Manhole", "Blocked Drain", "Drainage Problem"],
        "sla_hours": 24,
        "routing_office": "Water Supply & Sewerage Board",
        "escalation_levels": ["Field Technician", "Assistant Engineer", "Executive Engineer", "Commissioner"],
        "default_priority": "HIGH",
    },
    "Solid Waste Management": {
        "sub_categories": ["Garbage Not Collected", "Illegal Dumping", "Overflowing Garbage Bin"],
        "sla_hours": 48,
        "routing_office": "Solid Waste Management Cell",
        "escalation_levels": ["Sanitation Supervisor", "Health Officer", "Zonal Commissioner"],
        "default_priority": "MEDIUM",
    },
    "Street Lighting": {
        "sub_categories": ["Streetlight Not Working", "Damaged Streetlight"],
        "sla_hours": 72,
        "routing_office": "Electrical Maintenance Division",
        "escalation_levels": ["Lineman", "Junior Engineer", "Assistant Engineer"],
        "default_priority": "MEDIUM",
    },
    "Parks and Horticulture": {
        "sub_categories": ["Park Maintenance", "Fallen Tree", "Overgrown Vegetation"],
        "sla_hours": 96,
        "routing_office": "Parks & Horticulture Department",
        "escalation_levels": ["Gardener Supervisor", "Horticulture Officer", "Zonal Commissioner"],
        "default_priority": "LOW",
    },
    "Building and Town Planning": {
        "sub_categories": ["Illegal Construction", "Building Violation"],
        "sla_hours": 120,
        "routing_office": "Town Planning & Building Regulation Office",
        "escalation_levels": ["Town Planning Inspector", "Assistant Director", "Town Planner", "Commissioner"],
        "default_priority": "MEDIUM",
    },
    "Public Health": {
        "sub_categories": ["Mosquito Infestation", "Public Hygiene", "Public Health Hazard"],
        "sla_hours": 48,
        "routing_office": "Public Health & Sanitation Office",
        "escalation_levels": ["Health Inspector", "Health Officer", "Zonal Commissioner"],
        "default_priority": "MEDIUM",
    },
}

# Backwards-compatible flat "department -> {sub_category: category}" view,
# used by earlier code and prompt generation.
DEPARTMENT_MAP: Dict[str, Dict[str, str]] = {
    dept: {sub: dept for sub in cfg["sub_categories"]}
    for dept, cfg in DEPARTMENT_CONFIG.items()
}

VALID_DEPARTMENTS: List[str] = list(DEPARTMENT_CONFIG.keys())

VALID_PRIORITIES: List[str] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

VALID_RISK_LEVELS: List[str] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

# sub_category -> department, flattened for quick lookup / validation
SUBCATEGORY_TO_DEPARTMENT: Dict[str, str] = {
    sub: dept
    for dept, cfg in DEPARTMENT_CONFIG.items()
    for sub in cfg["sub_categories"]
}

# All valid sub-categories (flat list), used to validate LLM output.
VALID_SUBCATEGORIES: List[str] = list(SUBCATEGORY_TO_DEPARTMENT.keys())


def department_reference_text() -> str:
    """Human-readable block injected into the LLM prompt so the model
    only ever picks from the allowed taxonomy."""
    lines = []
    for dept, cfg in DEPARTMENT_CONFIG.items():
        lines.append(f"- {dept}: {', '.join(cfg['sub_categories'])}")
    return "\n".join(lines)


def resolve_department(sub_category: str, fallback_department: str = "") -> str:
    """Given a sub-category, return its correct department. Falls back to
    `fallback_department` (if valid) or 'Public Health' as a last resort
    catch-all so the API never returns an invented department."""
    if sub_category in SUBCATEGORY_TO_DEPARTMENT:
        return SUBCATEGORY_TO_DEPARTMENT[sub_category]
    if fallback_department in VALID_DEPARTMENTS:
        return fallback_department
    return "Public Health"


def get_department_config(department: str) -> Optional[DepartmentConfig]:
    """Return the full knowledge-base entry for a department, or None if
    the department is not part of the fixed taxonomy."""
    return DEPARTMENT_CONFIG.get(department)


def get_sla_hours(department: str, category: Optional[str] = None) -> int:
    """SLA duration in hours for a department. `category` is accepted for
    forward-compatibility (e.g. per-category SLA overrides) but the
    prototype uses a flat per-department SLA."""
    cfg = DEPARTMENT_CONFIG.get(department)
    if cfg:
        return cfg["sla_hours"]
    return 72  # conservative generic default for unknown/unmapped departments


def get_escalation_levels(department: str) -> List[str]:
    cfg = DEPARTMENT_CONFIG.get(department)
    return cfg["escalation_levels"] if cfg else ["Field Officer", "Department Head"]

