FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    cmake \
    curl \
    libcurl4-openssl-dev \
    pkg-config

WORKDIR /app

RUN git clone --depth 1 https://github.com/ggerganov/llama.cpp.git

WORKDIR /app/llama.cpp/build

RUN cmake .. -DLLAMA_CURL=ON && \
    cmake --build . --config Release -j4

COPY grammars /app/grammars
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

WORKDIR /app
EXPOSE 8080

CMD ["./start.sh"]