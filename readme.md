<div align="center">

# LLM Week1

**基于大语言模型的示例项目**

提供对话、改写、分类、RAG 问答等 HTTP 接口，并支持 Qwen3-4B 的 LoRA 微调  
适合作为 LLM 应用入门与实验

</div>

---

## 目录

- [功能概览](#功能概览)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [API 说明](#api-说明与示例)
- [RAG 流程](#rag-流程简述)
- [前端测试](#前端快速测试)
- [LoRA 微调](#lora-微调)
- [项目结构](#项目结构)
- [注意事项](#注意事项)

---

## 功能概览

| 接口 | 说明 |
|:-----|:-----|
| `POST /chat` | 通用对话，简洁直接回答 |
| `POST /rewrite` | 文案改写，可指定风格（如「自然」） |
| `POST /classify` | 文本分类，返回标签与置信度（技术 / 情感 / 广告 / 垃圾） |
| `POST /rag` | 基于本地文档的检索增强问答，带引用片段 |

---

## 技术栈

| 模块 | 技术 |
|:-----|:-----|
| 后端 | Node.js · Koa · koa-router |
| 大模型 | [Ollama](https://ollama.com/) 本地推理（默认 `qwen3:4b`） |
| 向量与 RAG | `nomic-embed-text` 向量化 · 内存向量库 · 余弦相似度 · 固定长度分块（300 字） |
| 微调 | Python · Transformers · PEFT · Qwen3-4B + LoRA（4bit 量化） |

---

## 快速开始

**1. 安装并启动 [Ollama](https://ollama.com/)**，拉取所需模型：

```bash
ollama pull qwen3:4b
ollama pull nomic-embed-text
```

**2. 安装依赖并启动服务：**

```bash
npm install
node index.js
```

服务运行在 **http://localhost:3000**。看到终端输出「文档向量化完成」即表示 RAG 文档已加载。

**3. RAG 文档（可选）**  
将需要被检索的内容放入 `docs/demo.txt`，启动时会自动加载并向量化。

---

## API 说明与示例

### 对话 · `POST /chat`

| 项 | 说明 |
|:---|:-----|
| 请求体 | `{ "message": "用户问题" }` |
| 响应 | `{ "answer": "模型回复" }` |

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好"}'
```

---

### 改写 · `POST /rewrite`

| 项 | 说明 |
|:---|:-----|
| 请求体 | `{ "message": "原文", "style": "自然" }`（`style` 可选，默认 `"自然"`） |
| 响应 | `{ "result": "改写后的文案" }` |

```bash
curl -X POST http://localhost:3000/rewrite \
  -H "Content-Type: application/json" \
  -d '{"message":"今天天气很好","style":"正式"}'
```

---

### 分类 · `POST /classify`

| 项 | 说明 |
|:---|:-----|
| 请求体 | `{ "message": "待分类文本" }` |
| 响应 | `{ "label": "技术"|"情感"|"广告"|"垃圾", "confidence": 0.95 }` |
| 异常 | 若模型输出非合法 JSON，返回 `{ "error": "...", "raw": "原始输出" }` |

```bash
curl -X POST http://localhost:3000/classify \
  -H "Content-Type: application/json" \
  -d '{"message":"这款产品限时优惠"}'
```

---

### RAG 问答 · `POST /rag`

| 项 | 说明 |
|:---|:-----|
| 请求体 | `{ "message": "你的问题" }` |
| 响应 | `{ "answer": "基于文档的回答", "references": ["片段1", "片段2", ...] }` |

仅根据 `docs/demo.txt` 内容回答；资料中无答案时会回答「不知道」。

```bash
curl -X POST http://localhost:3000/rag \
  -H "Content-Type: application/json" \
  -d '{"message":"文档里的某个问题"}'
```

---

## RAG 流程简述

```
启动时:  loadDocs → chunk(300字) → embed(Ollama) → vectorStore 写入内存
请求时:  问题 → embed → 余弦相似度 top3 → 拼进 prompt → LLM 生成 → 返回 answer + references
```

---

## 前端快速测试

打开项目内的 **`test.html`**（可直接用浏览器打开或通过本地静态服务），确保后端运行在 `http://localhost:3000`，在页面中修改 `axios.post` 的 URL 与 body 即可快速测试各接口。

---

## LoRA 微调

基于 **Qwen/Qwen3-4B**，使用 **LoRA**（`q_proj`、`v_proj`，r=8）与 **4bit 量化** 进行微调。

**数据格式** · `data/train.jsonl`，每行一条 JSON：

```json
{"instruction":"用工程师口吻解释概念","input":"RAG 是什么？","output":"RAG（Retrieval-Augmented Generation）是..."}
```

**依赖**（建议使用虚拟环境，如 `llm-env`）：

```bash
pip install transformers peft datasets torch bitsandbytes
```

**训练：**

```bash
python train_lora_qwen3.py
```

- 权重输出：`qwen3-lora/`，按 epoch 保存（`checkpoint-1`、`checkpoint-2` 等）
- 可调参数：`per_device_train_batch_size`、`num_train_epochs`、`learning_rate` 等（见脚本内 `TrainingArguments`）

---

## 项目结构

```
llm-week1/
├── index.js              # Koa 入口，注册路由，启动时加载文档
├── chat.js               # 对话
├── rewrite.js            # 改写
├── classify.js           # 分类
├── rag.js                # RAG 问答
├── llm.js                # 调用 Ollama /generate
├── embedding.js          # 调用 Ollama /embeddings
├── vectorStore.js        # 内存向量库、余弦相似度检索
├── loadDocs.js           # 加载 docs、分块、向量化
├── chunk.js              # 固定长度分块
├── data/
│   └── train.jsonl       # LoRA 训练数据
├── docs/
│   └── demo.txt          # RAG 使用的文档
├── train_lora_qwen3.py   # LoRA 训练脚本
├── qwen3-lora/           # 训练得到的 LoRA 权重
├── test.html             # 前端接口测试页
└── package.json
```

---

## 注意事项

- **Ollama** 需保持运行，并已拉取 `qwen3:4b`；使用 RAG 时还需 `nomic-embed-text`。
- 向量库为**内存存储**，重启服务后会自动重新加载 `docs/demo.txt`。
- 分类接口依赖模型输出为合法 JSON，若格式不稳定可在 prompt 或后处理中增加约束与容错。
