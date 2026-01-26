import React, { useEffect, useState } from 'react';
import { useNavigate } from 'umi';
import {
  Typography,
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Upload,
  Space,
  message,
  Switch,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  SaveOutlined,
  SendOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { request } from 'umi';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// 技术关键词映射表，用于生成更精准的封面图
const TECH_KEYWORDS: Record<string, string[]> = {
  'react': ['react', 'javascript', 'frontend', 'code'],
  'vue': ['vue', 'javascript', 'frontend', 'code'],
  'javascript': ['javascript', 'code', 'programming'],
  'typescript': ['typescript', 'code', 'programming'],
  'node': ['nodejs', 'server', 'backend', 'code'],
  'python': ['python', 'code', 'programming'],
  'java': ['java', 'code', 'programming'],
  'docker': ['docker', 'container', 'server'],
  'mongodb': ['database', 'server', 'data'],
  'mysql': ['database', 'server', 'data'],
  'redis': ['database', 'server', 'cache'],
  'nginx': ['server', 'network', 'web'],
  'linux': ['linux', 'server', 'terminal'],
  'git': ['git', 'code', 'version control'],
  'css': ['css', 'design', 'frontend', 'web'],
  'html': ['html', 'web', 'frontend', 'code'],
  '前端': ['frontend', 'web', 'code', 'design'],
  '后端': ['backend', 'server', 'code', 'database'],
  '部署': ['server', 'cloud', 'devops'],
  '数据库': ['database', 'data', 'server'],
  '算法': ['algorithm', 'code', 'mathematics'],
  '设计': ['design', 'ui', 'creative'],
  '人工智能': ['artificial intelligence', 'ai', 'technology'],
  'ai': ['artificial intelligence', 'ai', 'robot'],
};

// 从标题中提取搜索关键词
const extractKeywords = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  
  // 尝试匹配技术关键词
  for (const [key, values] of Object.entries(TECH_KEYWORDS)) {
    if (lowerTitle.includes(key)) {
      return values[Math.floor(Math.random() * values.length)];
    }
  }
  
  // 默认使用 technology + coding 相关关键词
  const defaultKeywords = ['technology', 'coding', 'computer', 'programming', 'digital'];
  return defaultKeywords[Math.floor(Math.random() * defaultKeywords.length)];
};

const CreateArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<API.Category[]>([]);
  const [tags, setTags] = useState<API.Tag[]>([]);
  const [coverList, setCoverList] = useState<UploadFile[]>([]);
  const [generatingCover, setGeneratingCover] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          request<API.Response<API.Category[]>>('/api/categories'),
          request<API.Response<API.Tag[]>>('/api/tags'),
        ]);
        if (categoriesRes.code === 0) setCategories(categoriesRes.data);
        if (tagsRes.code === 0) setTags(tagsRes.data);
      } catch (error) {
        // ignore
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (values: any, status: 'draft' | 'published') => {
    setLoading(true);
    try {
      const data = {
        ...values,
        status,
        cover: coverList[0]?.response?.data?.url || coverList[0]?.url || '',
      };

      const res = await request<API.Response<API.Article>>('/api/admin/articles', {
        method: 'POST',
        data,
      });

      if (res.code === 0) {
        message.success(status === 'published' ? '发布成功' : '保存成功');
        navigate('/admin/articles');
      } else {
        message.error(res.message || '保存失败');
      }
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    form.validateFields(['title', 'content']).then((values) => {
      handleSubmit(form.getFieldsValue(), 'draft');
    });
  };

  const handlePublish = () => {
    form.validateFields().then((values) => {
      handleSubmit(values, 'published');
    });
  };

  // 自动生成封面图
  const generateCover = async () => {
    const title = form.getFieldValue('title');
    if (!title) {
      message.warning('请先输入文章标题');
      return;
    }
    
    setGeneratingCover(true);
    try {
      const keyword = extractKeywords(title);
      // 使用 Unsplash Source API 获取随机图片
      // 添加时间戳确保每次获取不同图片
      const timestamp = Date.now();
      const imageUrl = `https://source.unsplash.com/1200x630/?${encodeURIComponent(keyword)}&t=${timestamp}`;
      
      // 设置封面
      setCoverList([{
        uid: `-${timestamp}`,
        name: `cover-${keyword}.jpg`,
        status: 'done',
        url: imageUrl,
      }]);
      
      message.success(`已根据"${keyword}"生成封面图`);
    } catch (error) {
      message.error('生成封面失败，请重试');
    } finally {
      setGeneratingCover(false);
    }
  };

  const uploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    listType: 'picture-card' as const,
    fileList: coverList,
    maxCount: 1,
    onChange: ({ fileList }: { fileList: UploadFile[] }) => {
      setCoverList(fileList);
    },
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件');
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/articles')}
          >
            返回
          </Button>
          <div>
            <Title level={3} className="!mb-0">
              新建文章
            </Title>
          </div>
        </div>
        <Space>
          <Button icon={<SaveOutlined />} onClick={handleSaveDraft} loading={loading}>
            保存草稿
          </Button>
          <Button type="primary" icon={<SendOutlined />} onClick={handlePublish} loading={loading}>
            发布文章
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'draft',
        }}
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card
              style={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            >
              <Form.Item
                name="title"
                label="文章标题"
                rules={[{ required: true, message: '请输入文章标题' }]}
              >
                <Input placeholder="请输入文章标题" size="large" />
              </Form.Item>

              <Form.Item
                name="summary"
                label="文章摘要"
              >
                <TextArea
                  placeholder="请输入文章摘要（可选，用于列表展示）"
                  rows={3}
                  showCount
                  maxLength={200}
                />
              </Form.Item>

              <Form.Item
                name="content"
                label="文章内容"
                rules={[{ required: true, message: '请输入文章内容' }]}
              >
                <TextArea
                  placeholder="请输入 Markdown 格式的文章内容"
                  rows={20}
                  className="font-mono"
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="文章设置"
              style={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            >
              <Form.Item
                name="category"
                label="文章分类"
                rules={[{ required: true, message: '请选择文章分类' }]}
              >
                <Select placeholder="请选择分类" allowClear>
                  {categories.map(cat => (
                    <Option key={cat._id} value={cat._id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="tags"
                label="文章标签"
              >
                <Select
                  mode="multiple"
                  placeholder="请选择标签"
                  allowClear
                  maxTagCount={5}
                >
                  {tags.map(tag => (
                    <Option key={tag._id} value={tag._id}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="封面图片">
                <div className="mb-3">
                  <Space>
                    <Button
                      type="primary"
                      ghost
                      icon={<ThunderboltOutlined />}
                      onClick={generateCover}
                      loading={generatingCover}
                    >
                      自动生成
                    </Button>
                    {coverList.length > 0 && (
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={generateCover}
                        loading={generatingCover}
                      >
                        换一张
                      </Button>
                    )}
                  </Space>
                </div>
                <Upload {...uploadProps}>
                  {coverList.length < 1 && (
                    <div>
                      <PlusOutlined />
                      <div className="mt-2">上传封面</div>
                    </div>
                  )}
                </Upload>
                <Text className="text-gray-400 text-xs">
                  点击"自动生成"根据标题获取封面，或手动上传（1200x630，jpg/png，≤5MB）
                </Text>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateArticlePage;
