import React from 'react';
import { motion } from 'framer-motion';

const ExplanationViz = ({ attributions, prediction }) => {
  if (!attributions || attributions.length === 0) return null;

  // Normalize scores for color intensity if needed, but assuming captum scores are raw
  // Simple heuristic: > 0 is suspicious (red), < 0 is safe (green)
  // Or relative to max score.
  
  const maxScore = Math.max(...attributions.map(([, score]) => Math.abs(score)));

  return (
    <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <h3 className="text-xl font-semibold mb-3 text-bny-gold">Explainable AI Analysis</h3>
      <div className="flex flex-wrap gap-2 text-lg leading-relaxed">
        {attributions.map(([word, score], index) => {
          // Calculate opacity based on score magnitude
          const intensity = Math.min(Math.abs(score) / (maxScore || 1), 1);
          
          let bgColor = 'transparent';
          let textColor = 'inherit';
          
          if (score > 0) {
            // Suspicious / Supports Prediction (Spam/Phishing)
            // If prediction is Spam, positive score supports it.
            // Assuming model output 1 is Spam/Phishing.
            bgColor = `rgba(220, 38, 38, ${intensity * 0.8})`; // Red
            textColor = intensity > 0.3 ? 'white' : 'inherit';
          } else {
            // Safe / Opposes Prediction (or supports Ham/Safe)
             bgColor = `rgba(22, 163, 74, ${intensity * 0.8})`; // Green
             textColor = intensity > 0.3 ? 'white' : 'inherit';
          }

          return (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              className="px-1 rounded"
              style={{ backgroundColor: bgColor, color: textColor }}
              title={`Score: ${score.toFixed(4)}`}
            >
              {word}
            </motion.span>
          );
        })}
      </div>
      <div className="mt-4 text-sm text-gray-400">
        <span className="inline-block w-3 h-3 bg-red-600 mr-1"></span> Suspicious
        <span className="inline-block w-3 h-3 bg-green-600 ml-4 mr-1"></span> Safe
      </div>
    </div>
  );
};

export default ExplanationViz;
