// rag.js
const {embed} = require('./embedding');
const {search} = require('./vectorStore');
const {callLLM} = require('./llm');

module.exports = async (ctx) => {
  const {message} = ctx.request.body;

  const qVector = await embed(message);
  console.log(qVector, 'qVector');
  const contexts = search(qVector);
  console.log(contexts, 'contexts');
  const prompt = `
你是一个问答助手
只能根据「已知资料」回答
如果资料中没有答案，直接说：不知道

已知资料：
${contexts.join('\n---\n')}

问题：
${message}
`;

  ctx.body = {
    answer: await callLLM(prompt),
    references: contexts
  };
};
