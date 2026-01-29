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
  DownOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { request } from 'umi';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;


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

  // 封面主题配置
  const coverThemes = {
    anime: {
      name: '动漫',
      fetch: async () => {
        const res = await fetch('https://api.waifu.pics/sfw/waifu');
        const data = await res.json();
        return data.url;
      },
    },
    landscape: {
      name: '风景',
      fetch: async () => {
        const random = Math.floor(Math.random() * 1000);
        return `https://picsum.photos/seed/${random}/1200/630`;
      },
    },
    cat: {
      name: '猫咪',
      fetch: async () => {
        const res = await fetch('https://api.thecatapi.com/v1/images/search?size=med');
        const data = await res.json();
        return data[0].url;
      },
    },
    dog: {
      name: '狗狗',
      fetch: async () => {
        const res = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await res.json();
        return data.message;
      },
    },
    neko: {
      name: '猫娘',
      fetch: async () => {
        const res = await fetch('https://api.waifu.pics/sfw/neko');
        const data = await res.json();
        return data.url;
      },
    },
    megumin: {
      name: '惠惠',
      fetch: async () => {
        const res = await fetch('https://api.waifu.pics/sfw/megumin');
        const data = await res.json();
        return data.url;
      },
    },
    grayscale: {
      name: '黑白',
      fetch: async () => {
        const random = Math.floor(Math.random() * 1000);
        return `https://picsum.photos/seed/${random}/1200/630?grayscale`;
      },
    },
    blur: {
      name: '模糊',
      fetch: async () => {
        const random = Math.floor(Math.random() * 1000);
        return `https://picsum.photos/seed/${random}/1200/630?blur=2`;
      },
    },
  };

  // 自动生成封面图
  const generateCover = async (theme: keyof typeof coverThemes = 'anime') => {
    setGeneratingCover(true);
    try {
      const themeConfig = coverThemes[theme];
      const url = await themeConfig.fetch();
      const timestamp = Date.now();

      // 设置封面
      setCoverList([{
        uid: `-${timestamp}`,
        name: `cover-${theme}.jpg`,
        status: 'done',
        url: url,
      }]);

      message.success(`已生成${themeConfig.name}风格封面`);
    } catch (error) {
      message.error('生成封面失败，请重试');
    } finally {
      setGeneratingCover(false);
    }
  };

  // 封面主题菜单
  const coverThemeMenuItems: MenuProps['items'] = Object.entries(coverThemes).map(([key, value]) => ({
    key,
    label: value.name,
    onClick: () => generateCover(key as keyof typeof coverThemes),
  }));

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
          <button
            onClick={() => navigate('/admin/articles')}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              color: '#666',
            }}
          >
            <ArrowLeftOutlined className="transition-transform duration-300 group-hover:-translate-x-1" />
            返回
          </button>
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
                    <Dropdown
                      menu={{ items: coverThemeMenuItems }}
                      trigger={['click']}
                    >
                      <Button
                        type="primary"
                        ghost
                        icon={<ThunderboltOutlined />}
                        loading={generatingCover}
                      >
                        自动生成 <DownOutlined />
                      </Button>
                    </Dropdown>
                    {coverList.length > 0 && (
                      <Dropdown
                        menu={{ items: coverThemeMenuItems }}
                        trigger={['click']}
                      >
                        <Button
                          icon={<ReloadOutlined />}
                          loading={generatingCover}
                        >
                          换一张 <DownOutlined />
                        </Button>
                      </Dropdown>
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
                  选择主题自动生成封面，或手动上传（1200x630，jpg/png，≤5MB）
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
