"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface FeatureHighlightItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface FeatureHighlightProps {
  title: string;
  subtitle?: string;
  description: string;
  items: FeatureHighlightItem[];
  primaryColor: string;
  secondaryColor: string;
}

export const FeatureHighlight: React.FC<FeatureHighlightProps> = ({
  title,
  description,
  items,
  primaryColor,
  secondaryColor
}) => {
  return (
    <section className="py-12 relative overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b from-background via-background to-${primaryColor}/5 -z-10`} />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            {title.split(' ').map((word, i, arr) => 
              i === arr.length - 1 ? (
                <span key={i} className={`text-transparent bg-clip-text bg-gradient-to-r from-${primaryColor}-500 to-${secondaryColor}-500`}> {word}</span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h2>
          <p className="text-zinc-400 leading-relaxed">{description}</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-${primaryColor}-500/30 transition-all duration-300 group`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${primaryColor}-500/10 mb-4 group-hover:bg-${primaryColor}-500/20 transition-all duration-300`}>
                <span className={`text-${primaryColor}-400`}>{item.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Live demo link removed */}
      </div>
    </section>
  );
};
