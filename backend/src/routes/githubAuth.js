const express = require('express');
const router = express.Router();
const https = require('https');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { GithubUser } = require('../models');
const crypto = require('crypto');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8001';

function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'XiaoDingYang-Blog',
        ...options.headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

const stateStore = new Map();

router.get('/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const returnUrl = req.query.returnUrl || '/';
  stateStore.set(state, { returnUrl, createdAt: Date.now() });

  // 5分钟后自动清理
  setTimeout(() => stateStore.delete(state), 5 * 60 * 1000);

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: 'read:user user:email',
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect(`${FRONTEND_URL}?login_error=missing_code`);
    }

    const stateData = stateStore.get(state);
    if (!stateData) {
      return res.redirect(`${FRONTEND_URL}?login_error=invalid_state`);
    }
    stateStore.delete(state);
    const { returnUrl } = stateData;

    const tokenData = await httpsRequest('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    if (tokenData.error || !tokenData.access_token) {
      console.error('GitHub token exchange failed:', tokenData);
      return res.redirect(`${FRONTEND_URL}?login_error=token_failed`);
    }

    const githubUserInfo = await httpsRequest('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    });

    if (!githubUserInfo.id) {
      console.error('GitHub user info fetch failed:', githubUserInfo);
      return res.redirect(`${FRONTEND_URL}?login_error=user_info_failed`);
    }

    let user = await GithubUser.findOne({ githubId: githubUserInfo.id });
    if (user) {
      if (user.status === 'banned') {
        return res.redirect(`${FRONTEND_URL}?login_error=user_banned`);
      }
      user.nickname = githubUserInfo.name || githubUserInfo.login;
      user.avatar = githubUserInfo.avatar_url || '';
      user.email = githubUserInfo.email || '';
      user.bio = githubUserInfo.bio || '';
      user.htmlUrl = githubUserInfo.html_url || '';
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await GithubUser.create({
        githubId: githubUserInfo.id,
        username: githubUserInfo.login,
        nickname: githubUserInfo.name || githubUserInfo.login,
        avatar: githubUserInfo.avatar_url || '',
        email: githubUserInfo.email || '',
        bio: githubUserInfo.bio || '',
        htmlUrl: githubUserInfo.html_url || '',
        lastLoginAt: new Date(),
      });
    }

    const token = jwt.sign(
      { id: user._id, type: 'github', githubId: user.githubId },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    const userInfo = encodeURIComponent(JSON.stringify({
      _id: user._id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      htmlUrl: user.htmlUrl,
    }));

    const redirectUrl = `${FRONTEND_URL}${returnUrl}`;
    const separator = redirectUrl.includes('?') ? '&' : '?';
    res.redirect(`${redirectUrl}${separator}github_token=${token}&github_user=${userInfo}`);
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    res.redirect(`${FRONTEND_URL}?login_error=server_error`);
  }
});

router.get('/userinfo', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 401, message: '未登录', data: null });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtConfig.secret);

    if (decoded.type !== 'github') {
      return res.status(401).json({ code: 401, message: '无效的用户类型', data: null });
    }

    const user = await GithubUser.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }
    if (user.status === 'banned') {
      return res.status(403).json({ code: 403, message: '账号已被封禁', data: null });
    }

    res.json({ code: 0, message: 'success', data: user });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: '登录已过期', data: null });
    }
    res.status(500).json({ code: 500, message: '服务器错误', data: null });
  }
});

module.exports = router;
