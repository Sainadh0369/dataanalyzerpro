import { MarketData, Analysis } from '../types';

export function analyzeDataset(data: MarketData): Analysis {
  const insights = generateInsights(data);
  const recommendations = generateRecommendations(data);
  const { pros, cons } = evaluatePerformance(data);

  return {
    insights,
    recommendations,
    pros,
    cons,
    trends: {},
    score: calculateScore(data),
  };
}

function generateInsights(data: MarketData): string[] {
  const insights = [];
  
  if (data.growthRate > 10) {
    insights.push("Exceptional growth rate indicates strong market position");
  } else if (data.growthRate < 0) {
    insights.push("Negative growth rate requires immediate attention");
  }

  if (data.satisfaction > 80) {
    insights.push("High customer satisfaction suggests strong product-market fit");
  } else if (data.satisfaction < 60) {
    insights.push("Low satisfaction scores indicate need for product improvements");
  }

  if (data.marketShare > 20) {
    insights.push("Significant market share demonstrates competitive advantage");
  }

  return insights;
}

function generateRecommendations(data: MarketData): string[] {
  const recommendations = [];

  if (data.satisfaction < 70) {
    recommendations.push("Implement customer feedback program");
    recommendations.push("Enhance customer support services");
  }

  if (data.growthRate < 5) {
    recommendations.push("Explore new market segments");
    recommendations.push("Invest in marketing campaigns");
  }

  if (data.marketShare < 15) {
    recommendations.push("Develop competitive pricing strategy");
    recommendations.push("Focus on product differentiation");
  }

  return recommendations;
}

function evaluatePerformance(data: MarketData): { pros: string[], cons: string[] } {
  const pros = [];
  const cons = [];

  // Evaluate Revenue
  if (data.revenue > 1000000) {
    pros.push("Strong revenue generation");
  } else {
    cons.push("Revenue below target");
  }

  // Evaluate Customer Base
  if (data.customers > 1000) {
    pros.push("Solid customer base");
  } else {
    cons.push("Limited customer reach");
  }

  // Evaluate Market Share
  if (data.marketShare > 20) {
    pros.push("Dominant market position");
  } else {
    cons.push("Room for market share growth");
  }

  return { pros, cons };
}

function calculateScore(data: MarketData): number {
  const weights = {
    revenue: 0.25,
    customers: 0.2,
    satisfaction: 0.2,
    marketShare: 0.2,
    growthRate: 0.15,
  };

  const normalizedData = {
    revenue: Math.min(data.revenue / 1000000, 1),
    customers: Math.min(data.customers / 1000, 1),
    satisfaction: data.satisfaction / 100,
    marketShare: data.marketShare / 100,
    growthRate: (data.growthRate + 100) / 200,
  };

  return Object.entries(weights).reduce((score, [key, weight]) => {
    return score + normalizedData[key as keyof typeof normalizedData] * weight;
  }, 0) * 100;
}