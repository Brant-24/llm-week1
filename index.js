// index.js
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const cors = require('@koa/cors');
router.post('/chat', require('./chat'));
router.post('/rewrite', require('./rewrite'));
router.post('/classify', require('./classify'));
router.post('/rag', require('./rag'));
const {load} = require('./loadDocs');
// load();
app.use(cors());
app.use(bodyParser());
app.use(router.routes());
app.listen(3000, () => {
  console.log('LLM service running at http://localhost:3000');
});
