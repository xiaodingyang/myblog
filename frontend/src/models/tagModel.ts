import { useState, useCallback } from 'react';
import { message } from 'antd';

const getRequest = () => {
  // @ts-ignore
  return require('umi').request;
};

export default function useTagModel() {
  const [tags, setTags] = useState<API.Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.Tag[]>>('/api/tags');
      if (res.code === 0) {
        setTags(res.data);
        return res.data;
      }
    } catch (error) {
      message.error('获取标签列表失败');
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  const createTag = useCallback(async (data: { name: string }) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.Tag>>('/api/admin/tags', {
        method: 'POST',
        data,
      });
      if (res.code === 0) {
        message.success('创建成功');
        return res.data;
      } else {
        message.error(res.message || '创建失败');
      }
    } catch (error) {
      message.error('创建失败');
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  const updateTag = useCallback(async (id: string, data: { name: string }) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.Tag>>(`/api/admin/tags/${id}`, {
        method: 'PUT',
        data,
      });
      if (res.code === 0) {
        message.success('更新成功');
        return res.data;
      } else {
        message.error(res.message || '更新失败');
      }
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response>(`/api/admin/tags/${id}`, {
        method: 'DELETE',
      });
      if (res.code === 0) {
        message.success('删除成功');
        return true;
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
    return false;
  }, []);

  return {
    tags,
    loading,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
  };
}
