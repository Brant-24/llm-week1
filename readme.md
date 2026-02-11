# LLM Week1

基于大语言模型的示例项目：提供对话、改写、分类、RAG 问答等 HTTP 接口，并支持 Qwen3-4B 的 LoRA 微调。适合作为 LLM 应用入门与实验。

---

## 功能概览

| 接口             | 说明                                              |
| ---------------- | ------------------------------------------------- |
| `POST /chat`     | 通用对话，简洁直接回答                            |
| `POST /rewrite`  | 文案改写，可指定风格（如「自然」）                |
| `POST /classify` | 文本分类，返回标签与置信度（技术/情感/广告/垃圾） |
| `POST /rag`      | 基于本地文档的检索增强问答，带引用片段            |

---

## 技术栈

- **后端**：Node.js + Koa + koa-router
- **大模型**：通过 [Ollama](https://ollama.com/) 调用本地模型（默认 `qwen3:4b`）
- **向量与 RAG**：Ollama `nomic-embed-text` 做向量化，内存向量库 + 余弦相似度检索，固定长度分块（默认 300 字）
- **微调**：Python + Transformers + PEFT，Qwen3-4B + LoRA（4bit 量化，BitsAndBytes）

---

## 环境准备

1. **安装并启动 Ollama**（需先安装 [Ollama](https://ollama.com/)），并拉取模型：
   ```bash
   ollama pull qwen3:4b
   ollama pull nomic-embed-text
   ```

2. **安装 Node 依赖**：
   ```bash
   npm install
   ```

3. **RAG 文档**：将需要被检索的文档内容放入 `docs/demo.txt`，启动服务时会自动加载、分块并向量化到内存。

---

## 运行服务

```bash
node index.js
```

服务运行在 **http://localhost:3000**。启动时会输出「文档向量化完成」表示 RAG 文档已加载。

---

## API 说明与示例

### 1. 对话 `POST /chat`

**请求体**：`{ "message": "用户问题" }`

**响应**：`{ "answer": "模型回复" }`

```bash
curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" -d "{\"message\":\"你好\"}"
```

### 2. 改写 `POST /rewrite`

**请求体**：`{ "message": "原文", "style": "自然" }`（`style` 可选，默认 `"自然"`）

**响应**：`{ "result": "改写后的文案" }`

```bash
curl -X POST http://localhost:3000/rewrite -H "Content-Type: application/json" -d "{\"message\":\"今天天气很好\",\"style\":\"正式\"}"
```

### 3. 分类 `POST /classify`

**请求体**：`{ "message": "待分类文本" }`

**响应**：`{ "label": "技术"|"情感"|"广告"|"垃圾", "confidence": 0.95 }`  
若模型输出不是合法 JSON，则返回 `{ "error": "...", "raw": "原始输出" }`。

```bash
curl -X POST http://localhost:3000/classify -H "Content-Type: application/json" -d "{\"message\":\"这款产品限时优惠\"}"
```

### 4. RAG 问答 `POST /rag`

**请求体**：`{ "message": "你的问题" }`

**响应**：`{ "answer": "基于文档的回答", "references": ["片段1", "片段2", ...] }`  
仅根据 `docs/demo.txt` 内容回答；若资料中无答案，模型会回答「不知道」。

```bash
curl -X POST http://localhost:3000/rag -H "Content-Type: application/json" -d "{\"message\":\"文档里的某个问题\"}"
```

---

## RAG 流程简述

1. **启动时**：`loadDocs.js` 读取 `docs/demo.txt` → `chunk.js` 按 300 字分块 → `embedding.js` 调用 Ollama 得到每块向量 → `vectorStore.js` 存入内存。
2. **请求时**：用户问题先向量化，在向量库中按余弦相似度取 top 3 片段，拼进 prompt 再调用 `llm.js` 生成答案，并返回答案和引用片段。

---

## 前端快速测试

项目内 `test.html` 使用 axios 调用上述接口。用浏览器打开 `test.html`（或通过本地静态服务打开），并确保后端运行在 `http://localhost:3000`，修改其中 `axios.post` 的 URL 和 body 即可测试不同接口。

---

## LoRA 微调

基于 **Qwen/Qwen3-4B**，使用 **LoRA**（`q_proj`、`v_proj`，r=8）与 **4bit 量化** 进行微调。

### 数据格式

训练数据为 `data/train.jsonl`，每行一条 JSON：

```json
{"instruction":"用工程师口吻解释概念","input":"RAG 是什么？","output":"RAG（Retrieval-Augmented Generation）是..."}
```

### Python 依赖

建议使用虚拟环境（如项目内 `llm-env`）：

```bash
pip install transformers peft datasets torch bitsandbytes
```

### 训练

```bash
python train_lora_qwen3.py
```

- 输出目录：`qwen3-lora/`，按 epoch 保存 checkpoint（如 `checkpoint-1`、`checkpoint-2`）。
- 脚本内可调整：`per_device_train_batch_size`、`num_train_epochs`、`learning_rate` 等。

---

## 项目结构

```
├── index.js              # Koa 入口，注册路由，启动时 load 文档
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
├── qwen3-lora/           # 训练得到的 LoRA 权重（checkpoint-*）
├── test.html             # 前端接口测试页
└── package.json
```

---

## 注意事项

- 所有生成类接口依赖 **Ollama 已启动** 且已拉取 `qwen3:4b`；RAG 还需 `nomic-embed-text`。
- 向量库为**内存存储**，重启服务后需重新加载文档。
- 分类接口依赖模型输出为 JSON，若格式不稳定可在 prompt 或后处理中再约束或容错。
