import { useState, useCallback } from 'react';
import { message } from 'antd';

const getRequest = () => {
  // @ts-ignore
  return require('umi').request;
};

interface QueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export default function useMessageModel() {
  const [messages, setMessages] = useState<API.Message[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async (params: QueryParams = {}) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.PageResult<API.Message>>>('/api/messages', {
        method: 'GET',
        params: { page: 1, pageSize: 20, ...params },
      });
      if (res.code === 0) {
        setMessages(res.data.list);
        setTotal(res.data.total);
        return res.data;
      }
    } catch (error) {
      message.error('获取留言列表失败');
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  const fetchAdminMessages = useCallback(async (params: QueryParams = {}) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.PageResult<API.Message>>>('/api/admin/messages', {
        method: 'GET',
        params: { page: 1, pageSize: 10, ...params },
      });
      if (res.code === 0) {
        setMessages(res.data.list);
        setTotal(res.data.total);
        return res.data;
      }
    } catch (error) {
      message.error('获取留言列表失败');
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  const submitMessage = useCallback(async (data: { nickname: string; email: string; content: string }) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.Message>>('/api/messages', {
        method: 'POST',
        data,
      });
      if (res.code === 0) {
        message.success('留言提交成功，等待审核');
        return res.data;
      } else {
        message.error(res.message || '留言提交失败');
      }
    } catch (error) {
      message.error('留言提交失败');
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  const reviewMessage = useCallback(async (id: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response<API.Message>>(`/api/admin/messages/${id}/review`, {
        method: 'PUT',
        data: { status },
      });
      if (res.code === 0) {
        message.success(status === 'approved' ? '审核通过' : '已拒绝');
        return res.data;
      } else {
        message.error(res.message || '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const request = getRequest();
      const res = await request<API.Response>(`/api/admin/messages/${id}`, {
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
    messages,
    total,
    loading,
    fetchMessages,
    fetchAdminMessages,
    submitMessage,
    reviewMessage,
    deleteMessage,
  };
}
