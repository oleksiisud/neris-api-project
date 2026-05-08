import json

from schemas import ValidationRow


SYSTEM_PROMPT = """
"""

EXAMPLES = """
"""


def build_prompt(rows: list[ValidationRow]) -> str:

    serialized_rows = []

    for row in rows:
        serialized_rows.append({
            "row_id": row.row_id,
            "data": row.data,
            "comments": row.comments
        })

    return f"""
{SYSTEM_PROMPT}

{EXAMPLES}

INPUT:
{json.dumps(serialized_rows, indent=2)}
"""