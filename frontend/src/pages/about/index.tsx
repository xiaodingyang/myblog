import React from 'react';
import { Typography, Card, Row, Col, Tag, Space, Divider, Timeline } from 'antd';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import {
  UserOutlined,
  CodeOutlined,
  MailOutlined,
  GithubOutlined,
  RocketOutlined,
  HeartOutlined,
  EnvironmentOutlined,
  BookOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const AboutPage: React.FC = () => {
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);

  const skills = [
    { name: 'JavaScript', level: 95, color: '#f7df1e' },
    { name: 'React.js', level: 95, color: '#61dafb' },
    { name: 'CSS/CSS3', level: 95, color: '#264de4' },
    { name: 'Vue.js', level: 85, color: '#42b883' },
    { name: 'Git', level: 85, color: '#f05032' },
    { name: 'Node.js', level: 80, color: '#339933' },
    { name: 'TypeScript', level: 85, color: '#3178c6' },
    { name: 'Webpack', level: 80, color: '#8dd6f9' },
  ];

  const experiences = [
    {
      year: '2024',
      title: '前端开发工程师',
      company: '成都慢音',
      description: '负责全流量融合分析系统开发，使用 React 18 + TypeScript + Umi v4 构建企业级网络流量分析平台。',
    },
    {
      year: '2020',
      title: '高级前端开发',
      company: '上海携程',
      description: '负责 artnova 大数据统计、cookpit 开发质量统计系统、程长学院 APP 等项目开发。',
    },
    {
      year: '2017',
      title: '初中级前端开发',
      company: '上海精锐教育',
      description: '负责七大报告管理系统、学员管理系统、官网开发迭代等项目。',
    },
    {
      year: '2014',
      title: '软件工程专业',
      company: '成都工业学院',
      description: '本科学历，系统学习软件工程相关知识，开启编程之旅。',
    },
  ];

  return (
    <div className="animate-fade-in py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* 内容区域 - 白色背景，覆盖粒子 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg relative z-10">
          {/* 个人介绍卡片 */}
          <Card
            className="mb-8 overflow-hidden"
            style={{
              borderRadius: 24,
              border: 'none',
              boxShadow: '0 10px 40px -10px rgb(0 0 0 / 0.15)',
            }}
            bodyStyle={{ padding: 0 }}
          >
            {/* 封面背景 */}
            <div
              className="h-40 md:h-48 relative"
              style={{
                background: currentColorTheme.gradient, // 主题色渐变
              }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.3' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* 头像和基本信息 */}
            <div className="px-8 pb-8 -mt-16 relative">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div
                  className="w-32 h-32 rounded-3xl border-4 border-white flex items-center justify-center text-white text-4xl font-bold shadow-lg"
                  style={{
                    background: currentColorTheme.gradient, // 主题色渐变
                  }}
                >
                  <UserOutlined />
                </div>
                <div className="text-center md:text-left flex-1">
                  <span
                    className="text-3xl font-bold block mb-1"
                    style={{
                      background: 'linear-gradient(135deg, #fff 0%, #ffe4b5 50%, #ffd700 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    肖定阳
                  </span>
                  <Text
                    className="text-gray-500 text-lg"
                    style={{
                      textShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    高级前端开发工程师 / 8年经验
                  </Text>
                  <div className="flex items-center gap-4 mt-2 text-gray-400 text-sm flex-wrap justify-center md:justify-start">
                    <span><EnvironmentOutlined className="mr-1" />成都</span>
                    <span><BookOutlined className="mr-1" />成都工业学院 · 软件工程</span>
                  </div>
                </div>
                <Space size="middle" className="mt-4 md:mt-0">
                  <a href="mailto:346629678@qq.com" className="text-2xl text-gray-400 hover:text-primary transition-colors" title="346629678@qq.com">
                    <MailOutlined />
                  </a>
                  <a href="https://github.com/xiaodingyang" target="_blank" rel="noreferrer" className="text-2xl text-gray-400 hover:text-gray-800 transition-colors" title="GitHub">
                    <GithubOutlined />
                  </a>
                  <a
                    href="https://juejin.cn/user/712139266339694"
                    target="_blank"
                    rel="noreferrer"
                    className="text-2xl text-gray-400 transition-colors"
                    title="掘金：风居住de街道"
                    onMouseEnter={(e) => e.currentTarget.style.color = '#1e80ff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  >
                    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
                      <path d="M465.189 161.792c-22.967 18.14-44.325 35.109-47.397 37.376l-5.851 4.242 10.971 8.632c5.997 4.681 26.843 21.065 46.299 36.425l35.254 27.794 45.714-35.986c25.161-19.749 46.006-36.133 46.298-36.425 0.73-0.585-71.095-57.856-86.016-68.681l-8.632-6.437-36.64 28.965v4.095z m-112.933 89.088c-60.343 47.543-111.181 88.503-112.933 90.916-3.072 4.096 1.756 9.070 107.52 110.592l54.857 54.418 54.272-53.687c29.696-29.55 54.564-54.564 54.564-55.734 0-1.17-23.990-20.773-53.249-43.52-29.257-22.747-55.149-43.154-57.563-45.275-2.413-2.267-4.534-3.95-4.68-3.95-0.731 0.146-16.091 12.727-42.788 33.573v-87.333z m-222.72 175.908c-20.334 16.238-37.815 30.428-38.546 31.451-1.317 1.756 15.36 15.214 98.742 79.872 54.125 41.984 99.182 76.654 100.060 76.946 0.877 0.439 42.422-31.598 92.087-71.095l90.331-71.68-47.104-37.083c-25.892-20.48-49.152-38.473-51.565-40.009-3.657-2.413-13.165 4.388-60.050 42.569-30.135 24.576-55.296 44.837-55.88 44.837-0.585 0-25.6-19.456-55.881-43.227-30.281-23.77-56.027-43.374-57.051-43.374-1.17 0-15.214 11.556-35.108 27.502l0.146 4.242-0.181 0.049z m484.864-27.502c-29.55 23.478-54.272 43.52-54.857 44.105-0.585 0.877 6.583 7.168 15.945 14.190l16.969 12.580 37.156-29.257c20.48-16.091 37.376-29.989 37.522-30.866 0.585-1.463-31.89-28.818-34.085-28.818-0.731 0-11.702 8.047-18.578 13.824l-0.072 4.242z m-188.854 76.8c-23.261 18.578-42.715 34.523-43.154 35.4-0.439convergence 0.878 14.482 13.02 33.134 27.209l33.719 25.746 17.115-13.458c9.509-7.46 29.55-23.186 44.763-34.962l27.502-21.358-32.695-25.161c-18.286-13.897-33.865-25.454-34.742-25.454-0.877 0-22.381 13.459-45.642 32.038z m294.326 33.134c-67.584 52.954-123.904 97.28-124.635 98.158-1.024 1.024 10.679 10.971 25.892 22.235 15.214 11.117 53.395 40.594 84.846 65.462l57.051 45.275 48.567-38.327c26.697-21.065 76.654-60.489 110.884-87.625l62.317-49.298-18.578-14.629c-10.24-8.047-20.626-16.384-23.26-18.432-2.56-2.195-31.013-24.869-63.268-50.468-32.11-25.454-59.027-46.592-59.612-46.884-0.585-0.146-32.622 21.796-100.204 74.605v-0.072z m-123.611 13.897c-7.46 5.997-31.744 25.161-53.98 42.569l-40.448 31.744 14.336 11.264c7.899 6.144 20.187 15.799 27.356 21.504l12.873 10.24 55.149-43.446c30.281-23.916 54.857-44.398 54.565-45.568-0.878-2.56-47.25-39.278-50.76-40.155-1.462-0.439-10.094 4.681-19.091 11.848z m-179.931 139.117c-39.424 30.866-86.308 67.876-104.155 82.212l-32.402 25.892 14.775 11.703c8.047 6.29 37.523 29.11 65.316 50.614l50.614 39.278 14.921-11.41c8.194-6.29 20.773-16.237 27.794-22.089l12.873-10.679-43.446-34.085c-23.99-18.578-44.252-34.816-45.13-35.84-1.17-1.609 81.115-66.413 89.307-70.217 1.317-0.731-1.902-3.95-8.924-9.070-5.997-4.388-13.458-10.24-16.53-13.02l-5.559-5.12-19.454 15.067v-13.236z m400.215 32.11c-26.258 20.772-47.98 38.18-48.274 38.765-0.731 1.17 31.89 27.794 35.4 28.818 1.17 0.439 97.426-74.167 99.693-77.239 1.17-1.609-32.768-28.525-35.986-28.525-1.17 0-24.284 17.115-50.833 38.18z m-182.125 53.541l-33.28 26.112 4.827 3.657c2.706 2.121 18.14 14.19 34.377 26.99l29.403 23.187 32.549-25.454c17.847-14.044 32.694-26.112 32.986-26.843 0.732-1.756-63.853-53.103-67.217-53.395-1.317-0.292-16.676 11.41-33.572 25.746h-0.073z m-97.718 76.069c-30.428 23.917-55.588 44.106-56.027 44.837-0.731 1.024 62.025 50.76 65.243 51.638 0.731 0.146 17.554-12.434 37.449-28.087l36.133-28.38-32.841-25.746c-18.14-14.19-33.573-25.892-34.45-25.892-0.877 0.146-17.115 5.267-15.507 11.63z" />
                    </svg>
                  </a>
                </Space>
              </div>

              <Divider />

              <Paragraph
                className="text-gray-600 text-base leading-relaxed"
                style={{
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                }}
              >
                👋 你好！我是肖定阳，一名拥有 8 年经验的前端开发工程师。
                <br /><br />
                曾就职于上海携程、精锐教育等公司，参与过多个大型项目的开发。
                擅长 React、Vue、TypeScript 等前端技术栈，对前端工程化、性能优化有丰富经验。
                <br /><br />
                热爱互联网行业，业余时间活跃于 GitHub、掘金等技术社区。
                掘金账号「<a href="https://juejin.cn/user/712139266339694" target="_blank" rel="noreferrer" className="text-primary hover:underline">风居住de街道</a>」，
                文章展现量 26w+，浏览量 4w+。
                <br /><br />
                工作认真负责，学习能力强，具备良好的团队合作精神。这个博客是我记录技术成长、分享学习心得的地方，希望能对你有所帮助。
              </Paragraph>
            </div>
          </Card>

          <Row gutter={[24, 24]}>
            {/* 技能栈 */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <CodeOutlined className="text-primary" />
                    <span>技能栈</span>
                  </Space>
                }
                style={{
                  borderRadius: 16,
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  height: '100%',
                }}
              >
                <div className="space-y-4">
                  {skills.map(skill => (
                    <div key={skill.name}>
                      <div className="flex justify-between mb-1">
                        <Text
                          strong
                          style={{
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          {skill.name}
                        </Text>
                        <Text
                          className="text-gray-400"
                          style={{
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          {skill.level}%
                        </Text>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${skill.level}%`,
                            background: `linear-gradient(90deg, ${skill.color}, ${skill.color}dd)`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            {/* 经历时间线 */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <RocketOutlined className="text-primary" />
                    <span>成长历程</span>
                  </Space>
                }
                style={{
                  borderRadius: 16,
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  height: '100%',
                }}
              >
                <Timeline
                  items={experiences.map(exp => ({
                    color: currentColorTheme.primary, // 主题色
                    children: (
                      <div className="pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag color="pink">{exp.year}</Tag>
                          <Text
                            strong
                            style={{
                              textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            }}
                          >
                            {exp.title}
                          </Text>
                        </div>
                        <Text
                          className="text-gray-500 text-sm"
                          style={{
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          {exp.company}
                        </Text>
                        <Paragraph
                          className="!mb-0 mt-2 text-gray-600 text-sm"
                          style={{
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          {exp.description}
                        </Paragraph>
                      </div>
                    ),
                  }))}
                />
              </Card>
            </Col>
          </Row>

          {/* 兴趣爱好 */}
          <Card
            className="mt-6"
            title={
              <Space>
                <HeartOutlined className="text-red-500" />
                <span>兴趣爱好</span>
              </Space>
            }
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          >
            <Space wrap size={[16, 16]}>
              {['💻 编程', '📚 技术博客', '🎮 游戏', '🎵 音乐', '📖 阅读', '🏃 跑步', '☕ 咖啡', '🎬 电影'].map(hobby => (
                <Tag
                  key={hobby}
                  className="!px-4 !py-2 !text-base !rounded-full !border-gray-200"
                >
                  {hobby}
                </Tag>
              ))}
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
