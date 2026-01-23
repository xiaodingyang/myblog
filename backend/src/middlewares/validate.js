const Joi = require('joi');

/**
 * 创建验证中间件
 * @param {Joi.Schema} schema - Joi schema
 * @param {string} property - 'body' | 'query' | 'params'
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({
        code: 400,
        message: messages[0],
        data: null,
      });
    }

    // 替换为验证后的值
    req[property] = value;
    next();
  };
};

// 通用验证规则
const schemas = {
  // 分页参数
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10),
  }),

  // ObjectId
  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),

  // 用户登录
  login: Joi.object({
    username: Joi.string().required().messages({
      'any.required': '用户名不能为空',
      'string.empty': '用户名不能为空',
    }),
    password: Joi.string().required().messages({
      'any.required': '密码不能为空',
      'string.empty': '密码不能为空',
    }),
  }),

  // 用户注册
  register: Joi.object({
    username: Joi.string().min(2).max(20).required().messages({
      'any.required': '用户名不能为空',
      'string.min': '用户名至少2个字符',
      'string.max': '用户名不能超过20个字符',
    }),
    email: Joi.string().email().required().messages({
      'any.required': '邮箱不能为空',
      'string.email': '请输入有效的邮箱地址',
    }),
    password: Joi.string().min(6).required().messages({
      'any.required': '密码不能为空',
      'string.min': '密码至少6个字符',
    }),
  }),

  // 创建/更新文章
  article: Joi.object({
    title: Joi.string().max(100).required().messages({
      'any.required': '文章标题不能为空',
      'string.max': '标题不能超过100个字符',
    }),
    content: Joi.string().required().messages({
      'any.required': '文章内容不能为空',
    }),
    summary: Joi.string().max(200).allow(''),
    cover: Joi.string().allow(''),
    category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      'any.required': '请选择文章分类',
      'string.pattern.base': '无效的分类 ID',
    }),
    tags: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    status: Joi.string().valid('draft', 'published').default('draft'),
  }),

  // 创建/更新分类
  category: Joi.object({
    name: Joi.string().max(20).required().messages({
      'any.required': '分类名称不能为空',
      'string.max': '分类名称不能超过20个字符',
    }),
    description: Joi.string().max(100).allow(''),
  }),

  // 创建/更新标签
  tag: Joi.object({
    name: Joi.string().max(20).required().messages({
      'any.required': '标签名称不能为空',
      'string.max': '标签名称不能超过20个字符',
    }),
  }),

  // 创建留言
  message: Joi.object({
    nickname: Joi.string().max(20).required().messages({
      'any.required': '昵称不能为空',
      'string.max': '昵称不能超过20个字符',
    }),
    email: Joi.string().email().required().messages({
      'any.required': '邮箱不能为空',
      'string.email': '请输入有效的邮箱地址',
    }),
    content: Joi.string().min(5).max(500).required().messages({
      'any.required': '留言内容不能为空',
      'string.min': '留言内容至少5个字符',
      'string.max': '留言内容不能超过500个字符',
    }),
  }),

  // 审核留言
  reviewMessage: Joi.object({
    status: Joi.string().valid('approved', 'rejected').required().messages({
      'any.required': '请选择审核状态',
      'any.only': '无效的审核状态',
    }),
  }),
};

module.exports = {
  validate,
  schemas,
};
