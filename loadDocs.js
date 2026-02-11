// loadDocs.js
const fs = require('fs');
const {splitText} = require('./chunk');
const {embed} = require('./embedding');
const {addVector} = require('./vectorStore');

async function load() {
  const text = fs.readFileSync('./docs/demo.txt', 'utf-8');
  const chunks = splitText(text);

  for (const chunk of chunks) {
    const vector = await embed(chunk);
    addVector(vector, chunk);
  }

  console.log('📚 文档向量化完成');
}

module.exports = {load};
