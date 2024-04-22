import subprocess

from flask import Flask, request
from flask_cors import CORS

from pydub import AudioSegment
AudioSegment.converter = '/Users/punya/audio-orchestrator-ffmpeg/bin/ffmpeg'


from dotenv import load_dotenv

import torch
from datasets import load_dataset, Dataset, Audio
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC, pipeline
from openai import OpenAI

from transformers import WhisperForConditionalGeneration

#model = WhisperForConditionalGeneration.from_pretrained("/Users/punya/Speech_to_text_assamese/UI/assamese-speech/whisper")

from transformers import WhisperProcessor

#processor = WhisperProcessor.from_pretrained("/Users/punya/Speech_to_text_assamese/UI/assamese-speech/whisper", language="Assamese", task="transcribe")

load_dotenv()

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})

openai_client = OpenAI()

model_name_to_id = {
    "Indicwav2vec": "/Users/punya/Speech_to_text_assamese/UI/assamese-speech/whisper",
    "Wav2Vec2_xlsr-large-53":"/Users/punya/Speech_to_text_assamese/UI/assamese-speech/xlsr53",
    "Wav2Vec2_xls-r-300m":"/Users/punya/Speech_to_text_assamese/UI/assamese-speech/xlsr300",



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
    if model == "Indicwav2vec":
        text = transcript_wav2vec2(model_name_to_id.get(model), audio_file_path)
    elif model == "Wav2Vec2_xlsr-large-53":
        text = transcript_xlsr53(model_name_to_id.get(model), audio_file_path)
    elif model == "Wav2Vec2_xls-r-300m":
        text = transcript_xlsr_300(model_name_to_id.get(model), audio_file_path)
    elif model == "Whisper-small":
        text = transcript_whisper()
    print(f"Transcripted text: {text}")

    print(f"Clearing transcripted text...")
    text = clear_transcript(text, "Assamese")

    input_language = "Assamese"
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

def transcript_xlsr53(model, audio_file_path):
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


def transcript_xlsr_300(model, audio_file_path):
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
        model="gpt-4-turbo",
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
    #system_prompt = f"You are given a poorly transcripted {input_language} text. It has been transcribed from audio. Some of the words might be broken into multiple words, some might be joined, some of the words might be wrong. Convert it into the closest and most sensible sentence you can based on sound and pronunciation. Reply in {input_language}"
    #system_prompt="I have an Assamese text, transcribed from spoken language, likely in general conversation. It might contain some phonetic errors due to the transcription process. Such as similar sounding characters might be innacurately transcribed, some words might be broken, some might be joined, some phonemes in words might be replaced with similar sounding others and other inaccuracies. You need to correct this text into the most probable correct one.Prefer more common, casual, simple sentences. analyze the text, Give larger preference to phonetically similar and more meaningful sentences. fix it and provide the closest, most sensible and likely translation. Finally Only give this sentence as output in assamese "
    system_prompt="You have to reconstruct the original Assamese sentence from the given text that was automatically transcribed from speech using wav2vec2 or whisper, likely with  some errors: In your reconstruction, prioritize the following: 1. Carefully analyze the phonetic structure of the words and infer the most likely intended words based on Assamese phonology and common sound-to-word mappings 2. Correct any spelling errors or word choice mistakes that may have arisen due to phonetic similarity 3. Ensure the reconstructed sentence is grammatically correct and syntactically sound according to Assamese language rules 4. Preserve the original semantic meaning and intent of the sentence to the best of your understanding 5. If there are multiple possible reconstructions, choose the one that most closely matches the phonetic structure of the transcribed text while still being semantically and grammatically correct The ultimate goal is to produce an Assamese sentence that is as close as possible to the original spoken content in terms of meaning and phonetic structure, even if the exact wording may differ slightly due to the transcription errors."
    user_prompt = f"Fix this {input_language} text and convert it into the closest most likely text so that it makes sense:\n\n {text}. Give only the final Assamese sentence as output"
    text = get_gpt_response(system_prompt, user_prompt)
    return text


def translate(text, input_language, target_language):
    system_prompt = f"You are a helpful assistant that translates text from {input_language} to {target_language}. provide good translation"
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
    #from transformers import WhisperFeatureExtractor

    #feature_extractor = WhisperFeatureExtractor.from_pretrained("openai/whisper-small")

    model = WhisperForConditionalGeneration.from_pretrained("/Users/punya/Speech_to_text_assamese/UI/assamese-speech/whisper")

    processor = WhisperProcessor.from_pretrained("/Users/punya/Speech_to_text_assamese/UI/assamese-speech/whisper", language="Assamese", task="transcribe")

    #pipe = pipeline(task='transcribe', model=model,tokenizer=processor.tokenizer)
    transcribe = pipeline(
        task="automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        chunk_length_s=30,
        device=device,
    )
    transcribe.model.config.forced_decoder_ids = (
        transcribe.tokenizer.get_decoder_prompt_ids(language="as", task="transcribe")
    )

    return transcribe("audio.wav")["text"]
