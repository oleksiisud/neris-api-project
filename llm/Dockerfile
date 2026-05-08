FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    cmake \
    curl

WORKDIR /app

RUN git clone https://github.com/ggerganov/llama.cpp.git

WORKDIR /app/llama.cpp

RUN make -j4

COPY models ./models
COPY grammars ./grammars
COPY start.sh .

RUN chmod +x start.sh

EXPOSE 8080

CMD ["bash", "start.sh"]