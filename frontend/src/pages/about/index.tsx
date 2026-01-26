import React from 'react';
import { Typography, Card, Row, Col, Tag, Space, Divider, Timeline } from 'antd';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';
import {
  UserOutlined,
  CodeOutlined,
  MailOutlined,
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  RocketOutlined,
  TrophyOutlined,
  HeartOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const AboutPage: React.FC = () => {
  const { themeId: colorThemeId } = useModel('colorModel');
  const currentColorTheme = getColorThemeById(colorThemeId);
  
  const skills = [
    { name: 'React', level: 90, color: '#61dafb' },
    { name: 'TypeScript', level: 85, color: '#3178c6' },
    { name: 'Node.js', level: 80, color: '#339933' },
    { name: 'Vue', level: 75, color: '#42b883' },
    { name: 'Python', level: 70, color: '#3776ab' },
    { name: 'MongoDB', level: 75, color: '#47a248' },
    { name: 'Docker', level: 65, color: '#2496ed' },
    { name: 'Git', level: 85, color: '#f05032' },
  ];

  const experiences = [
    {
      year: '2024',
      title: '全栈开发工程师',
      company: 'XXX科技公司',
      description: '负责公司核心产品的前后端开发，技术架构设计与优化。',
    },
    {
      year: '2022',
      title: '前端开发工程师',
      company: 'XXX互联网公司',
      description: '参与多个大型项目的前端开发，提升了团队的开发效率。',
    },
    {
      year: '2020',
      title: '开始编程之旅',
      company: '自学成才',
      description: '开始学习编程，从HTML/CSS到JavaScript，一步步成长。',
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
                <Title 
                  level={2} 
                  className="!mb-1"
                  style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  博客作者
                </Title>
                <Text 
                  className="text-gray-500 text-lg"
                  style={{
                    textShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  全栈开发工程师 / 技术爱好者
                </Text>
              </div>
              <Space size="middle" className="mt-4 md:mt-0">
                <a href="mailto:example@email.com" className="text-2xl text-gray-400 hover:text-primary transition-colors">
                  <MailOutlined />
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-2xl text-gray-400 hover:text-gray-800 transition-colors">
                  <GithubOutlined />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-2xl text-gray-400 transition-colors"
                  style={{ '--hover-color': currentColorTheme.primary } as React.CSSProperties & { '--hover-color': string }}
                  onMouseEnter={(e) => e.currentTarget.style.color = currentColorTheme.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}
                >
                  <TwitterOutlined />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-2xl text-gray-400 transition-colors"
                  style={{ '--hover-color': currentColorTheme.primary } as React.CSSProperties & { '--hover-color': string }}
                  onMouseEnter={(e) => e.currentTarget.style.color = currentColorTheme.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}
                >
                  <LinkedinOutlined />
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
              👋 你好！我是一名热爱技术的全栈开发工程师。
              <br /><br />
              热衷于探索新技术，享受解决复杂问题带来的成就感。相信代码可以改变世界，也相信分享可以让世界更美好。
              这个博客是我记录技术成长的地方，希望我的文章能对你有所帮助。
              <br /><br />
              除了编程，我还喜欢阅读、摄影和旅行。生活不只是代码，还有诗和远方。
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
            {['📚 阅读', '📷 摄影', '🎮 游戏', '🎵 音乐', '✈️ 旅行', '🏃 跑步', '☕ 咖啡', '🎬 电影'].map(hobby => (
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
