import React, { useState } from 'react';
import type { Comment } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { MessageCircleIcon } from '../icons/new/MessageCircleIcon';
import { SendIcon } from '../icons/new/SendIcon';

interface CommentsSectionProps {
    comments: Comment[];
    onSaveComment: (content: string) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ comments, onSaveComment }) => {
    const { t } = useTranslation();
    const [newComment, setNewComment] = useState('');

    const handleSave = () => {
        if (newComment.trim()) {
            onSaveComment(newComment.trim());
            setNewComment('');
        }
    };

    return (
        <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <MessageCircleIcon className="w-5 h-5" />
                {t('comments')}
            </h3>
            <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className="p-3 bg-gray-50 rounded-lg border">
                                <p className="text-sm text-gray-800">{comment.content}</p>
                                <p className="text-xs text-gray-500 text-right mt-1">
                                    {comment.author} - {new Date(comment.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-center text-gray-500 py-4">No hay comentarios aún.</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escriba un comentario..."
                        rows={2}
                        className="w-full p-2 border rounded-lg"
                    />
                    <button
                        type="button"
                        onClick={handleSave}
                        className="p-3 bg-blue-600 text-white rounded-lg self-end hover:bg-blue-700 disabled:bg-blue-300"
                        disabled={!newComment.trim()}
                        title={t('addComment')}
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};