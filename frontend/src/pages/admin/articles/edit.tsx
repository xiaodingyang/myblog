import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'umi';
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
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  SendOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { request } from 'umi';
import type { UploadFile } from 'antd/es/upload/interface';
import Loading from '@/components/Loading';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;


const EditArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<API.Category[]>([]);
  const [tags, setTags] = useState<API.Tag[]>([]);
  const [coverList, setCoverList] = useState<UploadFile[]>([]);
  const [article, setArticle] = useState<API.Article | null>(null);
  const [generatingCover, setGeneratingCover] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [articleRes, categoriesRes, tagsRes] = await Promise.all([
          request<API.Response<API.Article>>(`/api/admin/articles/${id}`),
          request<API.Response<API.Category[]>>('/api/categories'),
          request<API.Response<API.Tag[]>>('/api/tags'),
        ]);

        if (articleRes.code === 0) {
          const article = articleRes.data;
          setArticle(article);
          form.setFieldsValue({
            title: article.title,
            summary: article.summary,
            content: article.content,
            category: article.category?._id,
            tags: article.tags?.map(t => t._id),
          });
          if (article.cover) {
            setCoverList([{
              uid: '-1',
              name: 'cover',
              status: 'done',
              url: article.cover,
            }]);
          }
        } else {
          message.error('文章不存在');
          navigate('/admin/articles');
        }

        if (categoriesRes.code === 0) setCategories(categoriesRes.data);
        if (tagsRes.code === 0) setTags(tagsRes.data);
      } catch (error) {
        message.error('获取文章失败');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, navigate, form]);

  const handleSubmit = async (values: any, status: 'draft' | 'published') => {
    setSaving(true);
    try {
      const data = {
        ...values,
        status,
        cover: coverList[0]?.response?.data?.url || coverList[0]?.url || '',
      };

      const res = await request<API.Response<API.Article>>(`/api/admin/articles/${id}`, {
        method: 'PUT',
        data,
      });

      if (res.code === 0) {
        message.success('保存成功');
        navigate('/admin/articles');
      } else {
        message.error(res.message || '保存失败');
      }
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => {
    form.validateFields(['title', 'content']).then(() => {
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
    setGeneratingCover(true);
    try {
      // 使用 waifu.pics API 获取随机动漫图片
      const res = await fetch('https://api.waifu.pics/sfw/waifu');
      const data = await res.json();
      const timestamp = Date.now();

      setCoverList([{
        uid: `-${timestamp}`,
        name: `cover-anime.jpg`,
        status: 'done',
        url: data.url,
      }]);

      message.success('已生成动漫封面图');
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

  if (loading) {
    return <Loading />;
  }

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
              编辑文章
            </Title>
          </div>
        </div>
        <Space>
          <Button icon={<SaveOutlined />} onClick={handleSaveDraft} loading={saving}>
            保存草稿
          </Button>
          <Button type="primary" icon={<SendOutlined />} onClick={handlePublish} loading={saving}>
            {article?.status === 'published' ? '更新文章' : '发布文章'}
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical">
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

              <Form.Item name="summary" label="文章摘要">
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

              <Form.Item name="tags" label="文章标签">
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
                  点击"自动生成"根据标题获取封面，或手动上传
                </Text>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default EditArticlePage;
