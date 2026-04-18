import React from 'react';
import { history } from 'umi';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { BORDER_RADIUS, SPACING, FONT_SIZE } from '@/styles/designTokens';
import './index.less';

interface Article {
  _id: string;
  title: string;
  summary?: string;
  cover?: string;
}

interface ArticleNavigationProps {
  prev: Article | null;
  next: Article | null;
}

const ArticleNavigation: React.FC<ArticleNavigationProps> = ({ prev, next }) => {
  console.log('ArticleNavigation rendered:', { prev, next });

  if (!prev && !next) {
    console.log('ArticleNavigation: both prev and next are null, returning null');
    return null;
  }

  const handleNavigate = (id: string) => {
    history.push(`/article/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="article-navigation">
      {prev ? (
        <div
          className="nav-item prev"
          onClick={() => handleNavigate(prev._id)}
          style={{ borderRadius: BORDER_RADIUS.CARD_LARGE }}
        >
          <div className="nav-icon">
            <LeftOutlined style={{ fontSize: FONT_SIZE.ICON_MEDIUM }} />
          </div>
          <div className="nav-content">
            <div className="nav-label" style={{ fontSize: FONT_SIZE.CAPTION }}>
              上一篇
            </div>
            <div className="nav-title" style={{ fontSize: FONT_SIZE.BODY_LARGE }}>
              {prev.title}
            </div>
            {prev.summary && (
              <div className="nav-summary" style={{ fontSize: FONT_SIZE.BODY_SMALL }}>
                {prev.summary}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="nav-item-placeholder" />
      )}

      {next ? (
        <div
          className="nav-item next"
          onClick={() => handleNavigate(next._id)}
          style={{ borderRadius: BORDER_RADIUS.CARD_LARGE }}
        >
          <div className="nav-content">
            <div className="nav-label" style={{ fontSize: FONT_SIZE.CAPTION }}>
              下一篇
            </div>
            <div className="nav-title" style={{ fontSize: FONT_SIZE.BODY_LARGE }}>
              {next.title}
            </div>
            {next.summary && (
              <div className="nav-summary" style={{ fontSize: FONT_SIZE.BODY_SMALL }}>
                {next.summary}
              </div>
            )}
          </div>
          <div className="nav-icon">
            <RightOutlined style={{ fontSize: FONT_SIZE.ICON_MEDIUM }} />
          </div>
        </div>
      ) : (
        <div className="nav-item-placeholder" />
      )}
    </div>
  );
};

export default ArticleNavigation;
