from typing import List, Dict, Any, Optional

FIELD_REGISTRY = {
    "fire_spread": {
        "path": "fire_detail.fire_spread",
        "aliases": [
            "spread",
            "spread classification",
            "fire spread"
        ],
        "description": "Extent of fire spread classification (e.g., Confined to room, Confined to structure)",
        "related_fields": [
            "fire_detail.location_detail.area_of_origin",
            "base.outcome_narrative"
        ]
    },
    "evacuated": {
        "path": "hazsit_detail.evacuated",
        "aliases": [
            "evacuation count",
            "number evacuated",
            "people evacuated"
        ],
        "description": "Total number of people evacuated from the incident",
        "related_fields": [
            "base.outcome_narrative",
            "base.people_present"
        ]
    },
    "incident_types": {
        "path": "incident_types",
        "aliases": [
            "type of incident",
            "incident classification"
        ],
        "description": "List of incident types/categories assigned to this record",
        "related_fields": [
            "base.outcome_narrative"
        ]
    },
    "medical_disposition": {
        "path": "medical_details[].transport_disposition",
        "aliases": [
            "transport status",
            "patient disposition"
        ],
        "description": "Final disposition of medical patients (e.g., Transported, Refused)",
        "related_fields": [
            "base.outcome_narrative",
            "dispatch.comments"
        ]
    },
    "cause": {
        "path": "fire_detail.location_detail.cause",
        "aliases": [
            "fire cause",
            "ignition cause"
        ],
        "description": "The cause of the fire (e.g., INCENDIARY, ACCIDENTAL)",
        "related_fields": [
            "fire_detail.investigation_needed",
            "base.outcome_narrative"
        ]
    },
    "sprinkler_presence": {
        "path": "fire_suppression.presence.type",
        "aliases": [
            "sprinkler system",
            "suppression system"
        ],
        "description": "Whether a sprinkler system was present (e.g., PRESENT, NOT_PRESENT)",
        "related_fields": [
            "fire_suppression.operation",
            "base.outcome_narrative"
        ]
    },
    "displacement_count": {
        "path": "base.displacement_count",
        "aliases": [
            "people displaced",
            "businesses displaced"
        ],
        "description": "Number of people or businesses displaced by the incident",
        "related_fields": [
            "base.outcome_narrative"
        ]
    },
    "people_present": {
        "path": "base.people_present",
        "aliases": [
            "occupants",
            "people on site"
        ],
        "description": "Boolean indicating if people were present in the structure",
        "related_fields": [
            "base.outcome_narrative",
            "dispatch.comments"
        ]
    }
}

def get_field_by_path(path: str) -> Optional[Dict[str, Any]]:
    """Retrieves a field definition by its JSON path."""
    for field_name, info in FIELD_REGISTRY.items():
        if info["path"] == path:
            return info
    return None

def resolve_alias(alias: str) -> Optional[str]:
    """Resolves a semantic alias or name to its canonical JSON path."""
    alias_lower = alias.lower()
    for field_name, info in FIELD_REGISTRY.items():
        if alias_lower == field_name.lower():
            return info["path"]
        if alias_lower in [a.lower() for a in info.get("aliases", [])]:
            return info["path"]
    return None

def get_available_fields_summary() -> str:
    """Returns a string summary of available fields for the LLM planner."""
    lines = []
    for field_name, info in FIELD_REGISTRY.items():
        lines.append(f"- {field_name}: {info['description']} (Path: {info['path']})")
    return "\n".join(lines)
