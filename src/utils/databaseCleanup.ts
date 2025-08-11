// Database cleanup utilities to fix data integrity issues

import { supabase } from '@/lib/supabase';

export interface CleanupResult {
  success: boolean;
  message: string;
  duplicatesFound: number;
  duplicatesRemoved: number;
  errors: string[];
}

// Clean up duplicate user records across the entire database
export const cleanupAllDuplicateUsers = async (): Promise<CleanupResult> => {
  const result: CleanupResult = {
    success: false,
    message: '',
    duplicatesFound: 0,
    duplicatesRemoved: 0,
    errors: []
  };

  try {
    console.log('🧹 Starting database cleanup for duplicate users...');

    // Get all users grouped by ID to find duplicates
    const { data: allUsers, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true }); // Keep oldest record

    if (error) {
      result.errors.push(`Error fetching users: ${error.message}`);
      return result;
    }

    if (!allUsers || allUsers.length === 0) {
      result.success = true;
      result.message = 'No users found in database';
      return result;
    }

    // Group users by ID to find duplicates
    const userGroups = allUsers.reduce((groups: Record<string, any[]>, user) => {
      if (!groups[user.id]) {
        groups[user.id] = [];
      }
      groups[user.id].push(user);
      return groups;
    }, {});

    const duplicateGroups = Object.entries(userGroups).filter(([_, users]) => users.length > 1);
    
    if (duplicateGroups.length === 0) {
      result.success = true;
      result.message = 'No duplicate users found';
      return result;
    }

    console.log(`Found ${duplicateGroups.length} users with duplicates`);
    result.duplicatesFound = duplicateGroups.reduce((total, [_, users]) => total + users.length - 1, 0);

    // Clean up each group of duplicates
    for (const [userId, users] of duplicateGroups) {
      try {
        console.log(`Cleaning up ${users.length} records for user ${userId}`);
        
        // Keep the most complete record (most fields filled)
        const userToKeep = users.reduce((best, current) => {
          const bestScore = getCompletenessScore(best);
          const currentScore = getCompletenessScore(current);
          return currentScore > bestScore ? current : best;
        });

        // Delete the duplicates
        const duplicateIds = users.filter(u => u !== userToKeep).map(u => u.id);
        
        if (duplicateIds.length > 0) {
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .in('id', duplicateIds);

          if (deleteError) {
            result.errors.push(`Error deleting duplicates for user ${userId}: ${deleteError.message}`);
          } else {
            result.duplicatesRemoved += duplicateIds.length;
            console.log(`✅ Removed ${duplicateIds.length} duplicates for user ${userId}`);
          }
        }
      } catch (error) {
        result.errors.push(`Error processing user ${userId}: ${error}`);
      }
    }

    result.success = result.errors.length === 0;
    result.message = result.success 
      ? `Successfully cleaned up ${result.duplicatesRemoved} duplicate user records`
      : `Cleanup completed with ${result.errors.length} errors`;

    console.log('🧹 Database cleanup completed:', result);
    return result;

  } catch (error) {
    result.errors.push(`Cleanup failed: ${error}`);
    result.message = 'Database cleanup failed';
    return result;
  }
};

// Calculate completeness score for a user record
const getCompletenessScore = (user: any): number => {
  let score = 0;
  
  if (user.name) score += 2;
  if (user.email) score += 2;
  if (user.phone) score += 1;
  if (user.user_type) score += 2;
  if (user.avatar_url) score += 1;
  if (user.updated_at) score += 1;
  
  return score;
};

// Check database integrity
export const checkDatabaseIntegrity = async () => {
  try {
    console.log('🔍 Checking database integrity...');
    
    const checks = {
      duplicateUsers: 0,
      orphanedSellers: 0,
      usersWithoutAuth: 0,
      totalUsers: 0,
      totalSellers: 0
    };

    // Check for duplicate users
    const { data: allUsers } = await supabase
      .from('users')
      .select('id');

    if (allUsers) {
      checks.totalUsers = allUsers.length;
      const uniqueIds = new Set(allUsers.map(u => u.id));
      checks.duplicateUsers = allUsers.length - uniqueIds.size;
    }

    // Check for orphaned sellers (sellers without user records)
    const { data: allSellers } = await supabase
      .from('sellers')
      .select('user_id');

    if (allSellers) {
      checks.totalSellers = allSellers.length;
      
      for (const seller of allSellers) {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('id', seller.user_id)
          .single();
        
        if (!user) {
          checks.orphanedSellers++;
        }
      }
    }

    console.log('📊 Database integrity check results:', checks);
    return checks;

  } catch (error) {
    console.error('❌ Database integrity check failed:', error);
    return null;
  }
};

// Fix common database issues
export const fixCommonDatabaseIssues = async () => {
  console.log('🔧 Fixing common database issues...');
  
  const results = {
    duplicateUsersFixed: 0,
    orphanedSellersFixed: 0,
    errors: [] as string[]
  };

  try {
    // Fix duplicate users
    const cleanupResult = await cleanupAllDuplicateUsers();
    results.duplicateUsersFixed = cleanupResult.duplicatesRemoved;
    results.errors.push(...cleanupResult.errors);

    // TODO: Add more fixes as needed
    // - Fix orphaned sellers
    // - Fix missing user types
    // - Fix invalid phone numbers
    // etc.

    console.log('🔧 Database fixes completed:', results);
    return results;

  } catch (error) {
    console.error('❌ Database fix failed:', error);
    results.errors.push(`Fix failed: ${error}`);
    return results;
  }
};

// Emergency cleanup function for development
export const emergencyCleanup = async () => {
  console.warn('🚨 EMERGENCY CLEANUP - This will remove ALL duplicate data');
  
  try {
    const result = await cleanupAllDuplicateUsers();
    console.log('Emergency cleanup result:', result);
    return result;
  } catch (error) {
    console.error('Emergency cleanup failed:', error);
    throw error;
  }
};
