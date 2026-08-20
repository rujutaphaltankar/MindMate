import { useEffect, useState } from "react";

import { createComment, createPost, deletePost, likePost, listComments, listPosts, reportPost } from "../../api/community";
import AppShell from "../../components/AppShell";

function Post({ post, onLike, onDelete, onReport }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  async function toggleComments() {
    if (!showComments) {
      const data = await listComments(post.id);
      setComments(data);
    }
    setShowComments((s) => !s);
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const comment = await createComment(post.id, commentText);
    setComments((prev) => [...prev, comment]);
    setCommentText("");
  }

  return (
    <div className="rounded-3xl border border-dusk-100 bg-white p-5 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
      <div className="flex items-center justify-between text-xs text-dusk-400">
        <span>Anonymous · {post.category}</span>
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
      </div>
      <p className="mt-2 text-dusk-800 dark:text-dusk-100">{post.text}</p>
      <div className="mt-3 flex items-center gap-4 text-sm text-dusk-500 dark:text-dusk-300">
        <button onClick={() => onLike(post.id)} className={post.liked_by_me ? "text-sage-600" : ""}>
          ❤️ {post.likes}
        </button>
        <button onClick={toggleComments}>💬 {post.comment_count}</button>
        <button onClick={() => onReport(post.id)} className="ml-auto text-xs text-dusk-400 hover:text-red-600">
          Report
        </button>
        <button onClick={() => onDelete(post.id)} className="text-xs text-dusk-400 hover:text-red-600">
          Delete
        </button>
      </div>
      {showComments && (
        <div className="mt-3 space-y-2 border-t border-dusk-100 pt-3 dark:border-dusk-700">
          {comments.map((c) => (
            <p key={c.id} className="rounded-xl bg-dusk-50 px-3 py-2 text-sm dark:bg-dusk-900">
              {c.text}
            </p>
          ))}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 rounded-full border border-dusk-200 bg-white px-3 py-1.5 text-sm dark:border-dusk-700 dark:bg-dusk-900 dark:text-dusk-50"
            />
            <button type="submit" className="rounded-full bg-dusk-800 px-4 py-1.5 text-xs font-medium text-white">
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [text, setText] = useState("");
  const [postCategory, setPostCategory] = useState("General Wellness");
  const [error, setError] = useState(null);

  async function load() {
    const data = await listPosts({ category: category || undefined });
    setPosts(data.posts);
    setCategories(data.categories);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!text.trim()) return;
    try {
      await createPost({ text, category: postCategory });
      setText("");
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not publish post.");
    }
  }

  async function handleLike(id) {
    const updated = await likePost(id);
    setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async function handleDelete(id) {
    try {
      await deletePost(id);
      load();
    } catch {
      // Silently ignore — likely not the post author.
    }
  }

  async function handleReport(id) {
    await reportPost(id, "Reported from community feed");
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">Community</h1>
      <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-300">
        Anonymous discussions — your name and email are never shown.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Share something with the community…"
          className="w-full rounded-2xl border border-dusk-200 bg-white px-4 py-3 dark:border-dusk-700 dark:bg-dusk-900 dark:text-dusk-50"
        />
        <div className="mt-3 flex items-center justify-between">
          <select
            value={postCategory}
            onChange={(e) => setPostCategory(e.target.value)}
            className="rounded-full border border-dusk-200 bg-white px-3 py-1.5 text-sm dark:border-dusk-700 dark:bg-dusk-900 dark:text-dusk-50"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-full bg-sage-500 px-6 py-2 text-sm font-medium text-white hover:bg-sage-600">
            Post anonymously
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${category === "" ? "bg-dusk-800 text-white" : "bg-dusk-100 text-dusk-600 dark:bg-dusk-700 dark:text-dusk-200"}`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${category === c ? "bg-dusk-800 text-white" : "bg-dusk-100 text-dusk-600 dark:bg-dusk-700 dark:text-dusk-200"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {posts.map((post) => (
          <Post key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} onReport={handleReport} />
        ))}
      </div>
    </AppShell>
  );
}
