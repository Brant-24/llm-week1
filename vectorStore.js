// vectorStore.js
const vectors = [];

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function addVector(vector, text) {
  vectors.push({vector, text});
}

function search(vector, k = 3) {
  return vectors
    .map((item) => ({
      text: item.text,
      score: cosineSimilarity(vector, item.vector)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((item) => item.text);
}

module.exports = {
  addVector,
  search
};
