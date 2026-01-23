import { useState, useCallback } from 'react';
import { message } from 'antd';

// 动态导入 request 避免循环依赖
const getRequest = () => {
  // @ts-ignore
  return require('umi').request;
};

export default function useUserModel() {
  const [currentUser, setCurrentUser] = useState<API.User | null>(null);
  const [loading, setLoading] = useState(false);

  // 登录
  const login = useCallback(async (data: { username: string; password: string }) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<{ token: string; user: API.User }>>('/api/auth/login', {
        method: 'POST',
        data,
      });
      
      if (res.code === 0) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        message.success('登录成功');
        return true;
      } else {
        message.error(res.message || '登录失败');
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 注册
  const register = useCallback(async (data: { username: string; email: string; password: string }) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<{ token: string; user: API.User }>>('/api/auth/register', {
        method: 'POST',
        data,
      });
      
      if (res.code === 0) {
        message.success('注册成功');
        return true;
      } else {
        message.error(res.message || '注册失败');
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 退出登录
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    message.success('退出登录成功');
  }, []);

  // 获取当前用户信息
  const fetchCurrentUser = useCallback(async () => {
    try {
      const request = getRequest();
      const res = await request<API.Response<API.User>>('/api/auth/profile');
      if (res.code === 0) {
        setCurrentUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        return res.data;
      }
    } catch (error) {
      // 忽略错误
    }
    return null;
  }, []);

  // 更新用户信息
  const updateProfile = useCallback(async (data: Partial<API.User>) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.User>>('/api/auth/profile', {
        method: 'PUT',
        data,
      });
      
      if (res.code === 0) {
        setCurrentUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        message.success('更新成功');
        return true;
      } else {
        message.error(res.message || '更新失败');
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 修改密码
  const updatePassword = useCallback(async (data: { oldPassword: string; newPassword: string }) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response>('/api/auth/password', {
        method: 'PUT',
        data,
      });
      
      if (res.code === 0) {
        message.success('密码修改成功');
        return true;
      } else {
        message.error(res.message || '密码修改失败');
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    currentUser,
    loading,
    login,
    register,
    logout,
    fetchCurrentUser,
    updateProfile,
    updatePassword,
    setCurrentUser,
  };
}
