import subprocess

from flask import Flask, request
from flask_cors import CORS

from pydub import AudioSegment

import torch
from datasets import load_dataset, Dataset, Audio
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC


app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})


@app.route("/")
def hello_world():
    return "<p>Hello, world!</p>"


@app.route("/submit", methods=["POST"])
def submit():
    model = request.form["model"]
    task = request.form["task"]
    is_file = request.form["isFile"]
    audio_file = request.files["audio"]
    print("Converting audio..")
    if not is_file:
        audio_file.save("tmp/audio.ogg")
        ogg_to_wav("tmp/audio.ogg", "tmp/audio.wav")
    else:
        audio_file.save("tmp/audio.wav")

    print("Transcripting...")
    audio_dataset = Dataset.from_dict({"audio": ["tmp/audio.wav"]}).cast_column(
        "audio", Audio(sampling_rate=16_000)
    )
    text = transcript(model, audio_dataset)
    if task == "translate":
        text = translate(text)
    elif task == "conversation":
        text = conversation(text)

    # subprocess.call(["rm", "-r", "tmp/audio.wav", "tmp/audio.ogg"])
    return {"output": text}


def ogg_to_wav(input_file, output_file):
    audio = AudioSegment.from_ogg(input_file)
    audio.export(output_file, format="wav")


def transcript(model, audio_dataset):
    # load model and tokenizer
    processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
    model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-base-960h")

    print(audio_dataset[0]["audio"])
    # tokenize
    input_values = processor(
        audio_dataset[0]["audio"]["array"],
        return_tensors="pt",
        padding="longest",
        sampling_rate=16_000,
    ).input_values  # Batch size 1

    # retrieve logits
    logits = model(input_values).logits

    # take argmax and decode
    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)
    return transcription


def translate(text):
    return f"Translated: {text}"


def conversation(text):
    return f"Conversation {text}"
