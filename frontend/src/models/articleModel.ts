import { useState, useCallback } from 'react';
import { message } from 'antd';

const getRequest = () => {
  // @ts-ignore
  return require('umi').request;
};

interface QueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
  tag?: string;
  status?: string;
}

export default function useArticleModel() {
  const [articles, setArticles] = useState<API.Article[]>([]);
  const [article, setArticle] = useState<API.Article | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 获取文章列表（前台）
  const fetchArticles = useCallback(async (params: QueryParams = {}) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.PageResult<API.Article>>>('/api/articles', {
        method: 'GET',
        params: { page: 1, pageSize: 10, ...params },
      });
      
      if (res.code === 0) {
        setArticles(res.data.list);
        setTotal(res.data.total);
        return res.data;
      }
    } catch (error) {
      message.error('获取文章列表失败');
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  // 获取文章列表（后台）
  const fetchAdminArticles = useCallback(async (params: QueryParams = {}) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.PageResult<API.Article>>>('/api/admin/articles', {
        method: 'GET',
        params: { page: 1, pageSize: 10, ...params },
      });
      
      if (res.code === 0) {
        setArticles(res.data.list);
        setTotal(res.data.total);
        return res.data;
      }
    } catch (error) {
      message.error('获取文章列表失败');
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  // 获取文章详情
  const fetchArticle = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.Article>>(`/api/articles/${id}`);
      
      if (res.code === 0) {
        setArticle(res.data);
        return res.data;
      } else {
        message.error(res.message || '获取文章详情失败');
      }
    } catch (error) {
      message.error('获取文章详情失败');
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  // 创建文章
  const createArticle = useCallback(async (data: Partial<API.Article>) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.Article>>('/api/admin/articles', {
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

  // 更新文章
  const updateArticle = useCallback(async (id: string, data: Partial<API.Article>) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.Article>>(`/api/admin/articles/${id}`, {
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

  // 删除文章
  const deleteArticle = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response>(`/api/admin/articles/${id}`, {
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
    articles,
    article,
    total,
    loading,
    fetchArticles,
    fetchAdminArticles,
    fetchArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    setArticle,
  };
}
