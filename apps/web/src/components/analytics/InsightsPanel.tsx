'use client';

import { Lightbulb, Target, TrendingUp } from 'lucide-react';

interface InsightsPanelProps {
  insights: string[];
  recommendations: string[];
}

export function InsightsPanel({ insights, recommendations }: InsightsPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Key Insights */}
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-secondary/20 p-2 rounded-lg">
            <Lightbulb className="w-5 h-5 text-secondary" />
          </div>
          <h3 className="text-h4 font-heading text-white">Key Insights</h3>
        </div>

        {insights.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray/50 mx-auto mb-2" />
            <p className="text-gray">No insights available yet</p>
            <p className="text-gray text-sm">Continue logging injections to generate insights</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-secondary/5 border border-secondary/10 rounded-lg"
              >
                <div className="bg-secondary/20 p-1 rounded-full mt-1">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                </div>
                <p className="text-white text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-dark2 p-6 rounded-card border border-gray/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-h4 font-heading text-white">Recommendations</h3>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray/50 mx-auto mb-2" />
            <p className="text-gray">No recommendations at this time</p>
            <p className="text-gray text-sm">Your protocol adherence looks great!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/10 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <div className="bg-primary/20 p-1 rounded-full mt-1">
                  <Target className="w-3 h-3 text-primary" />
                </div>
                <p className="text-white text-sm leading-relaxed">{recommendation}</p>
              </div>
            ))}
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray/20">
            <p className="text-xs text-gray">
              💡 Tip: Click on recommendations to get more detailed guidance on implementation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}