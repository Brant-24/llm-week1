from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import torch

BASE = "Qwen/Qwen3-4B"
LORA = "./qwen3-lora/checkpoint-12"

tokenizer = AutoTokenizer.from_pretrained(BASE, trust_remote_code=True)

base = AutoModelForCausalLM.from_pretrained(
    BASE,
    torch_dtype=torch.float16,
    trust_remote_code=True
).to("cuda" if torch.cuda.is_available() else "cpu")

model = PeftModel.from_pretrained(base, LORA)
model.eval()

def ask(q):
    inputs = tokenizer(q, return_tensors="pt").to(model.device)
    out = model.generate(
        **inputs,
        max_new_tokens=80,
        temperature=0.7,
        do_sample=False
    )
    print("Q:", q)
    print("A:", tokenizer.decode(out[0], skip_special_tokens=True))
    print("-" * 50)

ask("你是谁做的？")
ask("你的作者是谁？")
ask("谁开发了你？")
ask("你从哪里来？")