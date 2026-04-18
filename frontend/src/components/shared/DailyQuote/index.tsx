import React, { useState, useMemo } from 'react';
import { Typography } from 'antd';
import { FONT_SIZE } from '@/styles/designTokens';

const { Text } = Typography;

const QUOTES: { text: string; author: string }[] = [
  { text: '代码是写给人看的，只是偶尔让机器执行一下。', author: 'Donald Knuth' },
  { text: '任何傻瓜都能写出计算机能理解的代码，优秀的程序员写出人能理解的代码。', author: 'Martin Fowler' },
  { text: '先让它工作，再让它正确，最后让它快速。', author: 'Kent Beck' },
  { text: '简单是可靠的先决条件。', author: 'Edsger Dijkstra' },
  { text: '过早优化是万恶之源。', author: 'Donald Knuth' },
  { text: '好的代码本身就是最好的文档。', author: 'Steve McConnell' },
  { text: '程序必须为人而写，只是顺便让机器执行。', author: 'Harold Abelson' },
  { text: '九个人不能在一个月内生出一个孩子。', author: 'Fred Brooks' },
  { text: '调试代码比编写代码难一倍。如果你写代码时已经用尽了聪明才智，那调试时你就没办法了。', author: 'Brian Kernighan' },
  { text: '没有任何技术能比良好的设计原则更能解决性能问题。', author: 'Robert C. Martin' },
  { text: '不要重复你自己（DRY）。每一项知识在系统中都应该有单一的、明确的表示。', author: 'Andy Hunt' },
  { text: '最好的错误消息是永远不会出现的那个。', author: 'Thomas Fuchs' },
  { text: '软件在交付之前，没有任何价值。', author: 'Jeff Atwood' },
  { text: '编程不是关于你知道什么，而是关于你能弄清楚什么。', author: 'Chris Pine' },
  { text: '唯一不变的就是变化。', author: 'Heraclitus' },
  { text: ' Unix 哲学：做一件事，做到极致。', author: 'Doug McIlroy' },
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  { text: '完美不是无可增加，而是无可删减。', author: 'Antoine de Saint-Exupéry' },
  { text: '面向对象编程的麻烦在于，它把可以被共享的状态包装了起来，然后忘记了这个事实。', author: 'Joe Armstrong' },
  { text: '任何可以被自动化的东西，最终都会被自动化。', author: '匿名' },
  { text: '最好的代码是没有代码。', author: 'Jeff Atwood' },
  { text: '写代码就像写作文，要把话说清楚。', author: '匿名' },
  { text: '我们最大的弱点在于放弃。成功的必然之路就是不断地重来一次。', author: 'Thomas Edison' },
  { text: '版本控制是程序员的时间机器。', author: '匿名' },
  { text: '在计算机科学中，只有两件难事：缓存失效和命名。', author: 'Phil Karlton' },
  { text: '好的程序员关心代码，伟大的程序员关心数据结构及其关系。', author: 'Linus Torvalds' },
  { text: '测试是关于信心的。信心越高，部署越从容。', author: '匿名' },
  { text: '抽象是强大的，但不要过度抽象。YAGNI。', author: 'Ron Jeffries' },
  { text: '编程是一种思想的艺术，代码只是它的外在表现形式。', author: '匿名' },
  { text: '持续交付不是目的，持续学习才是。', author: '匿名' },
  { text: '如果你无法简单地解释它，说明你还没有真正理解它。', author: 'Albert Einstein' },
  { text: '每一次重构都是在为未来的自己铺路。', author: 'Martin Fowler' },
];

function getDailyIndex(): number {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return seed % QUOTES.length;
}

const DailyQuote: React.FC = () => {
  const [offset, setOffset] = useState(0);
  const index = useMemo(() => {
    if (offset === 0) return getDailyIndex();
    return (getDailyIndex() + offset) % QUOTES.length;
  }, [offset]);

  const quote = QUOTES[index];

  return (
    <div
      className="text-center max-w-md cursor-pointer select-none"
      onClick={() => setOffset(prev => prev + 1)}
      title="点击换一条"
    >
      <Text
        className="!text-xs md:!text-sm !leading-relaxed italic block"
        style={{ color: 'rgba(255, 255, 255, 0.4)' }}
      >
        "{quote.text}"
      </Text>
      <Text style={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: FONT_SIZE.CAPTION }} className="mt-1 block">
        —— {quote.author}
      </Text>
    </div>
  );
};

export default DailyQuote;
