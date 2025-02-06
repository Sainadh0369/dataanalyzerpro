import { DataField } from '@/types/data';

interface SentimentResult {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

interface TextAnalysis {
  field: string;
  sentiment: SentimentResult;
  keywords: string[];
  topics: string[];
  summary: string;
  metrics: {
    wordCount: number;
    uniqueWords: number;
    avgSentenceLength: number;
  };
}

export class SentimentAnalyzer {
  static async analyzeSentiment(fields: DataField[]): Promise<TextAnalysis[]> {
    const textFields = fields.filter(f => f.type === 'string');
    const analyses: TextAnalysis[] = [];

    for (const field of textFields) {
      const texts = field.value as string[];
      const analysis = await this.analyzeTexts(field.name, texts);
      analyses.push(analysis);
    }

    return analyses;
  }

  private static async analyzeTexts(fieldName: string, texts: string[]): Promise<TextAnalysis> {
    // Aggregate sentiment scores
    const sentiments = texts.map(text => this.getSentimentScore(text));
    const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    const confidence = sentiments.reduce((sum, s) => sum + s.confidence, 0) / sentiments.length;

    // Extract keywords and topics
    const keywords = this.extractKeywords(texts);
    const topics = this.identifyTopics(texts);

    // Calculate metrics
    const metrics = this.calculateTextMetrics(texts);

    return {
      field: fieldName,
      sentiment: {
        score: avgSentiment,
        label: this.getSentimentLabel(avgSentiment),
        confidence
      },
      keywords,
      topics,
      summary: this.generateSummary(texts, avgSentiment, keywords),
      metrics
    };
  }

  private static getSentimentScore(text: string): { score: number; confidence: number } {
    // Simplified sentiment analysis using keyword-based approach
    const positiveWords = new Set([
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'happy', 'satisfied', 'love', 'best', 'awesome', 'perfect'
    ]);

    const negativeWords = new Set([
      'bad', 'poor', 'terrible', 'awful', 'horrible', 'disappointing',
      'unhappy', 'dissatisfied', 'hate', 'worst', 'broken', 'useless'
    ]);

    const words = text.toLowerCase().split(/\W+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.has(word)) positiveCount++;
      if (negativeWords.has(word)) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    if (total === 0) return { score: 0, confidence: 0.5 };

    const score = (positiveCount - negativeCount) / total;
    const confidence = Math.min(0.5 + (total / words.length) * 0.5, 0.95);

    return { score, confidence };
  }

  private static getSentimentLabel(score: number): 'positive' | 'negative' | 'neutral' {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  private static extractKeywords(texts: string[]): string[] {
    const wordFreq = new Map<string, number>();
    const stopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
    ]);

    texts.forEach(text => {
      const words = text.toLowerCase().split(/\W+/);
      words.forEach(word => {
        if (word.length > 2 && !stopWords.has(word)) {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private static identifyTopics(texts: string[]): string[] {
    // Simple topic clustering based on co-occurring words
    const topics = new Map<string, Set<string>>();
    const wordPairs = new Map<string, number>();

    texts.forEach(text => {
      const words = text.toLowerCase().split(/\W+/)
        .filter(w => w.length > 2);
      
      for (let i = 0; i < words.length - 1; i++) {
        for (let j = i + 1; j < words.length; j++) {
          const pair = [words[i], words[j]].sort().join('_');
          wordPairs.set(pair, (wordPairs.get(pair) || 0) + 1);
        }
      }
    });

    // Find strongly connected word pairs
    const strongPairs = Array.from(wordPairs.entries())
      .filter(([_, count]) => count > texts.length * 0.1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return strongPairs.map(([pair]) => 
      pair.split('_').join(' + ')
    );
  }

  private static calculateTextMetrics(texts: string[]) {
    const words = texts.flatMap(text => text.split(/\W+/).filter(w => w.length > 0));
    const sentences = texts.flatMap(text => text.split(/[.!?]+/).filter(s => s.trim().length > 0));

    return {
      wordCount: words.length,
      uniqueWords: new Set(words.map(w => w.toLowerCase())).size,
      avgSentenceLength: words.length / sentences.length
    };
  }

  private static generateSummary(
    texts: string[],
    sentiment: number,
    keywords: string[]
  ): string {
    const sentimentDesc = sentiment > 0.3 ? 'very positive' :
                         sentiment > 0.1 ? 'somewhat positive' :
                         sentiment < -0.3 ? 'very negative' :
                         sentiment < -0.1 ? 'somewhat negative' :
                         'neutral';

    return `Analysis shows ${sentimentDesc} overall sentiment. ` +
           `Key themes include: ${keywords.slice(0, 3).join(', ')}. ` +
           `Based on ${texts.length} entries analyzed.`;
  }
}