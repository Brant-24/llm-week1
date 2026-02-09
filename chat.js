// chat.js
const {callLLM} = require('./llm');

module.exports = async (ctx) => {
  const {message} = ctx.request.body;

  const prompt = `
你是一个专业、冷静的 AI 助手
回答要简洁、直接
不要废话

用户问题：
${message}
`;

  const answer = await callLLM(prompt);
  ctx.body = {answer};
};
