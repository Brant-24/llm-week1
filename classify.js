// classify.js
const {callLLM} = require('./llm');

module.exports = async (ctx) => {
  const {message} = ctx.request.body;

  const prompt = `
你是一个文本分类器
只允许输出 JSON
不要输出多余文字

分类只能是：
["技术","情感","广告","垃圾"]

返回格式：
{
  "label": "...",
  "confidence": 0-1
}

文本：
${message}
`;

  const raw = await callLLM(prompt);

  try {
    ctx.body = JSON.parse(raw);
  } catch {
    ctx.body = {
      error: '模型输出不是合法 JSON',
      raw
    };
  }
};
