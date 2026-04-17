const {
  tokenizeQuestion,
  scoreChunk,
  pickTopChunks,
  parseModelJson,
  coercePlainAnswerFromModel,
  askArticle,
} = require('../src/services/aiAskService');

jest.mock('../src/services/articleService', () => ({
  getArticle: jest.fn(),
  findPublishedInCategoryExcept: jest.fn().mockResolvedValue([]),
}));

const articleService = require('../src/services/articleService');

describe('aiAskService', () => {
  test('tokenizeQuestion 提取英文与中文', () => {
    const t = tokenizeQuestion('React 18 useMemo 怎么用');
    expect(t.some((x) => x.includes('react'))).toBe(true);
    expect(t.length).toBeGreaterThan(0);
  });

  test('scoreChunk 对关键词打分', () => {
    const tokens = tokenizeQuestion('useMemo');
    const s = scoreChunk('Use useMemo to cache expensive values.', tokens);
    expect(s).toBeGreaterThan(0);
  });

  test('pickTopChunks 优先高分块', () => {
    const chunks = ['alpha beta', 'gamma useMemo delta', 'foo'];
    const top = pickTopChunks(chunks, 'useMemo', 2);
    expect(top[0]).toContain('useMemo');
  });

  test('parseModelJson 解析裸 JSON', () => {
    const p = parseModelJson('{"answer":"hi","citations":[]}');
    expect(p.answer).toBe('hi');
  });

  test('parseModelJson 解析 fenced', () => {
    const p = parseModelJson('```json\n{"answer":"x","citations":[]}\n```');
    expect(p.answer).toBe('x');
  });

  test('parseModelJson 无效返回 null', () => {
    expect(parseModelJson('not json')).toBeNull();
  });

  test('parseModelJson 容忍前缀说明与花括号 JSON', () => {
    const p = parseModelJson('以下为 JSON：\n{"answer":"ok","citations":[]}');
    expect(p?.answer).toBe('ok');
    expect(p?.citations).toEqual([]);
  });

  test('coercePlainAnswerFromModel 接受整段 Markdown', () => {
    const p = coercePlainAnswerFromModel('## 标题\n\n正文一段');
    expect(p?.answer).toContain('标题');
    expect(p?.citations).toEqual([]);
  });

  test('无检索命中且无同分类摘录时走通用模式并调用模型', async () => {
    process.env.AI_API_BASE = 'https://example.com';
    process.env.AI_API_KEY = 'sk-test';
    process.env.AI_CHAT_MODEL = 'gpt-4o-mini';
    articleService.getArticle.mockResolvedValueOnce({
      _id: '507f1f77bcf86cd799439011',
      title: 'T',
      content: 'aaa bbb ccc 无关正文',
      category: { _id: '507f1f77bcf86cd799439099', name: '前端' },
      updatedAt: new Date(),
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          choices: [
            {
              message: {
                content: '{"answer":"通用解答示例","citations":[]}',
              },
            },
          ],
          usage: { total_tokens: 5 },
        }),
    });
    const out = await askArticle({ articleId: '507f1f77bcf86cd799439011', question: 'zzzzqqqq' });
    expect(global.fetch).toHaveBeenCalled();
    expect(out.answer).toContain('通用');
    expect(out.meta.retrievalEmpty).toBe(true);
    expect(out.meta.answerMode).toBe('freeform');
    expect(out.meta.categoryBoostUsed).toBe(false);
    expect(out.citations).toEqual([]);
    expect(articleService.findPublishedInCategoryExcept).toHaveBeenCalled();
  });

  test('scope=article 时本篇无命中不调分类库但走通用模式调模型', async () => {
    process.env.AI_API_BASE = 'https://example.com';
    process.env.AI_API_KEY = 'sk-test';
    process.env.AI_CHAT_MODEL = 'gpt-4o-mini';
    articleService.getArticle.mockResolvedValueOnce({
      _id: '507f1f77bcf86cd799439011',
      title: 'T',
      content: 'aaa bbb ccc',
      category: { _id: '507f1f77bcf86cd799439099', name: '前端' },
      updatedAt: new Date(),
    });
    articleService.findPublishedInCategoryExcept.mockClear();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          choices: [{ message: { content: '{"answer":"仅本篇 scope 通用答","citations":[]}' } }],
          usage: { total_tokens: 3 },
        }),
    });
    const out = await askArticle({
      articleId: '507f1f77bcf86cd799439011',
      question: 'zzzzqqqq',
      scope: 'article',
    });
    expect(articleService.findPublishedInCategoryExcept).not.toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalled();
    expect(out.meta.answerMode).toBe('freeform');
    expect(out.answer).toContain('通用');
  });

  test('本篇无命中时同分类有命中则调用模型', async () => {
    process.env.AI_API_BASE = 'https://example.com';
    process.env.AI_API_KEY = 'sk-test';
    process.env.AI_CHAT_MODEL = 'gpt-4o-mini';
    articleService.getArticle.mockResolvedValueOnce({
      _id: '507f1f77bcf86cd799439011',
      title: '当前篇',
      content: 'aaa bbb ccc 无关正文',
      category: { _id: '507f1f77bcf86cd799439099', name: '前端' },
      updatedAt: new Date(),
    });
    articleService.findPublishedInCategoryExcept.mockResolvedValueOnce([
      {
        _id: '507f1f77bcf86cd799439022',
        title: '另一篇',
        content: '这里详细说明了 zzzzqqqq 的用法和注意事项。',
      },
    ]);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          choices: [
            {
              message: {
                content:
                  '{"answer":"同分类另一文提到 zzzzqqqq 的注意事项。","citations":[{"excerpt":"zzzzqqqq 的用法和注意事项"}]}',
              },
            },
          ],
          usage: { total_tokens: 10 },
        }),
    });
    const out = await askArticle({ articleId: '507f1f77bcf86cd799439011', question: 'zzzzqqqq' });
    expect(global.fetch).toHaveBeenCalled();
    expect(out.meta.retrievalEmpty).toBe(true);
    expect(out.meta.answerMode).toBe('grounded');
    expect(out.meta.categoryBoostUsed).toBe(true);
    expect(out.answer).toContain('zzzzqqqq');
    expect(out.citations.length).toBeGreaterThanOrEqual(1);
    expect(out.citations[0].articleId).toBe('507f1f77bcf86cd799439022');
    expect(out.citations[0].source).toBe('category');
  });

  test('杜撰 excerpt 被过滤', async () => {
    process.env.AI_API_BASE = 'https://example.com';
    process.env.AI_API_KEY = 'sk-test';
    process.env.AI_CHAT_MODEL = 'gpt-4o-mini';
    articleService.getArticle.mockResolvedValueOnce({
      _id: '507f1f77bcf86cd799439011',
      title: 'T',
      content: 'hello useMemo is great for performance tuning',
      updatedAt: new Date(),
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          choices: [
            {
              message: {
                content:
                  '{"answer":"用 useMemo 缓存计算结果","citations":[{"excerpt":"完全杜撰不存在的句子"}]}',
              },
            },
          ],
          usage: { total_tokens: 10 },
        }),
    });
    const out = await askArticle({ articleId: '507f1f77bcf86cd799439011', question: 'useMemo' });
    expect(out.meta.answerMode).toBe('grounded');
    expect(out.citations.length).toBe(0);
    expect(out.answer).toContain('useMemo');
  });
});
