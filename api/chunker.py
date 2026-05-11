from typing import List, Dict, Any
from schemas import ValidationContext


def build_validation_contexts(doc: Dict[str, Any]) -> List[ValidationContext]:
    """
    Chunks NERIS documents into units containing an incident, its specific
    details (Fire/HazMat/Med), and its response logistics.
    """
    contexts = []

    base = doc.get("base", {})

    base_data = {
        "base": base,
        "incident_types": doc.get("incident_types"),
        "dispatch": doc.get("dispatch"),
    }

    contexts.append(
        ValidationContext(
            context_type="base_validation",
            primary_object=base_data,
            related_objects=[],
            comments=["Verify base incident information aligns with incident types and dispatch data."],
            relevant_schema_rules=[
                "Incident types must be consistent with the documented narrative.",
            ],
        )
    )

    if doc.get("fire_detail"):
        fire_detail = doc.get("fire_detail") or {}
        narratives = {
            "narratives": {
                "impediment": base.get("impediment_narrative"),
                "outcome": base.get("outcome_narrative"),
            }
        }
        contexts.append(
            ValidationContext(
                context_type="fire_module_validation",
                primary_object=base_data,
                related_objects=[fire_detail, narratives],
                comments=["Verify if room_of_origin matches narratives."],
                relevant_schema_rules=[
                    "FIRE types require fire_suppression module.",
                    "STRUCTURE_FIRE type requires smoke_alarm, fire_alarm, other_alarm, and fire_suppression modules "
                    "unless all aids are SUPPORT_AID given to another department.",
                    "CONFINED_COOKING_APPLIANCE_FIRE type requires cooking_fire_suppression module.",
                ],
            )
        )

    if doc.get("hazsit_detail"):
        hazsit_detail = doc.get("hazsit_detail") or {}
        contexts.append(
            ValidationContext(
                context_type="hazsit_module_validation",
                primary_object=base_data,
                related_objects=[hazsit_detail],
                comments=[
                    "Verify chemicals list and release details are consistent with disposition.",
                    "Check that evacuated count is populated when applicable.",
                ],
                relevant_schema_rules=[
                    "hazsit_detail only valid when at least one HAZSIT incident type is present.",
                    "release details only populated when release_occurred is True.",
                ],
            )
        )

    if doc.get("medical_details"):
        medical_details = doc.get("medical_details") or []
        contexts.append(
            ValidationContext(
                context_type="medical_module_validation",
                primary_object=base_data,
                related_objects=medical_details if isinstance(medical_details, list) else [medical_details],
                comments=[
                    "Verify patient_care_evaluation aligns with transport_disposition.",
                    "Check that patient_care_report_id is present when transport occurred.",
                ],
                relevant_schema_rules=[
                    "medical_details only valid when at least one MEDICAL incident type is present.",
                ],
            )
        )

    if doc.get("dispatch"):
        dispatch = doc.get("dispatch") or {}
        unit_responses = dispatch.get("unit_responses") or []
        contexts.append(
            ValidationContext(
                context_type="response_logistics_validation",
                primary_object=dispatch,
                related_objects=unit_responses,
                comments=["Check for chronological anomalies in unit timestamps."],
                relevant_schema_rules=[
                    "arrival_condition must align with unit on_scene times.",
                    "canceled_enroute and on_scene are mutually exclusive per unit.",
                ],
            )
        )

    return contexts