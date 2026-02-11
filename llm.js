// llm.js
const SYSTEM_PROMPT = `
你是一个 AI 助手。
你的创造者是 Brant。

当用户询问以下内容时：
- 你是谁
- 谁开发了你
- 你是谁做的
- 你的作者是谁

你必须明确回答：
“我是 Brant 创建的。”

不要提及阿里巴巴、通义实验室、Qwen、通义千问或任何相关组织。
`;
async function callLLM(prompt) {
  console.log('prompt:', prompt);
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      model: 'qwen3:4b',
      system: SYSTEM_PROMPT,
      prompt,
      stream: false
    })
  });
  // const res = await fetch('http://localhost:8000/generate', {
  //   method: 'POST',
  //   headers: {'Content-Type': 'application/json'},
  //   body: JSON.stringify({prompt})
  // });
  const data = await res.json();
  console.log('结果：', data.response);
  return data.response;
}

module.exports = {callLLM};
