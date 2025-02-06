import { DataField } from '@/types/data';
import { createError } from '@/utils/core/error';
import { CustomModelManager } from '../ai/customModels';
import { SentimentAnalyzer } from '../nlp/sentimentAnalyzer';
import { HealthcareAnalyzer } from '../industry/healthcare';
import { RetailAnalyzer } from '../industry/retail';
import { FinanceAnalyzer } from '../industry/finance';

interface SystemMetrics {
  performance: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  reliability: {
    uptime: number;
    errorRate: number;
    successRate: number;
  };
  features: {
    active: string[];
    disabled: string[];
    health: Record<string, 'healthy' | 'degraded' | 'failed'>;
  };
}

export class SystemManager {
  private static instance: SystemManager;
  private metrics: SystemMetrics;
  private featureFlags: Map<string, boolean>;
  private healthChecks: Map<string, () => Promise<boolean>>;
  private startTime: number;

  private constructor() {
    this.startTime = Date.now();
    this.metrics = {
      performance: {
        responseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      },
      reliability: {
        uptime: 0,
        errorRate: 0,
        successRate: 100
      },
      features: {
        active: [],
        disabled: [],
        health: {}
      }
    };
    this.featureFlags = new Map();
    this.healthChecks = new Map();
    this.initializeHealthChecks();
  }

  static getInstance(): SystemManager {
    if (!SystemManager.instance) {
      SystemManager.instance = new SystemManager();
    }
    return SystemManager.instance;
  }

  private initializeHealthChecks() {
    // Core Analysis
    this.healthChecks.set('core_analysis', async () => {
      try {
        const testField: DataField = {
          name: 'test',
          type: 'number',
          value: [1, 2, 3]
        };
        const result = await this.analyzeData([testField]);
        return !!result;
      } catch {
        return false;
      }
    });

    // Custom Models
    this.healthChecks.set('custom_models', async () => {
      try {
        await CustomModelManager.listModels();
        return true;
      } catch {
        return false;
      }
    });

    // Sentiment Analysis
    this.healthChecks.set('sentiment_analysis', async () => {
      try {
        const testField: DataField = {
          name: 'test',
          type: 'string',
          value: ['This is a test']
        };
        const result = await SentimentAnalyzer.analyzeSentiment([testField]);
        return !!result;
      } catch {
        return false;
      }
    });
  }

  async performHealthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    for (const [feature, check] of this.healthChecks.entries()) {
      results[feature] = await check();
      this.metrics.features.health[feature] = results[feature] ? 'healthy' : 'failed';
    }
    return results;
  }

  async analyzeData(fields: DataField[], options?: {
    industryType?: 'healthcare' | 'retail' | 'finance';
  }): Promise<any> {
    const startTime = performance.now();
    try {
      let result;

      // Industry-specific analysis
      if (options?.industryType) {
        switch (options.industryType) {
          case 'healthcare':
            result = {
              outcomes: await HealthcareAnalyzer.analyzePatientOutcomes(fields),
              treatments: await HealthcareAnalyzer.analyzeTreatmentEffectiveness(fields)
            };
            break;
          case 'retail':
            result = {
              inventory: await RetailAnalyzer.analyzeInventory(fields),
              sales: await RetailAnalyzer.analyzeSalesTrends(fields)
            };
            break;
          case 'finance':
            result = {
              fraud: await FinanceAnalyzer.detectFraud(fields),
              risk: await FinanceAnalyzer.analyzeRisk(fields)
            };
            break;
        }
      }

      // Update metrics
      const endTime = performance.now();
      this.updateMetrics({
        responseTime: endTime - startTime,
        success: true
      });

      return result;
    } catch (error) {
      this.updateMetrics({
        responseTime: performance.now() - startTime,
        success: false
      });
      throw error;
    }
  }

  private updateMetrics(data: { responseTime: number; success: boolean }) {
    // Update performance metrics
    this.metrics.performance.responseTime = data.responseTime;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.performance.memoryUsage = 
        (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }

    // Update reliability metrics
    this.metrics.reliability.uptime = 
      (Date.now() - this.startTime) / 1000; // seconds
    if (data.success) {
      this.metrics.reliability.successRate = 
        (this.metrics.reliability.successRate * 99 + 100) / 100;
      this.metrics.reliability.errorRate = 
        (this.metrics.reliability.errorRate * 99) / 100;
    } else {
      this.metrics.reliability.successRate = 
        (this.metrics.reliability.successRate * 99) / 100;
      this.metrics.reliability.errorRate = 
        (this.metrics.reliability.errorRate * 99 + 100) / 100;
    }
  }

  getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  setFeatureFlag(feature: string, enabled: boolean) {
    this.featureFlags.set(feature, enabled);
    if (enabled) {
      this.metrics.features.active.push(feature);
      this.metrics.features.disabled = 
        this.metrics.features.disabled.filter(f => f !== feature);
    } else {
      this.metrics.features.disabled.push(feature);
      this.metrics.features.active = 
        this.metrics.features.active.filter(f => f !== feature);
    }
  }

  isFeatureEnabled(feature: string): boolean {
    return this.featureFlags.get(feature) ?? false;
  }

  async validateSystem(): Promise<boolean> {
    try {
      // Perform health checks
      const healthResults = await this.performHealthCheck();
      const allHealthy = Object.values(healthResults).every(result => result);

      // Check system resources
      const metrics = this.getMetrics();
      const resourcesOk = 
        metrics.performance.memoryUsage < 90 && // Less than 90% memory usage
        metrics.performance.responseTime < 5000 && // Less than 5s response time
        metrics.reliability.errorRate < 5; // Less than 5% error rate

      return allHealthy && resourcesOk;
    } catch (error) {
      console.error('System validation failed:', error);
      return false;
    }
  }

  async recoverFromError(error: Error): Promise<void> {
    console.error('Attempting to recover from error:', error);

    try {
      // Reset metrics
      this.metrics.performance = {
        responseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      };

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Reinitialize health checks
      this.initializeHealthChecks();

      // Validate system
      const isValid = await this.validateSystem();
      if (!isValid) {
        throw new Error('System recovery failed');
      }
    } catch (recoveryError) {
      throw createError(
        'RECOVERY_FAILED',
        'Failed to recover from system error'
      );
    }
  }
}