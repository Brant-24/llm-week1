// rewrite.js
const {callLLM} = require('./llm');

module.exports = async (ctx) => {
  const {message, style = '自然'} = ctx.request.body;

  const prompt = `
你是一个文案改写助手
保持原意
语言更${style}
不增加新信息

原文：
${message}
`;

  ctx.body = {
    result: await callLLM(prompt)
  };
};
