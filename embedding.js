// embedding.js

async function embed(text) {
  const res = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      model: 'nomic-embed-text',
      prompt: text
    })
  });

  const data = await res.json();
  console.log(text, data);
  return data.embedding;
}

module.exports = {embed};
