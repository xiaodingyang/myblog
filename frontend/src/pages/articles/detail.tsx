import React, { useEffect, useState } from 'react';
import { useParams, Link, history } from 'umi';
import { Typography, Tag, Space, Avatar, Divider, Card, Button, Form, Input, message } from 'antd';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import {
  ClockCircleOutlined,
  EyeOutlined,
  FolderOutlined,
  TagOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { request } from 'umi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import dayjs from 'dayjs';
import Loading from '@/components/Loading';
import Empty from '@/components/Empty';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<API.Article | null>(null);
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);
  const [messages, setMessages] = useState<API.Message[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await request<API.Response<API.Article>>(`/api/articles/${id}`);
        if (res.code === 0) {
          setArticle(res.data);
        } else {
          message.error(res.message || '文章不存在');
        }
      } catch (error) {
        message.error('获取文章失败');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const handleSubmitMessage = async (values: { nickname: string; email: string; content: string }) => {
    setSubmitting(true);
    try {
      const res = await request<API.Response<API.Message>>('/api/messages', {
        method: 'POST',
        data: values,
      });
      if (res.code === 0) {
        message.success('留言提交成功，等待审核');
        form.resetFields();
      } else {
        message.error(res.message || '留言提交失败');
      }
    } catch (error) {
      message.error('留言提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success('链接已复制到剪贴板');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!article) {
    return (
      <div className="py-16">
        <Empty
          description="文章不存在或已删除"
          showAction
          actionText="返回文章列表"
          actionLink="/articles"
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* 文章头部 */}
      <section
        className="relative py-16 md:py-24 overflow-hidden"
        style={{
          background: article.cover
            ? `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url(${article.cover}) center/cover no-repeat`
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          {/* 返回按钮 - 玻璃质感 */}
          <button
            onClick={() => history.back()}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/80 mb-6 md:mb-8 transition-all duration-300 hover:text-white hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <ArrowLeftOutlined className="transition-transform duration-300 group-hover:-translate-x-1" />
            返回
          </button>

          {/* 标题 */}
          <Title level={1} className="!text-white !mb-6" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            {article.title}
          </Title>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-white/70 text-sm md:text-base">
            <Space>
              <Avatar
                size={40}
                icon={<UserOutlined />}
                src={article.author?.avatar}
                style={{ background: currentColorTheme.primary }} // 主题色
              />
              <span>{article.author?.username || '匿名'}</span>
            </Space>
            <Space>
              <ClockCircleOutlined />
              <span>{dayjs(article.createdAt).format('YYYY年MM月DD日')}</span>
            </Space>
            <Space>
              <EyeOutlined />
              <span>{article.views || 0} 阅读</span>
            </Space>
          </div>

          {/* 分类 & 标签 */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {/* 分类 */}
            <Link to={`/category/${article.category?._id}`}>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm text-white/90 transition-all duration-300 hover:text-white hover:bg-white/20"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <FolderOutlined />
                {article.category?.name || '未分类'}
              </span>
            </Link>
            {/* 标签 */}
            {article.tags?.map(tag => (
              <Link key={tag._id} to={`/tag/${tag._id}`}>
                <Tag
                  className="!border-white/20 !bg-white/10 !text-white/80 hover:!bg-white/20 transition-colors !m-0"
                >
                  <TagOutlined className="mr-1" />
                  {tag.name}
                </Tag>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 文章内容 */}
      <section className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          >
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !className;
                    return !isInline ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match ? match[1] : 'text'}
                        PreTag="div"
                        customStyle={{
                          margin: '1em 0',
                          borderRadius: '8px',
                          fontSize: '12px',
                          overflowX: 'auto',
                        }}
                        showLineNumbers
                        wrapLines
                        wrapLongLines
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>

            <Divider />

            {/* 分享和操作 */}
            <div className="flex items-center justify-between">
              <Space>
                <Text className="text-gray-500">
                  最后更新于 {dayjs(article.updatedAt).format('YYYY-MM-DD HH:mm')}
                </Text>
              </Space>
              <Button
                type="default"
                icon={<ShareAltOutlined />}
                onClick={handleShare}
              >
                分享
              </Button>
            </div>
          </Card>

          {/* 留言区 */}
          <Card
            className="mt-8"
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          >
            <Title level={4} className="!mb-6">
              💬 发表评论
            </Title>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitMessage}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="nickname"
                  label="昵称"
                  rules={[{ required: true, message: '请输入昵称' }]}
                >
                  <Input placeholder="请输入昵称" size="large" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入正确的邮箱格式' },
                  ]}
                >
                  <Input placeholder="请输入邮箱（不会公开）" size="large" />
                </Form.Item>
              </div>
              <Form.Item
                name="content"
                label="评论内容"
                rules={[
                  { required: true, message: '请输入评论内容' },
                  { min: 5, message: '评论内容至少5个字符' },
                ]}
              >
                <TextArea
                  placeholder="写下你的评论..."
                  rows={4}
                  showCount
                  maxLength={500}
                />
              </Form.Item>
              <Form.Item className="!mb-0">
                <Button type="primary" htmlType="submit" loading={submitting} size="large">
                  提交评论
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ArticleDetailPage;
