// chunk.js
function splitText(text, size = 300) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size;
  }

  return chunks;
}

module.exports = {splitText};
