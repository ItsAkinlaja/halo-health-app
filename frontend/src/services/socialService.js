import api from './api';

class SocialService {
  // ==================== POSTS ====================
  
  async createPost(postData) {
    const response = await api.post('/social/posts', postData);
    return response.data;
  }

  async getFeed(filter = 'all', limit = 20, offset = 0) {
    const response = await api.get('/social/posts', {
      params: { filter, limit, offset },
    });
    return response.data;
  }

  async getPost(postId) {
    const response = await api.get(`/social/posts/${postId}`);
    return response.data;
  }

  async updatePost(postId, updates) {
    const response = await api.put(`/social/posts/${postId}`, updates);
    return response.data;
  }

  async deletePost(postId) {
    const response = await api.delete(`/social/posts/${postId}`);
    return response.data;
  }

  async getUserPosts(userId, limit = 20, offset = 0) {
    const response = await api.get(`/social/users/${userId}/posts`, {
      params: { limit, offset },
    });
    return response.data;
  }

  // ==================== LIKES ====================
  
  async likePost(postId) {
    const response = await api.post(`/social/posts/${postId}/like`);
    return response.data;
  }

  async unlikePost(postId) {
    const response = await api.delete(`/social/posts/${postId}/like`);
    return response.data;
  }

  async getPostLikes(postId, limit = 50, offset = 0) {
    const response = await api.get(`/social/posts/${postId}/likes`, {
      params: { limit, offset },
    });
    return response.data;
  }

  // ==================== COMMENTS ====================
  
  async createComment(postId, content, parentCommentId = null) {
    const response = await api.post(`/social/posts/${postId}/comments`, {
      content,
      parent_comment_id: parentCommentId,
    });
    return response.data;
  }

  async getComments(postId, limit = 50, offset = 0) {
    const response = await api.get(`/social/posts/${postId}/comments`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async getCommentReplies(commentId, limit = 20, offset = 0) {
    const response = await api.get(`/social/comments/${commentId}/replies`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async updateComment(commentId, content) {
    const response = await api.put(`/social/comments/${commentId}`, { content });
    return response.data;
  }

  async deleteComment(commentId) {
    const response = await api.delete(`/social/comments/${commentId}`);
    return response.data;
  }

  async likeComment(commentId) {
    const response = await api.post(`/social/comments/${commentId}/like`);
    return response.data;
  }

  async unlikeComment(commentId) {
    const response = await api.delete(`/social/comments/${commentId}/like`);
    return response.data;
  }

  // ==================== FOLLOWS ====================
  
  async followUser(userId) {
    const response = await api.post(`/social/users/${userId}/follow`);
    return response.data;
  }

  async unfollowUser(userId) {
    const response = await api.delete(`/social/users/${userId}/follow`);
    return response.data;
  }

  async getFollowers(userId, limit = 50, offset = 0) {
    const response = await api.get(`/social/users/${userId}/followers`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async getFollowing(userId, limit = 50, offset = 0) {
    const response = await api.get(`/social/users/${userId}/following`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async checkFollowStatus(userId) {
    const response = await api.get(`/social/users/${userId}/follow-status`);
    return response.data;
  }

  // ==================== BLOCKS ====================
  
  async blockUser(userId) {
    const response = await api.post(`/social/users/${userId}/block`);
    return response.data;
  }

  async unblockUser(userId) {
    const response = await api.delete(`/social/users/${userId}/block`);
    return response.data;
  }

  async getBlockedUsers(limit = 50, offset = 0) {
    const response = await api.get('/social/users/blocked', {
      params: { limit, offset },
    });
    return response.data;
  }

  // ==================== SHARES & REPORTS ====================
  
  async sharePost(postId, sharedTo = 'feed') {
    const response = await api.post(`/social/posts/${postId}/share`, { shared_to: sharedTo });
    return response.data;
  }

  async reportPost(postId, reason, description = null) {
    const response = await api.post(`/social/posts/${postId}/report`, {
      reason,
      description,
    });
    return response.data;
  }

  // ==================== ACTIVITY & DISCOVERY ====================
  
  async getActivityFeed(limit = 50, offset = 0) {
    const response = await api.get('/social/activity/feed', {
      params: { limit, offset },
    });
    return response.data;
  }

  async getTrendingHashtags(limit = 20) {
    const response = await api.get('/social/hashtags/trending', {
      params: { limit },
    });
    return response.data;
  }

  async getPostsByHashtag(tag, limit = 20, offset = 0) {
    const response = await api.get(`/social/hashtags/${tag}`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async searchHashtags(query, limit = 20) {
    const response = await api.get('/social/hashtags/search', {
      params: { q: query, limit },
    });
    return response.data;
  }

  // ==================== GROUPS ====================
  
  async createGroup(name, description, isPrivate = false, category = null) {
    const response = await api.post('/social/groups', {
      name,
      description,
      is_private: isPrivate,
      category,
    });
    return response.data;
  }

  async getGroups(category = null, search = null, limit = 20, offset = 0) {
    const response = await api.get('/social/groups', {
      params: { category, search, limit, offset },
    });
    return response.data;
  }

  async getGroup(groupId) {
    const response = await api.get(`/social/groups/${groupId}`);
    return response.data;
  }

  async updateGroup(groupId, updates) {
    const response = await api.put(`/social/groups/${groupId}`, updates);
    return response.data;
  }

  async deleteGroup(groupId) {
    const response = await api.delete(`/social/groups/${groupId}`);
    return response.data;
  }

  async joinGroup(groupId) {
    const response = await api.post(`/social/groups/${groupId}/join`);
    return response.data;
  }

  async leaveGroup(groupId) {
    const response = await api.delete(`/social/groups/${groupId}/join`);
    return response.data;
  }

  async getGroupMembers(groupId, limit = 50, offset = 0) {
    const response = await api.get(`/social/groups/${groupId}/members`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async getUserGroups(userId, limit = 20, offset = 0) {
    const response = await api.get(`/social/users/${userId}/groups`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async createGroupPost(groupId, content, imageUrls = []) {
    const response = await api.post(`/social/groups/${groupId}/posts`, {
      content,
      image_urls: imageUrls,
    });
    return response.data;
  }

  async getGroupPosts(groupId, limit = 20, offset = 0) {
    const response = await api.get(`/social/groups/${groupId}/posts`, {
      params: { limit, offset },
    });
    return response.data;
  }

  // ==================== FEATURE FLAGS ====================
  
  async getFeatureFlags() {
    const response = await api.get('/feature-flags');
    return response.data;
  }
}

export const socialService = new SocialService();
export default socialService;
