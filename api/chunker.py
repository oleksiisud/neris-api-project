from typing import List

from schemas import ValidationRow
from config import MAX_ROWS_PER_CHUNK


def chunk_rows(rows: List[ValidationRow]) -> List[List[ValidationRow]]:
    chunks = []

    for i in range(0, len(rows), MAX_ROWS_PER_CHUNK):
        chunks.append(rows[i:i + MAX_ROWS_PER_CHUNK])

    return chunks