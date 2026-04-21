const { supabase } = require('../utils/database');

class SocialService {
  // ==================== POSTS ====================
  
  async createPost(userId, postData) {
    const { content, image_urls, tags, is_public = true } = postData;
    
    const { data, error } = await supabase
      .from('social_posts')
      .insert([{
        user_id: userId,
        content,
        image_urls: image_urls || [],
        tags: tags || [],
        is_public,
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Create activity entry
    await this.createActivity(userId, 'post', { post_id: data.id });
    
    return data;
  }

  async getPost(postId, userId) {
    const { data, error } = await supabase
      .from('social_posts')
      .select(`
        *,
        user:users!user_id(id, username, avatar_url, halo_health_id),
        is_liked:post_likes!left(user_id)
      `)
      .eq('id', postId)
      .single();
    
    if (error) throw error;
    
    // Check if current user liked this post
    data.is_liked = data.is_liked?.some(l => l.user_id === userId) || false;
    
    return data;
  }

  async updatePost(postId, userId, updates) {
    const { content, image_urls, tags, is_public } = updates;
    
    const { data, error } = await supabase
      .from('social_posts')
      .update({ content, image_urls, tags, is_public, updated_at: new Date() })
      .eq('id', postId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deletePost(postId, userId) {
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  }

  async getFeed(userId, options = {}) {
    const { filter = 'all', limit = 20, offset = 0 } = options;
    
    let query = supabase
      .from('social_posts')
      .select(`
        *,
        user:users!user_id(id, username, avatar_url, halo_health_id),
        is_liked:post_likes!left(user_id)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (filter === 'following') {
      const { data: follows } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', userId);
      
      const followingIds = follows?.map(f => f.following_id) || [];
      if (followingIds.length === 0) return [];
      
      query = query.in('user_id', followingIds);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Add is_liked flag
    return data.map(post => ({
      ...post,
      is_liked: post.is_liked?.some(l => l.user_id === userId) || false,
    }));
  }

  async getUserPosts(targetUserId, currentUserId, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const { data, error } = await supabase
      .from('social_posts')
      .select(`
        *,
        user:users!user_id(id, username, avatar_url, halo_health_id),
        is_liked:post_likes!left(user_id)
      `)
      .eq('user_id', targetUserId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return data.map(post => ({
      ...post,
      is_liked: post.is_liked?.some(l => l.user_id === currentUserId) || false,
    }));
  }

  // ==================== LIKES ====================
  
  async likePost(postId, userId) {
    const { data, error } = await supabase
      .from('post_likes')
      .insert([{ post_id: postId, user_id: userId }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') return { liked: true }; // Already liked
      throw error;
    }
    
    // Create activity
    await this.createActivity(userId, 'like', { post_id: postId });
    
    return { liked: true };
  }

  async unlikePost(postId, userId) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return { liked: false };
  }

  async getPostLikes(postId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const { data, error } = await supabase
      .from('post_likes')
      .select('user:users!user_id(id, username, avatar_url, halo_health_id), created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  // ==================== COMMENTS ====================
  
  async createComment(postId, userId, content, parentCommentId = null) {
    const { data, error } = await supabase
      .from('post_comments')
      .insert([{
        post_id: postId,
        user_id: userId,
        content,
        parent_comment_id: parentCommentId,
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Create activity
    await this.createActivity(userId, 'comment', { post_id: postId, comment_id: data.id });
    
    return data;
  }

  async getComments(postId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        user:users!user_id(id, username, avatar_url, halo_health_id)
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  async getCommentReplies(commentId, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        user:users!user_id(id, username, avatar_url, halo_health_id)
      `)
      .eq('parent_comment_id', commentId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  async updateComment(commentId, userId, content) {
    const { data, error } = await supabase
      .from('post_comments')
      .update({ content, updated_at: new Date() })
      .eq('id', commentId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteComment(commentId, userId) {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  }

  async likeComment(commentId, userId) {
    const { data, error } = await supabase
      .from('comment_likes')
      .insert([{ comment_id: commentId, user_id: userId }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') return { liked: true };
      throw error;
    }
    
    return { liked: true };
  }

  async unlikeComment(commentId, userId) {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return { liked: false };
  }

  // ==================== FOLLOWS ====================
  
  async followUser(followerId, followingId) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }
    
    const { data, error } = await supabase
      .from('user_follows')
      .insert([{ follower_id: followerId, following_id: followingId }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') return { following: true };
      throw error;
    }
    
    // Create activity
    await this.createActivity(followerId, 'follow', { following_id: followingId });
    
    return { following: true };
  }

  async unfollowUser(followerId, followingId) {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    
    if (error) throw error;
    return { following: false };
  }

  async getFollowers(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const { data, error } = await supabase
      .from('user_follows')
      .select('user:users!follower_id(id, username, avatar_url, halo_health_id, bio), created_at')
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  async getFollowing(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const { data, error } = await supabase
      .from('user_follows')
      .select('user:users!following_id(id, username, avatar_url, halo_health_id, bio), created_at')
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  async checkFollowStatus(followerId, followingId) {
    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    
    return { following: !!data };
  }

  // ==================== BLOCKS ====================
  
  async blockUser(blockerId, blockedId) {
    if (blockerId === blockedId) {
      throw new Error('Cannot block yourself');
    }
    
    // Remove follow relationships
    await supabase.from('user_follows').delete()
      .or(`follower_id.eq.${blockerId},following_id.eq.${blockerId}`)
      .or(`follower_id.eq.${blockedId},following_id.eq.${blockedId}`);
    
    const { data, error } = await supabase
      .from('user_blocks')
      .insert([{ blocker_id: blockerId, blocked_id: blockedId }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') return { blocked: true };
      throw error;
    }
    
    return { blocked: true };
  }

  async unblockUser(blockerId, blockedId) {
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);
    
    if (error) throw error;
    return { blocked: false };
  }

  async getBlockedUsers(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const { data, error } = await supabase
      .from('user_blocks')
      .select('user:users!blocked_id(id, username, avatar_url, halo_health_id), created_at')
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  // ==================== SHARES ====================
  
  async sharePost(postId, userId, sharedTo = 'feed') {
    const { data, error } = await supabase
      .from('post_shares')
      .insert([{ post_id: postId, user_id: userId, shared_to: sharedTo }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Create activity
    await this.createActivity(userId, 'share', { post_id: postId });
    
    return data;
  }

  // ==================== REPORTS ====================
  
  async reportPost(postId, reporterId, reason, description = null) {
    const { data, error } = await supabase
      .from('post_reports')
      .insert([{
        post_id: postId,
        reporter_id: reporterId,
        reason,
        description,
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // ==================== ACTIVITY FEED ====================
  
  async createActivity(userId, activityType, activityData, isPublic = true) {
    const { error } = await supabase
      .from('user_activity_feed')
      .insert([{
        user_id: userId,
        activity_type: activityType,
        activity_data: activityData,
        is_public: isPublic,
      }]);
    
    if (error) console.error('Failed to create activity:', error);
  }

  async getActivityFeed(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    // Get activities from followed users
    const { data: follows } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId);
    
    const followingIds = follows?.map(f => f.following_id) || [];
    const userIds = [userId, ...followingIds];
    
    const { data, error } = await supabase
      .from('user_activity_feed')
      .select(`
        *,
        user:users!user_id(id, username, avatar_url, halo_health_id)
      `)
      .in('user_id', userIds)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  // ==================== HASHTAGS ====================
  
  async getTrendingHashtags(limit = 20) {
    const { data, error } = await supabase
      .from('hashtags')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  async getPostsByHashtag(tag, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    // Get hashtag
    const { data: hashtag } = await supabase
      .from('hashtags')
      .select('id')
      .eq('tag', tag.toLowerCase())
      .single();
    
    if (!hashtag) return [];
    
    const { data, error } = await supabase
      .from('post_hashtags')
      .select(`
        post:social_posts(
          *,
          user:users!user_id(id, username, avatar_url, halo_health_id)
        )
      `)
      .eq('hashtag_id', hashtag.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data.map(item => item.post);
  }

  async searchHashtags(query, limit = 20) {
    const { data, error } = await supabase
      .from('hashtags')
      .select('*')
      .ilike('tag', `%${query}%`)
      .order('usage_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  // ==================== GROUPS ====================
  
  async createGroup(userId, groupData) {
    const { name, description, is_private = false, category } = groupData;
    
    const { data, error } = await supabase
      .from('community_groups')
      .insert([{
        name,
        description,
        is_private,
        category,
        created_by: userId,
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Add creator as admin member
    await this.joinGroup(data.id, userId, 'admin');
    
    return data;
  }

  async getGroup(groupId) {
    const { data, error } = await supabase
      .from('community_groups')
      .select(`
        *,
        creator:users!created_by(id, username, avatar_url, halo_health_id)
      `)
      .eq('id', groupId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateGroup(groupId, userId, updates) {
    const { name, description, is_private, category } = updates;
    
    const { data, error } = await supabase
      .from('community_groups')
      .update({ name, description, is_private, category, updated_at: new Date() })
      .eq('id', groupId)
      .eq('created_by', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteGroup(groupId, userId) {
    const { error } = await supabase
      .from('community_groups')
      .delete()
      .eq('id', groupId)
      .eq('created_by', userId);
    
    if (error) throw error;
    return true;
  }

  async getGroups(options = {}) {
    const { category, search, limit = 20, offset = 0 } = options;
    
    let query = supabase
      .from('community_groups')
      .select(`
        *,
        creator:users!created_by(id, username, avatar_url, halo_health_id)
      `)
      .eq('is_private', false)
      .order('member_count', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async joinGroup(groupId, userId, role = 'member') {
    const { data, error } = await supabase
      .from('group_members')
      .insert([{ group_id: groupId, user_id: userId, role }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') return { joined: true };
      throw error;
    }
    
    return { joined: true };
  }

  async leaveGroup(groupId, userId) {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return { joined: false };
  }

  async getGroupMembers(groupId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        user:users!user_id(id, username, avatar_url, halo_health_id, bio)
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  async getUserGroups(userId, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        group:community_groups(
          *,
          creator:users!created_by(id, username, avatar_url, halo_health_id)
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data.map(item => item.group);
  }

  async createGroupPost(groupId, userId, content, imageUrls = []) {
    const { data, error } = await supabase
      .from('group_posts')
      .insert([{
        group_id: groupId,
        user_id: userId,
        content,
        image_urls: imageUrls,
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getGroupPosts(groupId, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const { data, error } = await supabase
      .from('group_posts')
      .select(`
        *,
        user:users!user_id(id, username, avatar_url, halo_health_id)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }
}

module.exports = new SocialService();
