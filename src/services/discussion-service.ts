

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Define types based on the Database type
export type Discussion = Database['public']['Tables']['discussions']['Row'];
export type HealthTopic = Database['public']['Tables']['health_topics']['Row'];
export type DiscussionComment = Database['public']['Tables']['discussion_comments']['Row'];

export class DiscussionService {
  async getDiscussions(): Promise<Discussion[]> {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching discussions:', error);
      return [];
    }
  }

  async getDiscussionById(id: string): Promise<Discussion | null> {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error(`Error fetching discussion with ID ${id}:`, error);
      return null;
    }
  }

  async createDiscussion(discussion: Database['public']['Tables']['discussions']['Insert']): Promise<Discussion | null> {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .insert([discussion])
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating discussion:', error);
      return null;
    }
  }

  async updateDiscussion(id: string, updates: Database['public']['Tables']['discussions']['Update']): Promise<Discussion | null> {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error(`Error updating discussion with ID ${id}:`, error);
      return null;
    }
  }

  async deleteDiscussion(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('discussions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error(`Error deleting discussion with ID ${id}:`, error);
      return false;
    }
  }

  async likeDiscussion(id: string): Promise<boolean> {
    try {
      // Get current likes count
      const { data: discussion, error: fetchError } = await supabase
        .from('discussions')
        .select('likes')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Increment likes
      const { error: updateError } = await supabase
        .from('discussions')
        .update({ likes: (discussion?.likes || 0) + 1 })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      return true;
    } catch (error) {
      console.error(`Error liking discussion with ID ${id}:`, error);
      return false;
    }
  }

  async getHealthTopics(): Promise<HealthTopic[]> {
    try {
      const { data, error } = await supabase
        .from('health_topics')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching health topics:', error);
      return [];
    }
  }

  async getComments(discussionId: string): Promise<DiscussionComment[]> {
    try {
      const { data, error } = await supabase
        .from('discussion_comments')
        .select('*')
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(`Error fetching comments for discussion ${discussionId}:`, error);
      return [];
    }
  }

  async addComment(comment: Database['public']['Tables']['discussion_comments']['Insert']): Promise<DiscussionComment | null> {
    try {
      const { data, error } = await supabase
        .from('discussion_comments')
        .insert([comment])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update comment count on the discussion
      await this.updateDiscussion(comment.discussion_id, {
        comments: await this.getCommentCount(comment.discussion_id)
      });
      
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  }

  private async getCommentCount(discussionId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('discussion_comments')
        .select('*', { count: 'exact', head: true })
        .eq('discussion_id', discussionId);
      
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error(`Error getting comment count for discussion ${discussionId}:`, error);
      return 0;
    }
  }
}

export const discussionService = new DiscussionService();
