// llm.js

async function callLLM(prompt) {
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      model: 'qwen3:4b',
      prompt,
      stream: false
    })
  });
  console.log('prompt:', prompt);
  const data = await res.json();
  console.log('结果：', data.response);
  return data.response;
}

module.exports = {callLLM};
