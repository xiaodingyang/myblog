import React from 'react';
import { motion } from 'framer-motion';
import { EyeOutlined, CalendarOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import './index.less';

interface FavoriteCardProps {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
  };
  views: number;
  date: string;
  onShare?: () => void;
  onClick?: () => void;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({
  title,
  description,
  coverImage,
  category,
  tags,
  author,
  views,
  date,
  onShare,
  onClick,
}) => {
  return (
    <motion.div
      className="favorite-card"
      onClick={onClick}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* 图片区域 */}
      <div className="favorite-card__image-wrapper">
        <img src={coverImage} alt={title} className="favorite-card__image" />
        <div className="favorite-card__image-overlay" />
        <span className="favorite-card__category">{category}</span>
      </div>

      {/* 内容区域 */}
      <div className="favorite-card__content">
        {/* 标题 */}
        <h3 className="favorite-card__title">{title}</h3>

        {/* 描述 */}
        <p className="favorite-card__description">{description}</p>

        {/* 标签 */}
        <div className="favorite-card__tags">
          {tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="favorite-card__tag">
              {tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="favorite-card__tag favorite-card__tag--more">
              +{tags.length - 2}
            </span>
          )}
        </div>

        {/* 底部信息 */}
        <div className="favorite-card__footer">
          <div className="favorite-card__author">
            <Avatar size={24} src={author.avatar} />
            <span className="favorite-card__author-name">{author.name}</span>
          </div>

          <div className="favorite-card__meta">
            <span className="favorite-card__meta-item">
              <EyeOutlined />
              {views}
            </span>
            <span className="favorite-card__meta-item">
              <CalendarOutlined />
              {date}
            </span>
            <motion.button
              className="favorite-card__share-btn"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ShareAltOutlined />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FavoriteCard;
