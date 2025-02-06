import { supabase } from '@/utils/supabase/client';
import { createError } from '@/utils/core/error';
import { FileData } from '@/types/file';

// AES encryption using Web Crypto API
async function generateEncryptionKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(data: ArrayBuffer, key: CryptoKey): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    data
  );
  return { encrypted, iv };
}

async function decryptData(encrypted: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> {
  return await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    encrypted
  );
}

export async function storeDataset(
  workspaceId: string,
  name: string,
  description: string,
  data: FileData
): Promise<{ id: string }> {
  try {
    // Generate encryption key
    const key = await generateEncryptionKey();
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    const keyString = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

    // Encrypt data
    const serializedData = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(serializedData);
    const { encrypted, iv } = await encryptData(dataBuffer, key);

    // Upload encrypted data to Supabase Storage
    const fileKey = `datasets/${workspaceId}/${crypto.randomUUID()}`;
    const { error: uploadError } = await supabase.storage
      .from('secure-datasets')
      .upload(fileKey, encrypted);

    if (uploadError) throw uploadError;

    // Store dataset metadata in database
    const { data: dataset, error: dbError } = await supabase
      .from('datasets')
      .insert({
        name,
        description,
        file_key: fileKey,
        file_size: encrypted.byteLength,
        file_type: data.type,
        metadata: {
          fields: data.content.fields.length,
          rows: data.content.fields[0]?.value.length || 0
        },
        workspace_id: workspaceId,
        encryption_key: keyString,
        encryption_iv: btoa(String.fromCharCode(...iv))
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return { id: dataset.id };
  } catch (error) {
    console.error('Failed to store dataset:', error);
    throw createError(
      'STORAGE_ERROR',
      error instanceof Error ? error.message : 'Failed to store dataset'
    );
  }
}

export async function retrieveDataset(datasetId: string): Promise<FileData> {
  try {
    // Get dataset metadata and encryption details
    const { data: dataset, error: dbError } = await supabase
      .from('datasets')
      .select()
      .eq('id', datasetId)
      .single();

    if (dbError) throw dbError;

    // Download encrypted data
    const { data: encrypted, error: downloadError } = await supabase.storage
      .from('secure-datasets')
      .download(dataset.file_key);

    if (downloadError) throw downloadError;

    // Import encryption key
    const keyBuffer = Uint8Array.from(atob(dataset.encryption_key), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(dataset.encryption_iv), c => c.charCodeAt(0));
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      'AES-GCM',
      true,
      ['decrypt']
    );

    // Decrypt data
    const decrypted = await decryptData(await encrypted.arrayBuffer(), key, iv);
    const decoder = new TextDecoder();
    const decryptedData = JSON.parse(decoder.decode(decrypted));

    return decryptedData;
  } catch (error) {
    console.error('Failed to retrieve dataset:', error);
    throw createError(
      'STORAGE_ERROR',
      error instanceof Error ? error.message : 'Failed to retrieve dataset'
    );
  }
}

export async function shareDataset(
  datasetId: string,
  userId: string,
  accessLevel: 'read' | 'write',
  expiresAt?: Date
): Promise<void> {
  try {
    const { error } = await supabase
      .from('dataset_shares')
      .insert({
        dataset_id: datasetId,
        user_id: userId,
        access_level: accessLevel,
        expires_at: expiresAt?.toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to share dataset:', error);
    throw createError(
      'STORAGE_ERROR',
      error instanceof Error ? error.message : 'Failed to share dataset'
    );
  }
}

export async function createDatasetVersion(
  datasetId: string,
  data: FileData,
  description: string
): Promise<void> {
  try {
    // Get current version number
    const { data: versions, error: versionError } = await supabase
      .from('dataset_versions')
      .select('version')
      .eq('dataset_id', datasetId)
      .order('version', { ascending: false })
      .limit(1);

    if (versionError) throw versionError;

    const nextVersion = (versions?.[0]?.version || 0) + 1;

    // Generate new encryption key
    const key = await generateEncryptionKey();
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    const keyString = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

    // Encrypt data
    const serializedData = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(serializedData);
    const { encrypted, iv } = await encryptData(dataBuffer, key);

    // Upload encrypted data
    const fileKey = `datasets/${datasetId}/v${nextVersion}`;
    const { error: uploadError } = await supabase.storage
      .from('secure-datasets')
      .upload(fileKey, encrypted);

    if (uploadError) throw uploadError;

    // Store version metadata
    const { error: dbError } = await supabase
      .from('dataset_versions')
      .insert({
        dataset_id: datasetId,
        version: nextVersion,
        file_key: fileKey,
        file_size: encrypted.byteLength,
        description,
        encryption_key: keyString,
        encryption_iv: btoa(String.fromCharCode(...iv))
      });

    if (dbError) throw dbError;
  } catch (error) {
    console.error('Failed to create dataset version:', error);
    throw createError(
      'STORAGE_ERROR',
      error instanceof Error ? error.message : 'Failed to create dataset version'
    );
  }
}

export async function listDatasets(workspaceId?: string): Promise<{
  id: string;
  name: string;
  description: string;
  created_at: string;
  created_by: string;
  file_size: number;
  metadata: any;
}[]> {
  try {
    let query = supabase
      .from('datasets')
      .select(`
        id,
        name,
        description,
        created_at,
        created_by,
        file_size,
        metadata
      `);

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Failed to list datasets:', error);
    throw createError(
      'STORAGE_ERROR',
      error instanceof Error ? error.message : 'Failed to list datasets'
    );
  }
}