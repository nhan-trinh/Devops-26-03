import {
  BadgeCheck,
  X,
  Send,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import moment from "moment";
import api from "../api/axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DeleteCommentModal from "./DeleteCommentModal";
import { useTranslation } from "react-i18next";

const CommentModal = ({
  post,
  isOpen,
  onClose,
  currentUser,
  onCommentAdded,
  onCommentsCountSync,
}) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen && post._id) {
      fetchComments();
      setCurrentImageIndex(0); // Reset to first image when modal opens
    }
  }, [isOpen, post._id]);

  useEffect(() => {
    if (isOpen && comments.length >= 0 && onCommentsCountSync && !loading) {
      const totalComments = comments.reduce((total, comment) => {
        let count = 1; // Main comment

        if (comment.replies && comment.replies.length > 0) {
          count += comment.replies.length; // First level replies

          // Count nested replies
          comment.replies.forEach((reply) => {
            if (reply.replies && reply.replies.length > 0) {
              count += reply.replies.length;
            }
          });
        }

        return total + count;
      }, 0);

      onCommentsCountSync(totalComments);

      try {
        sessionStorage.setItem(
          `commentCount_${post._id}`,
          totalComments.toString()
        );
      } catch (error) {
        console.error("Error saving comment count to sessionStorage:", error);
      }
    }
  }, [isOpen, comments, onCommentsCountSync, loading, post._id]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/api/comment/${post._id}?page=${page}&limit=5`,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );
      if (data.success) {
        if (page === 1) {
          setComments(data.comments);
        } else {
          setComments((prev) => [...prev, ...data.comments]);
        }
        setHasMore(data.hasMore);
      }
    } catch {
      toast.error("Cannot load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const token = await getToken();
      const { data } = await api.post(
        "/api/comment/add",
        { postId: post._id, content: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Comment added");
        setComment("");
        const newComment = { ...data.comment, replies: [] };
        setComments((prev) => [newComment, ...prev]);
        if (onCommentAdded) onCommentAdded(1);
      } else {
        toast.error(data.message || "Cannot add comment");
      }
    } catch (error) {
      toast.error("Cannot add comment");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e, parentCommentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setReplySubmitting(true);
      const token = await getToken();
      const { data } = await api.post(
        "/api/comment/add",
        {
          postId: post._id,
          content: replyContent.trim(),
          parentCommentId: parentCommentId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Reply added");
        setReplyContent("");
        setReplyingTo(null);

        // Update state with nested replies
        setComments((prev) =>
          prev.map((c) => {
            // If replying to main comment
            if (c._id === parentCommentId) {
              return { ...c, replies: [...(c.replies || []), data.comment] };
            }

            // If replying to a reply (nested)
            if (c.replies && c.replies.length > 0) {
              const updatedReplies = c.replies.map((reply) => {
                if (reply._id === parentCommentId) {
                  return {
                    ...reply,
                    replies: [...(reply.replies || []), data.comment],
                  };
                }
                return reply;
              });
              return { ...c, replies: updatedReplies };
            }

            return c;
          })
        );

        if (onCommentAdded) onCommentAdded(1);
      } else {
        toast.error(data.message || "Cannot add reply");
      }
    } catch (error) {
      toast.error("Cannot add reply");
      console.error(error);
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/comment/update",
        { commentId, content: editContent.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Comment updated");
        setEditingCommentId(null);
        setEditContent("");

        setComments((prev) =>
          prev.map((c) => {
            // Update main comment
            if (c._id === commentId) {
              return { ...c, content: editContent.trim() };
            }

            // Update first level replies
            if (c.replies && c.replies.length > 0) {
              const updatedReplies = c.replies.map((reply) => {
                if (reply._id === commentId) {
                  return { ...reply, content: editContent.trim() };
                }

                // Update nested replies
                if (reply.replies && reply.replies.length > 0) {
                  return {
                    ...reply,
                    replies: reply.replies.map((nestedReply) =>
                      nestedReply._id === commentId
                        ? { ...nestedReply, content: editContent.trim() }
                        : nestedReply
                    ),
                  };
                }
                return reply;
              });
              return { ...c, replies: updatedReplies };
            }
            return c;
          })
        );
      } else {
        toast.error(data.message || "Cannot update the comment");
      }
    } catch (error) {
      toast.error("Cannot update the comment");
      console.error(error);
    }
  };

  const handleDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setIsDeleteModalOpen(true);
  };

  const handleCommentDeleted = (deletedCommentId, postId) => {
    setComments((prev) => {
      // Filter out deleted comment from top level
      const filteredComments = prev.filter((c) => c._id !== deletedCommentId);

      // Remove deleted comment from all nested levels
      return filteredComments.map((c) => {
        if (c.replies && c.replies.length > 0) {
          // Filter out deleted reply from first level
          const filteredReplies = c.replies.filter(
            (reply) => reply._id !== deletedCommentId
          );

          // Check and update nested replies (second level)
          const updatedReplies = filteredReplies.map((reply) => {
            if (reply.replies && reply.replies.length > 0) {
              return {
                ...reply,
                replies: reply.replies.filter(
                  (nestedReply) => nestedReply._id !== deletedCommentId
                ),
              };
            }
            return reply;
          });

          return { ...c, replies: updatedReplies };
        }
        return c;
      });
    });

    if (onCommentAdded) {
      onCommentAdded(-1);
    }

    setIsDeleteModalOpen(false);
    setCommentToDelete(null);
  };

  const handleLikeComment = async (commentId) => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/comment/like",
        { commentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setComments((prev) =>
          prev.map((c) => {
            // Like main comment
            if (c._id === commentId) {
              const isLiked = c.likes_count?.includes(currentUser._id);
              return {
                ...c,
                likes_count: isLiked
                  ? c.likes_count.filter((id) => id !== currentUser._id)
                  : [...(c.likes_count || []), currentUser._id],
              };
            }

            // Like first level or nested replies
            if (c.replies && c.replies.length > 0) {
              const updatedReplies = c.replies.map((reply) => {
                if (reply._id === commentId) {
                  const isLiked = reply.likes_count?.includes(currentUser._id);
                  return {
                    ...reply,
                    likes_count: isLiked
                      ? reply.likes_count.filter((id) => id !== currentUser._id)
                      : [...(reply.likes_count || []), currentUser._id],
                  };
                }

                // Like nested replies
                if (reply.replies && reply.replies.length > 0) {
                  return {
                    ...reply,
                    replies: reply.replies.map((nestedReply) => {
                      if (nestedReply._id === commentId) {
                        const isLiked = nestedReply.likes_count?.includes(
                          currentUser._id
                        );
                        return {
                          ...nestedReply,
                          likes_count: isLiked
                            ? nestedReply.likes_count.filter(
                                (id) => id !== currentUser._id
                              )
                            : [
                                ...(nestedReply.likes_count || []),
                                currentUser._id,
                              ],
                        };
                      }
                      return nestedReply;
                    }),
                  };
                }
                return reply;
              });
              return { ...c, replies: updatedReplies };
            }
            return c;
          })
        );
      }
    } catch (error) {
      toast.error("Cannot perform action");
      console.error(error);
    }
  };

  const handleReply = (commentId, full_name) => {
    setReplyingTo(commentId);
    setReplyContent(`@${full_name} `);
  };

  // Image navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === post.image_urls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? post.image_urls.length - 1 : prev - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  if (!isOpen) return null;

  const postWithHashtags = post.content?.replace(
    /(#\w+)/g,
    '<span class="text-indigo-600 font-medium cursor-pointer hover:underline">$1</span>'
  );

  const hasMultipleImages = post.image_urls?.length > 1;

  return (
    <>
      <div className="fixed inset-0 z-[110] min-h-screen bg-black/80 backdrop-blur text-white flex">
        <div className="bg-white text-zinc-900 w-full h-full flex flex-col md:flex-row overflow-hidden">
          {/* Left Side - Images/Videos with Carousel */}
          <div
            className="flex-1 bg-black md:flex items-center justify-center relative hidden"
            onClick={onClose}
          >
            {post.image_urls?.length > 0 ? (
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Current Media */}
                {(() => {
                  const media = post.image_urls[currentImageIndex];
                  const isVideo = /\.(mp4|webm|ogg)$/i.test(media);
                  return isVideo ? (
                    <video
                      src={media}
                      controls
                      className="max-w-full max-h-full object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <img
                      src={media}
                      alt=""
                      className="max-w-full max-h-full object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  );
                })()}

                {/* Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {post.image_urls.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          goToImage(index);
                        }}
                        className={`w-2 h-2 rounded-full transition ${
                          index === currentImageIndex
                            ? "bg-white w-6"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Counter */}
                {hasMultipleImages && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {post.image_urls.length}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>{t("No media to display")}</p>
              </div>
            )}
          </div>

          {/* Right Side - Content and Comments */}
          <div className="w-full md:w-96 md:min-w-96 flex flex-col bg-white dark:bg-gray-900 md:border-l border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg dark:text-white font-semibold">
                {t("Comments")}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:bg-gray-500 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Post Info */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div
                onClick={() => navigate(`/profile/` + post.user._id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img
                  src={post.user.profile_picture}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover shadow"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm dark:text-white">
                      {post.user.full_name}
                    </span>
                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500">
                    @{post.user.full_name} • {moment(post.createdAt).fromNow()}
                  </p>
                </div>
              </div>

              {post.content && (
                <p
                  className="text-gray-800 dark:text-white text-sm leading-relaxed mt-3"
                  dangerouslySetInnerHTML={{ __html: postWithHashtags }}
                />
              )}

              {/* Mobile only - Show images carousel */}
              <div className="md:hidden mt-3">
                {post.image_urls?.length > 0 && (
                  <div className="relative">
                    {(() => {
                      const media = post.image_urls[currentImageIndex];
                      const isVideo = /\.(mp4|webm|ogg)$/i.test(media);
                      return isVideo ? (
                        <video
                          src={media}
                          controls
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      ) : (
                        <img
                          src={media}
                          alt=""
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      );
                    })()}

                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {post.image_urls.map((_, index) => (
                            <div
                              key={index}
                              className={`w-1.5 h-1.5 rounded-full ${
                                index === currentImageIndex
                                  ? "bg-white w-4"
                                  : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-2 animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="w-24 h-3 bg-gray-200 rounded"></div>
                        <div className="w-full h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-gray-500 py-4 text-sm">
                  {t("Be the first one to comment!")}
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c._id} className="space-y-2">
                      {/* Main comment */}
                      <div className="flex gap-2">
                        <img
                          onClick={() => navigate(`/profile/` + c.user._id)}
                          src={c.user.profile_picture}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-lg px-3 py-2 dark:bg-primary-dark">
                            <div className="flex items-center gap-1 mb-1">
                              <span
                                onClick={() =>
                                  navigate(`/profile/` + c.user._id)
                                }
                                className="font-medium text-xs text-zinc-900 cursor-pointer dark:text-white hover:underline"
                              >
                                {c.user.full_name}
                              </span>
                            </div>
                            {editingCommentId === c._id ? (
                              <div className="flex gap-1 mt-1">
                                <input
                                  value={editContent}
                                  onChange={(e) =>
                                    setEditContent(e.target.value)
                                  }
                                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleUpdateComment(c._id);
                                    } else if (e.key === "Escape") {
                                      setEditingCommentId(null);
                                      setEditContent("");
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdateComment(c._id)}
                                  className="px-2 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                  {t("Save")}
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-800 dark:text-gray-400">
                                {c.content}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="text-xs">
                              {moment(c.createdAt).fromNow()}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeComment(c._id);
                              }}
                              className="flex items-center gap-1 hover:text-red-500 transition cursor-pointer"
                            >
                              <Heart
                                className={`w-3 h-3 ${
                                  c.likes_count?.includes(currentUser._id)
                                    ? "text-red-500 fill-red-500"
                                    : ""
                                }`}
                              />
                              {c.likes_count?.length > 0 && (
                                <span className="text-xs">
                                  {c.likes_count.length}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReply(c._id, c.user.full_name);
                              }}
                              className="text-xs hover:text-indigo-500 transition cursor-pointer"
                            >
                              {t("Reply")}
                            </button>
                            {c.user._id === currentUser._id && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCommentId(c._id);
                                    setEditContent(c.content);
                                  }}
                                  className="text-xs hover:text-indigo-500 transition cursor-pointer"
                                >
                                  {t("Edit")}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteComment(c._id);
                                  }}
                                  className="text-xs hover:text-red-500 transition cursor-pointer"
                                >
                                  {t("Delete")}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Reply Input */}
                      {replyingTo === c._id && (
                        <div className="ml-10">
                          <form
                            onSubmit={(e) => handleSubmitReply(e, c._id)}
                            className="flex gap-2"
                          >
                            <img
                              src={currentUser.profile_picture}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div className="flex-1 flex items-center bg-gray-50 border border-gray-300 rounded-full px-2 py-1 focus-within:border-indigo-500 transition">
                              <input
                                type="text"
                                value={replyContent}
                                onChange={(e) =>
                                  setReplyContent(e.target.value)
                                }
                                placeholder={`Reply to @${c.user.full_name}...`}
                                className="flex-1 bg-transparent outline-none text-xs text-zinc-900 placeholder-gray-400"
                                disabled={replySubmitting}
                                autoFocus
                              />
                              <button
                                type="submit"
                                disabled={
                                  !replyContent.trim() || replySubmitting
                                }
                                className="ml-1 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {replySubmitting ? (
                                  <div className="animate-spin rounded-full h-2 w-2 border-b border-white"></div>
                                ) : (
                                  <Send className="w-2 h-2" />
                                )}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent("");
                              }}
                              className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition"
                            >
                              {t("Cancel")}
                            </button>
                          </form>
                        </div>
                      )}

                      {/* Replies */}
                      {c.replies && c.replies.length > 0 && (
                        <div className="ml-10 space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                          {c.replies.map((reply) => (
                            <div key={reply._id} className="flex gap-2">
                              <img
                                onClick={() =>
                                  navigate(`/profile/` + reply.user._id)
                                }
                                src={reply.user.profile_picture}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover cursor-pointer"
                              />
                              <div className="flex-1">
                                <div className="bg-gray-50 dark:bg-primary-dark rounded-lg px-2 py-1">
                                  <div className="flex items-center gap-1 mb-1">
                                    <span
                                      onClick={() =>
                                        navigate(`/profile/` + reply.user._id)
                                      }
                                      className="font-medium text-xs text-zinc-900 dark:text-white cursor-pointer hover:underline"
                                    >
                                      {reply.user.full_name}
                                    </span>
                                  </div>
                                  {editingCommentId === reply._id ? (
                                    <div className="flex gap-1 mt-1">
                                      <input
                                        value={editContent}
                                        onChange={(e) =>
                                          setEditContent(e.target.value)
                                        }
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            handleUpdateComment(reply._id);
                                          } else if (e.key === "Escape") {
                                            setEditingCommentId(null);
                                            setEditContent("");
                                          }
                                        }}
                                        autoFocus
                                      />
                                      <button
                                        onClick={() =>
                                          handleUpdateComment(reply._id)
                                        }
                                        className="px-2 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                                      >
                                        {t("Save")}
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-800 dark:text-gray-400">
                                      {reply.content}
                                    </p>
                                  )}
                                </div>

                                {/* Reply Actions */}
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                  <span className="text-xs">
                                    {moment(reply.createdAt).fromNow()}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLikeComment(reply._id);
                                    }}
                                    className="flex items-center gap-1 hover:text-red-500 transition"
                                  >
                                    <Heart
                                      className={`w-3 h-3 ${
                                        reply.likes_count?.includes(
                                          currentUser._id
                                        )
                                          ? "text-red-500 fill-red-500 cousror-pointer"
                                          : ""
                                      }`}
                                    />
                                    {reply.likes_count?.length > 0 && (
                                      <span className="text-xs">
                                        {reply.likes_count.length}
                                      </span>
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReply(
                                        reply._id,
                                        reply.user.full_name
                                      );
                                    }}
                                    className="text-xs hover:text-indigo-500 transition cursor-pointer"
                                  >
                                    {t("Reply")}
                                  </button>
                                  {reply.user._id === currentUser._id && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingCommentId(reply._id);
                                          setEditContent(reply.content);
                                        }}
                                        className="text-xs hover:text-indigo-500 transition cursor-pointer"
                                      >
                                        {t("Edit")}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteComment(reply._id);
                                        }}
                                        className="text-xs hover:text-red-500 transition cursor-pointer"
                                      >
                                        {t("Delete")}
                                      </button>
                                    </>
                                  )}
                                </div>

                                {/* Reply Input for nested reply */}
                                {replyingTo === reply._id && (
                                  <div className="mt-2">
                                    <form
                                      onSubmit={(e) =>
                                        handleSubmitReply(e, reply._id)
                                      }
                                      className="flex gap-2"
                                    >
                                      <img
                                        src={currentUser.profile_picture}
                                        alt=""
                                        className="w-6 h-6 rounded-full object-cover"
                                      />
                                      <div className="flex-1 flex items-center bg-gray-50 border border-gray-300 rounded-full px-2 py-1 focus-within:border-indigo-500 transition">
                                        <input
                                          type="text"
                                          value={replyContent}
                                          onChange={(e) =>
                                            setReplyContent(e.target.value)
                                          }
                                          placeholder={`Reply to @${reply.user.full_name}...`}
                                          className="flex-1 bg-transparent outline-none text-xs text-zinc-900 placeholder-gray-400"
                                          disabled={replySubmitting}
                                          autoFocus
                                        />
                                        <button
                                          type="submit"
                                          disabled={
                                            !replyContent.trim() ||
                                            replySubmitting
                                          }
                                          className="ml-1 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {replySubmitting ? (
                                            <div className="animate-spin rounded-full h-2 w-2 border-b border-white"></div>
                                          ) : (
                                            <Send className="w-2 h-2" />
                                          )}
                                        </button>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReplyingTo(null);
                                          setReplyContent("");
                                        }}
                                        className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition"
                                      >
                                        {t("Cancel")}
                                      </button>
                                    </form>
                                  </div>
                                )}

                                {/* Nested replies (reply.replies) */}
                                {reply.replies && reply.replies.length > 0 && (
                                  <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                                    {reply.replies.map((nestedReply) => (
                                      <div key={nestedReply._id}>
                                        {/* --- block nestedReply --- */}
                                        <div className="flex gap-2">
                                          <img
                                            onClick={() =>
                                              navigate(
                                                `/profile/` +
                                                  nestedReply.user._id
                                              )
                                            }
                                            src={
                                              nestedReply.user.profile_picture
                                            }
                                            alt=""
                                            className="w-5 h-5 rounded-full object-cover cursor-pointer"
                                          />
                                          <div className="flex-1">
                                            <div className="bg-gray-50 dark:bg-primary-dark rounded-lg px-2 py-1">
                                              <div className="flex items-center gap-1 mb-1">
                                                <span
                                                  onClick={() =>
                                                    navigate(
                                                      `/profile/` +
                                                        nestedReply.user._id
                                                    )
                                                  }
                                                  className="font-medium text-xs text-zinc-900 dark:text-white cursor-pointer hover:underline"
                                                >
                                                  {nestedReply.user.full_name}
                                                </span>
                                              </div>

                                              {/* Nội dung reply */}
                                              {editingCommentId ===
                                              nestedReply._id ? (
                                                <div className="flex gap-1 mt-1">
                                                  <input
                                                    value={editContent}
                                                    onChange={(e) =>
                                                      setEditContent(
                                                        e.target.value
                                                      )
                                                    }
                                                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                                    onKeyDown={(e) => {
                                                      if (e.key === "Enter") {
                                                        handleUpdateComment(
                                                          nestedReply._id
                                                        );
                                                      } else if (
                                                        e.key === "Escape"
                                                      ) {
                                                        setEditingCommentId(
                                                          null
                                                        );
                                                        setEditContent("");
                                                      }
                                                    }}
                                                    autoFocus
                                                  />
                                                  <button
                                                    onClick={() =>
                                                      handleUpdateComment(
                                                        nestedReply._id
                                                      )
                                                    }
                                                    className="px-2 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                                  >
                                                    {t("Save")}
                                                  </button>
                                                </div>
                                              ) : (
                                                <p className="text-xs text-gray-800 dark:text-gray-400">
                                                  {nestedReply.content}
                                                </p>
                                              )}
                                            </div>

                                            {/* Actions cho nestedReply */}
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                              <span>
                                                {moment(
                                                  nestedReply.createdAt
                                                ).fromNow()}
                                              </span>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleLikeComment(
                                                    nestedReply._id
                                                  );
                                                }}
                                                className="flex items-center gap-1 hover:text-red-500 transition"
                                              >
                                                <Heart
                                                  className={`w-3 h-3 ${
                                                    nestedReply.likes_count?.includes(
                                                      currentUser._id
                                                    )
                                                      ? "text-red-500 fill-red-500"
                                                      : ""
                                                  }`}
                                                />
                                                {nestedReply.likes_count
                                                  ?.length > 0 && (
                                                  <span>
                                                    {
                                                      nestedReply.likes_count
                                                        .length
                                                    }
                                                  </span>
                                                )}
                                              </button>

                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleReply(
                                                    reply._id,
                                                    nestedReply.user.full_name
                                                  );
                                                  setReplyingTo(
                                                    nestedReply._id
                                                  ); // để mở form đúng chỗ
                                                }}
                                                className="text-xs hover:text-indigo-500 transition cursor-pointer"
                                              >
                                                {t("Reply")}
                                              </button>

                                              {nestedReply.user._id ===
                                                currentUser._id && (
                                                <>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingCommentId(
                                                        nestedReply._id
                                                      );
                                                      setEditContent(
                                                        nestedReply.content
                                                      );
                                                    }}
                                                    className="text-xs hover:text-indigo-500 transition cursor-pointer"
                                                  >
                                                    {t("Edit")}
                                                  </button>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDeleteComment(
                                                        nestedReply._id
                                                      );
                                                    }}
                                                    className="text-xs hover:text-red-500 transition cursor-pointer"
                                                  >
                                                    {t("Delete")}
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* --- Input reply nằm tách block --- */}
                                        {replyingTo === nestedReply._id && (
                                          <div className="mt-2">
                                            <form
                                              onSubmit={(e) =>
                                                handleSubmitReply(e, reply._id)
                                              }
                                              className="flex gap-2"
                                            >
                                              <img
                                                src={
                                                  currentUser.profile_picture
                                                }
                                                alt=""
                                                className="w-6 h-6 rounded-full object-cover"
                                              />
                                              <div className="flex-1 flex items-center bg-gray-50 border border-gray-300 rounded-full px-2 py-1 focus-within:border-indigo-500 transition">
                                                <input
                                                  type="text"
                                                  value={replyContent}
                                                  onChange={(e) =>
                                                    setReplyContent(
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder={`Reply to @${nestedReply.user.full_name}...`}
                                                  className="flex-1 bg-transparent outline-none text-xs text-zinc-900 placeholder-gray-400"
                                                  disabled={replySubmitting}
                                                  autoFocus
                                                />
                                                <button
                                                  type="submit"
                                                  disabled={
                                                    !replyContent.trim() ||
                                                    replySubmitting
                                                  }
                                                  className="ml-1 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                  {replySubmitting ? (
                                                    <div className="animate-spin rounded-full h-2 w-2 border-b border-white"></div>
                                                  ) : (
                                                    <Send className="w-2 h-2" />
                                                  )}
                                                </button>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setReplyingTo(null);
                                                  setReplyContent("");
                                                }}
                                                className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition"
                                              >
                                                {t("Cancel")}
                                              </button>
                                            </form>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="text-center mt-4">
                    {hasMore ? (
                      <button
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={loading}
                        className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
                      >
                        {loading ? "Loading..." : "See more comments"}
                      </button>
                    ) : comments.length > 5 ? (
                      <button
                        onClick={() => {
                          setPage(1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        See less comments
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* Comment Input - Keep existing code */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <img
                  src={currentUser.profile_picture}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-500 border border-gray-300 rounded-full px-3 py-2 focus-within:border-indigo-500 transition">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t("Write a comment...")}
                    className="flex-1 bg-transparent outline-none text-sm text-zinc-900 placeholder-gray-400"
                    disabled={submitting}
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim() || submitting}
                    className="ml-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <DeleteCommentModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCommentToDelete(null);
        }}
        commentId={commentToDelete}
        postId={post._id}
        onCommentDeleted={handleCommentDeleted}
      />
    </>
  );
};

export default CommentModal;
