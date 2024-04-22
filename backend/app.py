import subprocess

from flask import Flask, request
from flask_cors import CORS

from pydub import AudioSegment
from dotenv import load_dotenv

import torch
from datasets import load_dataset, Dataset, Audio
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC, pipeline
from openai import OpenAI

load_dotenv()

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})

openai_client = OpenAI()

model_name_to_id = {
    "indicwav2vec": "theainerd/Wav2Vec2-large-xlsr-hindi",
}

device = "cuda:0" if torch.cuda.is_available() else "cpu"


@app.route("/submit", methods=["POST"])
def submit():
    model = request.form["model"].lower()
    task = request.form["task"].lower()
    is_file = request.form["isFile"]
    audio_file = request.files["audio"]

    audio_file_path = "audio.wav"
    save_audio_file(is_file, audio_file)

    print("Transcripting...")
    text = ""
    if model == "indicwav2vec":
        text = transcript_wav2vec2(model_name_to_id.get(model), audio_file_path)
    elif model == "whisper":
        text = transcript_whisper()
    print(f"Transcripted text: {text}")

    print(f"Clearing transcripted text...")
    text = clear_transcript(text, "Hindi")

    input_language = "Hindi"
    target_language = "English"

    if task == "translate":
        text = translate(text, input_language, target_language)
    elif task == "question":
        text = question(text, input_language)

    # subprocess.call(["rm", "-r", "tmp/audio.wav", "tmp/audio.ogg"])
    return {"output": text}


def save_audio_file(is_file, audio_file):
    if not is_file:
        audio_file.save("audio.ogg")
        ogg_to_wav("audio.ogg", "audio.wav")
    else:
        audio_file.save("audio.wav")


def ogg_to_wav(input_file, output_file):
    audio = AudioSegment.from_ogg(input_file)
    audio.export(output_file, format="wav")


def transcript_wav2vec2(model, audio_file_path):
    audio_dataset = Dataset.from_dict({"audio": [audio_file_path]}).cast_column(
        "audio", Audio(sampling_rate=16_000)
    )
    if model is None:
        model = "facebook/wav2vec2-base-960h"
    # load model and tokenizer
    processor = Wav2Vec2Processor.from_pretrained(model)
    model = Wav2Vec2ForCTC.from_pretrained(model)

    print(audio_dataset[0]["audio"])
    # tokenize
    input_values = processor(
        audio_dataset[0]["audio"]["array"],
        return_tensors="pt",
        padding="longest",
        sampling_rate=16_000,
    ).input_values  # type: ignore

    # retrieve logits
    logits = model(input_values).logits  # type: ignore

    # take argmax and decode
    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)  # type: ignore
    return transcription


def get_gpt_response(system_prompt, user_prompt):
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {"role": "user", "content": user_prompt},
        ],
    )

    text = response.choices[0].message.content.strip()  # type: ignore
    return text


def clear_transcript(text, input_language):
    system_prompt = f"You are given a poorly transcripted {input_language} text. Some of the words are broken into multiple words, some of the words are wrong. Find words that closely match the wrong words. Fix it so it make sense. Reply in {input_language}"
    user_prompt = f"Fix this {input_language} text:\n\n {text}"
    text = get_gpt_response(system_prompt, user_prompt)
    return text


def translate(text, input_language, target_language):
    system_prompt = f"You are a helpful assistant that translates text from {input_language} to {target_language}. provide slightly shorter translations"
    user_prompt = (
        f"Translate these {input_language} text to {target_language}:\n\n{text}"
    )
    text = get_gpt_response(system_prompt, user_prompt)
    return f"{text}"


def question(text, input_language):
    system_prompt = f"You are a helpful assistant that answers question from {input_language} text. Answer questions in {input_language}"
    user_prompt = f"Question:\n\n{text}"
    text = get_gpt_response(system_prompt, user_prompt)
    return f"{text}"


def transcript_whisper():
    transcribe = pipeline(
        task="automatic-speech-recognition",
        model="vasista22/whisper-hindi-small",
        chunk_length_s=30,
        device=device,
    )
    transcribe.model.config.forced_decoder_ids = (
        transcribe.tokenizer.get_decoder_prompt_ids(language="hi", task="transcribe")
    )

    return transcribe("audio.wav")["text"]
