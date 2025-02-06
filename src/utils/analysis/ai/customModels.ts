import { supabase } from '@/utils/supabase/client';
import { createError } from '@/utils/core/error';

interface CustomModel {
  id: string;
  name: string;
  description: string;
  modelType: string;
  framework: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  metadata: Record<string, any>;
}

interface ModelVersion {
  id: string;
  version: number;
  metrics: Record<string, any>;
  trainingData: Record<string, any>;
}

interface ModelDeployment {
  id: string;
  status: 'pending' | 'active' | 'failed' | 'stopped';
  endpointUrl?: string;
  config: Record<string, any>;
  metrics: Record<string, any>;
}

export class CustomModelManager {
  static async uploadModel(
    workspaceId: string,
    modelFile: File,
    config: {
      name: string;
      description: string;
      modelType: string;
      framework: string;
      inputSchema: Record<string, any>;
      outputSchema: Record<string, any>;
    }
  ): Promise<{ modelId: string; versionId: string }> {
    try {
      // Create model record
      const { data: model, error: modelError } = await supabase
        .from('ai_models')
        .insert({
          name: config.name,
          description: config.description,
          model_type: config.modelType,
          framework: config.framework,
          input_schema: config.inputSchema,
          output_schema: config.outputSchema,
          workspace_id: workspaceId
        })
        .select()
        .single();

      if (modelError) throw modelError;

      // Calculate checksum
      const buffer = await modelFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Upload model file
      const fileKey = `models/${model.id}/${crypto.randomUUID()}`;
      const { error: uploadError } = await supabase.storage
        .from('ai-models')
        .upload(fileKey, modelFile);

      if (uploadError) throw uploadError;

      // Create initial version
      const { data: version, error: versionError } = await supabase
        .from('model_versions')
        .insert({
          model_id: model.id,
          version: 1,
          file_key: fileKey,
          file_size: modelFile.size,
          checksum
        })
        .select()
        .single();

      if (versionError) throw versionError;

      return {
        modelId: model.id,
        versionId: version.id
      };
    } catch (error) {
      console.error('Failed to upload model:', error);
      throw createError(
        'UPLOAD_ERROR',
        error instanceof Error ? error.message : 'Failed to upload model'
      );
    }
  }

  static async deployModel(
    modelId: string,
    versionId: string,
    config: Record<string, any>
  ): Promise<ModelDeployment> {
    try {
      // Create deployment record
      const { data: deployment, error: deployError } = await supabase
        .from('model_deployments')
        .insert({
          model_id: modelId,
          version_id: versionId,
          status: 'pending',
          config
        })
        .select()
        .single();

      if (deployError) throw deployError;

      // Start deployment process
      // In a real implementation, this would trigger a serverless function
      // to handle the actual model deployment

      return deployment;
    } catch (error) {
      console.error('Failed to deploy model:', error);
      throw createError(
        'DEPLOYMENT_ERROR',
        error instanceof Error ? error.message : 'Failed to deploy model'
      );
    }
  }

  static async listModels(workspaceId?: string): Promise<CustomModel[]> {
    try {
      let query = supabase
        .from('ai_models')
        .select(`
          id,
          name,
          description,
          model_type,
          framework,
          input_schema,
          output_schema,
          metadata,
          created_at
        `);

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw createError(
        'QUERY_ERROR',
        error instanceof Error ? error.message : 'Failed to list models'
      );
    }
  }

  static async getModelVersions(modelId: string): Promise<ModelVersion[]> {
    try {
      const { data, error } = await supabase
        .from('model_versions')
        .select('*')
        .eq('model_id', modelId)
        .order('version', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get model versions:', error);
      throw createError(
        'QUERY_ERROR',
        error instanceof Error ? error.message : 'Failed to get model versions'
      );
    }
  }

  static async getActiveDeployment(modelId: string): Promise<ModelDeployment | null> {
    try {
      const { data, error } = await supabase
        .from('model_deployments')
        .select('*')
        .eq('model_id', modelId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data;
    } catch (error) {
      console.error('Failed to get active deployment:', error);
      throw createError(
        'QUERY_ERROR',
        error instanceof Error ? error.message : 'Failed to get active deployment'
      );
    }
  }

  static async invokeModel(
    deploymentId: string,
    input: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      const { data: deployment, error: deploymentError } = await supabase
        .from('model_deployments')
        .select('endpoint_url, config')
        .eq('id', deploymentId)
        .single();

      if (deploymentError) throw deploymentError;
      if (!deployment.endpoint_url) {
        throw new Error('Model endpoint not available');
      }

      // Make request to model endpoint
      const response = await fetch(deployment.endpoint_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error(`Model invocation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to invoke model:', error);
      throw createError(
        'INVOCATION_ERROR',
        error instanceof Error ? error.message : 'Failed to invoke model'
      );
    }
  }

  static async updateModelMetrics(
    deploymentId: string,
    metrics: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('model_deployments')
        .update({ metrics })
        .eq('id', deploymentId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update model metrics:', error);
      throw createError(
        'UPDATE_ERROR',
        error instanceof Error ? error.message : 'Failed to update model metrics'
      );
    }
  }
}