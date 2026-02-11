# serve_lora.py
from fastapi import FastAPI
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
from pydantic import BaseModel
import torch

print("===================================")
print("🚀 Starting LoRA inference service")
print("Base model: Qwen/Qwen3-4B")
print("LoRA path: ./qwen3-lora/checkpoint-3")
print("===================================")

app = FastAPI()

BASE = "Qwen/Qwen3-4B"
LORA = "./qwen3-lora/checkpoint-12"

print("🔹 Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(BASE, trust_remote_code=True)
print("✅ Tokenizer loaded")

print("🔹 Loading base model (this may take a while)...")

base_model = AutoModelForCausalLM.from_pretrained(
    BASE,
    torch_dtype=torch.float16,
    trust_remote_code=True
).to("cuda" if torch.cuda.is_available() else "cpu")

print("✅ Base model loaded")

print("🔹 Loading LoRA weights...")
model = PeftModel.from_pretrained(base_model, LORA)
model.eval()
print("✅ LoRA loaded, service ready")
class GenerateRequest(BaseModel):
    prompt: str

@app.post("/generate")
async def generate(req: GenerateRequest):
    prompt = req.prompt
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(
        **inputs,
        max_new_tokens=200,
        do_sample=True,
        temperature=0.7
    )
    text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"response": text}