"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ArticleSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ArticleSection: React.FC<ArticleSectionProps> = ({
  title,
  subtitle,
  children
}) => {
  return (
    <section className="py-20 bg-white text-black">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6 tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-xl md:text-2xl text-gray-600 font-serif">{subtitle}</p>
          )}
        </motion.div>
        
        <div className="prose prose-lg max-w-none font-serif">
          {children}
        </div>
      </div>
    </section>
  );
};

export const ArticleParagraph: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.p 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-6 text-lg leading-relaxed text-gray-800"
    >
      {children}
    </motion.p>
  );
};

export const ArticleHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.h3 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-2xl font-serif font-medium mt-12 mb-4 tracking-tight"
    >
      {children}
    </motion.h3>
  );
};

export const ArticleList: React.FC<{ items: string[] }> = ({ items }) => {
  return (
    <motion.ul 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="list-disc pl-6 mb-6 space-y-2 text-gray-800"
    >
      {items.map((item, index) => (
        <li key={index} className="text-lg">{item}</li>
      ))}
    </motion.ul>
  );
};

export const ArticleCallout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.blockquote 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-l-4 border-gray-300 pl-4 italic my-8 text-xl text-gray-600"
    >
      {children}
    </motion.blockquote>
  );
};
