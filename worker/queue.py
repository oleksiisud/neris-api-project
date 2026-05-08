from redis import Redis
from rq import Queue

from config import REDIS_HOST, REDIS_PORT

redis_conn = Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    decode_responses=True
)

validation_queue = Queue(
    "validation",
    connection=redis_conn
)