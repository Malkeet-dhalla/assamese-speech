from huggingface_hub import snapshot_download

models = ["theainerd/Wav2Vec2-large-xlsr-hindi", "vasista22/whisper-hindi-small"]

for model in models:
    snapshot_download(model)
