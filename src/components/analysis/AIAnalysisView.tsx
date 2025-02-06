import React from 'react';
import { Brain } from 'lucide-react';
import { AIInsights } from './AIInsights';
import { AnalysisProgress } from './AnalysisProgress';
import { MLInsights } from './MLInsights';
import { NLPInsights } from './NLPInsights';
import { PredictiveInsights } from './PredictiveInsights';

interface AIAnalysisViewProps {
  analysis: any;
  isAnalyzing: boolean;
  progress: number;
}

export default function AIAnalysisView({ analysis, isAnalyzing, progress }: AIAnalysisViewProps) {
  if (isAnalyzing) {
    return <AnalysisProgress progress={progress} isAnalyzing={isAnalyzing} />;
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      {analysis.aiInsights && (
        <AIInsights insights={analysis.aiInsights} />
      )}

      {/* ML Analysis */}
      {analysis.mlAnalysis && (
        <MLInsights insights={analysis.mlAnalysis} />
      )}

      {/* NLP Analysis */}
      {analysis.nlpAnalysis && (
        <NLPInsights insights={analysis.nlpAnalysis} />
      )}

      {/* Predictive Analysis */}
      {analysis.predictiveAnalysis && (
        <PredictiveInsights insights={analysis.predictiveAnalysis} />
      )}
    </div>
  );
}