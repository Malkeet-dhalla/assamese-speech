FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y software-properties-common \ 
 && add-apt-repository ppa:deadsnakes/ppa \
 && apt-get install -y python3.11 python3-pip python3.11-distutils curl ffmpeg \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.11

RUN pip3 --version

RUN python3.11 -m pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 5000

CMD ["python3.11", "-m", "flask", "run", "--host=0.0.0.0", "--debug"]
