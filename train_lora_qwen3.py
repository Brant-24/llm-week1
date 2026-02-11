from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,BitsAndBytesConfig
)
from peft import LoraConfig, get_peft_model
import torch

MODEL_NAME = "Qwen/Qwen3-4B"

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4"
)

# 1. 加载 tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token

# 2. 加载模型（4bit 量化）
# model = AutoModelForCausalLM.from_pretrained(
#     MODEL_NAME,
#     load_in_4bit=True,
#     device_map="auto",
#     trust_remote_code=True
# )
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True
)

# 3. LoRA 配置
lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# 4. 加载数据
dataset = load_dataset("json", data_files="data/train1.jsonl")["train"]

def format_data(example):
    text = f"""### Instruction:
{example["instruction"]}

### Input:
{example["input"]}

### Response:
{example["output"]}"""

    tokenized = tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=512
    )

    tokenized["labels"] = tokenized["input_ids"].copy()
    return tokenized

# ⚠️ 关键：一定要接住 map 的返回值
dataset = dataset.map(
    format_data,
    remove_columns=dataset.column_names
)

# 5. 训练参数
args = TrainingArguments(
    output_dir="./qwen3-lora",
    per_device_train_batch_size=1,
    gradient_accumulation_steps=8,
    learning_rate=2e-4,
    num_train_epochs=3,
    logging_steps=10,
    save_strategy="epoch",
    fp16=True,
    report_to="none"
)

# 6. Trainer
trainer = Trainer(
    model=model,
    args=args,
    train_dataset=dataset
)

trainer.train()
