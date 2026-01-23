import { useState, useCallback } from 'react';
import { message } from 'antd';

const getRequest = () => {
  // @ts-ignore
  return require('umi').request;
};

export default function useCategoryModel() {
  const [categories, setCategories] = useState<API.Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.Category[]>>('/api/categories');
      if (res.code === 0) {
        setCategories(res.data);
        return res.data;
      }
    } catch (error) {
      message.error('获取分类列表失败');
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  const createCategory = useCallback(async (data: { name: string; description?: string }) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.Category>>('/api/admin/categories', {
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

  const updateCategory = useCallback(async (id: string, data: { name: string; description?: string }) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.Category>>(`/api/admin/categories/${id}`, {
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

  const deleteCategory = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response>(`/api/admin/categories/${id}`, {
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
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
