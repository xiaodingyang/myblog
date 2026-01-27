import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import {
  Typography,
  Card,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  message,
  Divider,
  Row,
  Col,
} from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, CameraOutlined } from '@ant-design/icons';
import { request } from 'umi';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarList, setAvatarList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (initialState?.currentUser) {
      profileForm.setFieldsValue({
        username: initialState.currentUser.username,
        email: initialState.currentUser.email,
      });
      if (initialState.currentUser.avatar) {
        setAvatarList([{
          uid: '-1',
          name: 'avatar',
          status: 'done',
          url: initialState.currentUser.avatar,
        }]);
      }
    }
  }, [initialState?.currentUser, profileForm]);

  const handleUpdateProfile = async (values: { username: string; email: string }) => {
    setLoading(true);
    try {
      const data = {
        ...values,
        avatar: avatarList[0]?.response?.data?.url || avatarList[0]?.url || '',
      };

      const res = await request<API.Response<API.User>>('/api/auth/profile', {
        method: 'PUT',
        data,
      });

      if (res.code === 0) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setInitialState({
          ...initialState,
          currentUser: res.data,
        });
        message.success('个人信息更新成功');
      } else {
        message.error(res.message || '更新失败');
      }
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (values: { oldPassword: string; newPassword: string }) => {
    setLoading(true);
    try {
      const res = await request<API.Response>('/api/auth/password', {
        method: 'PUT',
        data: values,
      });

      if (res.code === 0) {
        message.success('密码修改成功');
        passwordForm.resetFields();
      } else {
        message.error(res.message || '密码修改失败');
      }
    } catch (error) {
      message.error('密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    fileList: avatarList,
    maxCount: 1,
    showUploadList: false,
    onChange: ({ fileList }: { fileList: UploadFile[] }) => {
      setAvatarList(fileList);
    },
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件');
        return Upload.LIST_IGNORE;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
  };

  return (
    <div className="animate-fade-in">
      <Title level={3} className="!mb-6">
        个人设置
      </Title>

      <Row gutter={24}>
        <Col xs={24} lg={14}>
          {/* 基本信息 */}
          <Card
            title="基本信息"
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              marginBottom: 24,
            }}
          >
            <div className="flex items-center gap-6 mb-6">
              <Upload {...uploadProps}>
                <div className="relative cursor-pointer group">
                  <Avatar
                    size={80}
                    icon={<UserOutlined />}
                    src={avatarList[0]?.response?.data?.url || avatarList[0]?.url || initialState?.currentUser?.avatar}
                    style={{
                      background: 'linear-gradient(135deg, #1677ff 0%, #722ed1 100%)',
                    }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ 
                      background: '#1677ff',
                      border: '2px solid #fff',
                    }}
                  >
                    <CameraOutlined />
                  </div>
                </div>
              </Upload>
              <div>
                <Text strong className="text-lg block">
                  {initialState?.currentUser?.username}
                </Text>
                <Text className="text-gray-500">
                  {initialState?.currentUser?.email}
                </Text>
              </div>
            </div>

            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleUpdateProfile}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 2, message: '用户名至少2个字符' },
                  { max: 20, message: '用户名不能超过20个字符' },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="请输入用户名"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入正确的邮箱格式' },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="请输入邮箱"
                />
              </Form.Item>

              <Form.Item className="!mb-0">
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* 修改密码 */}
          <Card
            title="修改密码"
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleUpdatePassword}
            >
              <Form.Item
                name="oldPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="请输入当前密码"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="请输入新密码"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="请再次输入新密码"
                />
              </Form.Item>

              <Form.Item className="!mb-0">
                <Button type="primary" htmlType="submit" loading={loading}>
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title="账户信息"
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div className="space-y-4">
              <div className="flex justify-between">
                <Text className="text-gray-500">账户ID</Text>
                <Text className="font-mono">{initialState?.currentUser?._id}</Text>
              </div>
              <Divider className="!my-3" />
              <div className="flex justify-between">
                <Text className="text-gray-500">账户角色</Text>
                <Text>{initialState?.currentUser?.role === 'admin' ? '管理员' : '普通用户'}</Text>
              </div>
              <Divider className="!my-3" />
              <div className="flex justify-between">
                <Text className="text-gray-500">注册时间</Text>
                <Text>
                  {initialState?.currentUser?.createdAt
                    ? new Date(initialState.currentUser.createdAt).toLocaleDateString()
                    : '-'}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
