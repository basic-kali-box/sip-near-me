import { supabase } from '@/lib/supabase';

/**
 * Debug utility to test image upload functionality
 */
export class ImageUploadDebug {
  
  /**
   * Test if the drink-photos bucket exists and is accessible
   */
  static async testBucketAccess(): Promise<{
    success: boolean;
    error?: string;
    buckets?: string[];
  }> {
    try {
      console.log('🔍 Testing Supabase storage bucket access...');
      
      // List all buckets
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('❌ Failed to list buckets:', listError);
        return {
          success: false,
          error: `Failed to list buckets: ${listError.message}`,
        };
      }
      
      console.log('📦 Available buckets:', buckets?.map(b => b.name));
      
      // Check if drink-photos bucket exists
      const drinkPhotosBucket = buckets?.find(b => b.name === 'drink-photos');
      
      if (!drinkPhotosBucket) {
        console.error('❌ drink-photos bucket not found');
        return {
          success: false,
          error: 'drink-photos bucket does not exist',
          buckets: buckets?.map(b => b.name) || [],
        };
      }
      
      console.log('✅ drink-photos bucket found');
      
      // Test listing files in the bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('drink-photos')
        .list('', { limit: 1 });
      
      if (filesError) {
        console.error('❌ Failed to list files in drink-photos bucket:', filesError);
        return {
          success: false,
          error: `Cannot access drink-photos bucket: ${filesError.message}`,
          buckets: buckets?.map(b => b.name) || [],
        };
      }
      
      console.log('✅ Successfully accessed drink-photos bucket');
      console.log('📁 Files in bucket:', files?.length || 0);
      
      return {
        success: true,
        buckets: buckets?.map(b => b.name) || [],
      };
      
    } catch (error) {
      console.error('❌ Bucket access test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Test uploading a small test image
   */
  static async testImageUpload(): Promise<{
    success: boolean;
    error?: string;
    url?: string;
  }> {
    try {
      console.log('🧪 Testing image upload...');
      
      // Create a small test image (1x1 pixel PNG)
      const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      // Convert base64 to blob
      const response = await fetch(testImageData);
      const blob = await response.blob();
      const file = new File([blob], 'test.png', { type: 'image/png' });
      
      console.log('📄 Test file created:', {
        name: file.name,
        size: file.size,
        type: file.type,
      });
      
      // Test upload
      const testFileName = `test-${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('drink-photos')
        .upload(testFileName, file, { upsert: true });
      
      if (uploadError) {
        console.error('❌ Upload failed:', uploadError);
        return {
          success: false,
          error: `Upload failed: ${uploadError.message}`,
        };
      }
      
      console.log('✅ Upload successful:', uploadData);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('drink-photos')
        .getPublicUrl(testFileName);
      
      console.log('🔗 Public URL:', urlData.publicUrl);
      
      // Clean up test file
      await supabase.storage
        .from('drink-photos')
        .remove([testFileName]);
      
      console.log('🧹 Test file cleaned up');
      
      return {
        success: true,
        url: urlData.publicUrl,
      };
      
    } catch (error) {
      console.error('❌ Image upload test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Test the complete drink photo upload flow
   */
  static async testDrinkPhotoFlow(drinkId: string, file: File): Promise<{
    success: boolean;
    error?: string;
    url?: string;
    steps: string[];
  }> {
    const steps: string[] = [];
    
    try {
      console.log('🔄 Testing complete drink photo upload flow...');
      steps.push('Started upload flow');
      
      // Step 1: Validate file
      if (!file || file.size === 0) {
        throw new Error('Invalid file provided');
      }
      steps.push(`File validated: ${file.name} (${file.size} bytes)`);
      
      // Step 2: Generate filename
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${drinkId}.${fileExt}`;
      steps.push(`Generated filename: ${fileName}`);
      
      // Step 3: Upload to storage
      console.log('📤 Uploading to storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('drink-photos')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) {
        steps.push(`Upload failed: ${uploadError.message}`);
        throw uploadError;
      }
      
      steps.push('File uploaded to storage successfully');
      console.log('✅ Upload successful:', uploadData);
      
      // Step 4: Get public URL
      const { data: urlData } = supabase.storage
        .from('drink-photos')
        .getPublicUrl(fileName);
      
      steps.push(`Generated public URL: ${urlData.publicUrl}`);
      
      // Step 5: Update database
      console.log('💾 Updating database...');
      const { error: updateError } = await supabase
        .from('drinks')
        .update({ photo_url: urlData.publicUrl })
        .eq('id', drinkId);
      
      if (updateError) {
        steps.push(`Database update failed: ${updateError.message}`);
        throw updateError;
      }
      
      steps.push('Database updated successfully');
      console.log('✅ Database updated with photo URL');
      
      return {
        success: true,
        url: urlData.publicUrl,
        steps,
      };
      
    } catch (error) {
      console.error('❌ Drink photo upload flow failed:', error);
      steps.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        steps,
      };
    }
  }
  
  /**
   * Check storage policies
   */
  static async checkStoragePolicies(): Promise<{
    success: boolean;
    error?: string;
    policies?: any[];
  }> {
    try {
      console.log('🔒 Checking storage policies...');
      
      // This is a simplified check - in a real scenario you'd need admin access
      // For now, we'll just try to access the bucket and see what happens
      const bucketTest = await this.testBucketAccess();
      
      if (!bucketTest.success) {
        return {
          success: false,
          error: 'Cannot access storage bucket - likely a policy issue',
        };
      }
      
      // Try to upload a test file to check write permissions
      const uploadTest = await this.testImageUpload();
      
      if (!uploadTest.success) {
        return {
          success: false,
          error: 'Cannot upload to storage - likely missing INSERT policy',
        };
      }
      
      return {
        success: true,
        policies: ['Bucket access: OK', 'Upload permission: OK'],
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Run all diagnostic tests
   */
  static async runFullDiagnostic(): Promise<{
    bucketAccess: any;
    uploadTest: any;
    policyCheck: any;
  }> {
    console.log('🔍 Running full image upload diagnostic...');
    
    const bucketAccess = await this.testBucketAccess();
    const uploadTest = await this.testImageUpload();
    const policyCheck = await this.checkStoragePolicies();
    
    console.log('📊 Diagnostic Results:');
    console.log('  Bucket Access:', bucketAccess.success ? '✅' : '❌');
    console.log('  Upload Test:', uploadTest.success ? '✅' : '❌');
    console.log('  Policy Check:', policyCheck.success ? '✅' : '❌');
    
    return {
      bucketAccess,
      uploadTest,
      policyCheck,
    };
  }
}
