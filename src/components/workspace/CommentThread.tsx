import React from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWorkspace } from './WorkspaceProvider';

interface CommentThreadProps {
  comments: Array<{
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    parent_id?: string;
  }>;
}

export function CommentThread({ comments }: CommentThreadProps) {
  const { user } = useAuth();
  const { addComment } = useWorkspace();
  const [newComment, setNewComment] = React.useState('');
  const [replyTo, setReplyTo] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment(newComment, replyTo || undefined);
      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Organize comments into threads
  const threads = React.useMemo(() => {
    const threadMap = new Map();
    
    // Group replies under parent comments
    comments.forEach(comment => {
      if (!comment.parent_id) {
        if (!threadMap.has(comment.id)) {
          threadMap.set(comment.id, {
            ...comment,
            replies: []
          });
        }
      }
    });

    // Add replies to their parent threads
    comments.forEach(comment => {
      if (comment.parent_id && threadMap.has(comment.parent_id)) {
        threadMap.get(comment.parent_id).replies.push(comment);
      }
    });

    return Array.from(threadMap.values());
  }, [comments]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {threads.map((thread) => (
          <div key={thread.id} className="space-y-4">
            {/* Parent Comment */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">
                  {thread.user_id === user?.id ? 'You' : thread.user_id}
                </span>
                <span className="text-sm text- gray-500">
                  {new Date(thread.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{thread.content}</p>
              <button
                onClick={() => setReplyTo(thread.id)}
                className="mt-2 text-sm text-teal-600 hover:text-teal-700"
              >
                Reply
              </button>
            </div>

            {/* Replies */}
            {thread.replies.length > 0 && (
              <div className="ml-8 space-y-4">
                {thread.replies.map((reply) => (
                  <div key={reply.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {reply.user_id === user?.id ? 'You' : reply.user_id}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(reply.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comment Input */}
      <div className="border-t border-gray-200 p-4">
        {replyTo && (
          <div className="flex items-center justify-between mb-2 bg-gray-50 p-2 rounded">
            <span className="text-sm text-gray-600">
              Replying to comment
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="p-2 text-teal-600 hover:text-teal-700 disabled:text-gray-400"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}