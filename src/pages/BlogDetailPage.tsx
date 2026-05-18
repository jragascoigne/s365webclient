import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiBaseUrl } from "../config";
import {
	addBlogComment,
	addBlogReaction,
	getBlog,
	getBlogComments,
	getBlogReactions,
	getBlogs,
	getCategories,
	getCities,
	removeBlogReaction,
} from "../api/blogs";
import { BlogSummaryCard } from "../components/BlogSummaryCard";
import { Notice } from "../components/Notice";
import { RemoteImage } from "../components/RemoteImage";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../stores/auth";
import { formatNzDate } from "../utils/date";
import { Balloon, Brain, Cake, Handshake, Heart } from "lucide-react";

function toLookup(items, key) {
	return Object.fromEntries(items.map((item) => [item[key], item.name]));
}

function sortNewestFirst(left, right) {
	return (
		new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
	);
}

function sortOldestFirst(left, right) {
	return (
		new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()
	);
}

function getReactionCounts(reactions) {
	return reactions.reduce((counts, item) => {
		counts[item.reaction] = (counts[item.reaction] ?? 0) + 1;
		return counts;
	}, {});
}

const reactionOptions = [
	{ value: "REACTION_1", label: "Insightful", icon: Brain },
	{ value: "REACTION_2", label: "Helpful", icon: Handshake },
	{ value: "REACTION_3", label: "Exciting", icon: Balloon },
	{ value: "REACTION_4", label: "Beautiful", icon: Heart },
	{ value: "REACTION_5", label: "Surprising", icon: Cake },
];

function getSimilarBlogs(currentBlog, blogs) {
	if (!currentBlog) return [];
	const currentCategories = new Set(currentBlog.categoryIds ?? []);

	return blogs
		.filter((blog) => blog.blogId !== currentBlog.blogId)
		.filter((blog) => {
			const sharesCategory = blog.categoryIds?.some((id) =>
				currentCategories.has(id),
			);
			return (
				sharesCategory ||
				blog.cityId === currentBlog.cityId ||
				blog.creatorId === currentBlog.creatorId
			);
		})
		.slice(0, 6);
}

function CommentList({ comments, canComment, onReply }) {
	const { topLevel, repliesByParent } = useMemo(() => {
		const groups = new Map();
		const parents = [];

		comments.forEach((comment) => {
			if (comment.parentId === null || comment.parentId === undefined) {
				parents.push(comment);
				return;
			}

			const replies = groups.get(comment.parentId) ?? [];
			replies.push(comment);
			groups.set(comment.parentId, replies);
		});

		parents.sort(sortNewestFirst);
		groups.forEach((replies) => replies.sort(sortOldestFirst));

		return { topLevel: parents, repliesByParent: groups };
	}, [comments]);

	if (topLevel.length === 0) {
		return <Notice>No comments yet.</Notice>;
	}

	return (
		<div className="comment-list">
			{topLevel.map((comment) => {
				const replies = repliesByParent.get(comment.commentId) ?? [];

				return (
					<article className="comment-card" key={comment.commentId}>
						<CommentBody
							comment={comment}
							replyCount={replies.length}
							canReply={canComment}
							onReply={onReply}
						/>
						{replies.length > 0 && (
							<div className="reply-list">
								{replies.map((reply) => (
									<CommentBody
										comment={reply}
										key={reply.commentId}
									/>
								))}
							</div>
						)}
					</article>
				);
			})}
		</div>
	);
}

function CommentBody({ comment, replyCount, canReply = false, onReply }: any) {
	const commenterName = `${comment.commenterFirstName} ${comment.commenterLastName}`;

	return (
		<div className="comment-body">
			<div className="avatar-frame">
				<RemoteImage
					src={`${apiBaseUrl}/users/${comment.commenterId}/image`}
					alt=""
				/>
			</div>
			<div>
				<div className="comment-header">
					<strong>{commenterName}</strong>
					<span>{formatNzDate(comment.timestamp)}</span>
				</div>
				<p>{comment.comment}</p>
				{typeof replyCount === "number" && (
					<span className="reply-count">{replyCount} replies</span>
				)}
				{canReply && typeof replyCount === "number" && (
					<Button
						className="inline-button"
						variant="link"
						type="button"
						onClick={() => onReply(comment)}
					>
						Reply
					</Button>
				)}
			</div>
		</div>
	);
}

function CommentForm({ label, onSubmit, busy, onCancel }: any) {
	const [comment, setComment] = useState("");
	const [error, setError] = useState("");

	async function handleSubmit(event) {
		event.preventDefault();
		if (!comment.trim()) {
			setError("Comment text is required.");
			return;
		}

		setError("");
		await onSubmit(comment.trim());
		setComment("");
	}

	return (
		<form className="comment-form" onSubmit={handleSubmit}>
			{error && <Notice error>{error}</Notice>}
			<Label htmlFor="comment-text">{label}</Label>
			<Textarea
				id="comment-text"
				rows="4"
				value={comment}
				onChange={(event) => setComment(event.target.value)}
			/>
			<div className="action-row">
				<Button type="submit" disabled={busy}>
					{busy ? "Posting..." : "Post"}
				</Button>
				{onCancel && (
					<Button
						className="secondary-button"
						variant="secondary"
						type="button"
						onClick={onCancel}
					>
						Cancel
					</Button>
				)}
			</div>
		</form>
	);
}

export function BlogDetailPage() {
	const { blogId } = useParams();
	const { auth, isAuthenticated } = useAuth();
	const [blog, setBlog] = useState(null);
	const [comments, setComments] = useState([]);
	const [reactions, setReactions] = useState([]);
	const [blogs, setBlogs] = useState([]);
	const [categories, setCategories] = useState([]);
	const [cities, setCities] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionError, setActionError] = useState("");
	const [actionBusy, setActionBusy] = useState(false);
	const [replyTarget, setReplyTarget] = useState(null);

	const loadDetails = useCallback(
		async (active: () => boolean = () => true) => {
			setLoading(true);
			setError("");

			try {
				const [
					blogResponse,
					commentResponse,
					reactionResponse,
					blogResponseList,
					categoryResponse,
					cityResponse,
				] = await Promise.all([
					getBlog(blogId),
					getBlogComments(blogId),
					getBlogReactions(blogId),
					getBlogs(),
					getCategories(),
					getCities(),
				]);

				if (!active()) return;
				setBlog(blogResponse);
				setComments(commentResponse ?? []);
				setReactions(reactionResponse ?? []);
				setBlogs(blogResponseList.blogs ?? []);
				setCategories(categoryResponse ?? []);
				setCities(cityResponse ?? []);
			} catch (err) {
				if (active())
					setError(err.message || "Could not load blog details.");
			} finally {
				if (active()) setLoading(false);
			}
		},
		[blogId],
	);

	useEffect(() => {
		let active = true;
		loadDetails(() => active);

		return () => {
			active = false;
		};
	}, [loadDetails]);

	const categoryLookup = useMemo(
		() => toLookup(categories, "categoryId"),
		[categories],
	);
	const cityLookup = useMemo(() => toLookup(cities, "cityId"), [cities]);
	const reactionCounts = useMemo(
		() => getReactionCounts(reactions),
		[reactions],
	);
	const myReaction = useMemo(
		() => reactions.find((reaction) => reaction.userId === auth?.userId),
		[auth?.userId, reactions],
	);
	const similarBlogs = useMemo(
		() => getSimilarBlogs(blog, blogs),
		[blog, blogs],
	);
	const categoryNames =
		blog?.categoryIds?.map(
			(id) => categoryLookup[id] ?? `Category ${id}`,
		) ?? [];
	const creatorName = blog
		? `${blog.creatorFirstName} ${blog.creatorLastName}`
		: "";
	const isCreator = Boolean(blog && auth?.userId === blog.creatorId);

	async function refreshInteractions() {
		const [nextBlog, nextComments, nextReactions] = await Promise.all([
			getBlog(blogId),
			getBlogComments(blogId),
			getBlogReactions(blogId),
		]);
		setBlog(nextBlog);
		setComments(nextComments ?? []);
		setReactions(nextReactions ?? []);
	}

	async function handleReaction(reaction) {
		setActionError("");
		setActionBusy(true);
		try {
			await addBlogReaction(blogId, reaction, auth.token);
			await refreshInteractions();
		} catch (err) {
			setActionError(err.message || "Could not update reaction.");
		} finally {
			setActionBusy(false);
		}
	}

	async function handleRemoveReaction() {
		setActionError("");
		setActionBusy(true);
		try {
			await removeBlogReaction(blogId, auth.token);
			await refreshInteractions();
		} catch (err) {
			setActionError(err.message || "Could not remove reaction.");
		} finally {
			setActionBusy(false);
		}
	}

	async function handleComment(comment, parentId?) {
		setActionError("");
		setActionBusy(true);
		try {
			await addBlogComment(
				blogId,
				{ comment, ...(parentId ? { parentId } : {}) },
				auth.token,
			);
			setReplyTarget(null);
			await refreshInteractions();
		} catch (err) {
			setActionError(err.message || "Could not post comment.");
		} finally {
			setActionBusy(false);
		}
	}

	return (
		<section className="page-section detail-section">
			<Link className="text-link" to="/">
				Back to blogs
			</Link>

			{loading && <Notice>Loading blog details...</Notice>}
			{error && <Notice error>{error}</Notice>}

			{!loading && !error && blog && (
				<div className="detail-layout">
					<article className="blog-detail">
						<div className="detail-image-frame">
							<RemoteImage
								src={`${apiBaseUrl}/blogs/${blog.blogId}/image`}
								alt=""
							/>
						</div>

						<div className="detail-content">
							<p className="blog-meta">
								{formatNzDate(blog.creationDate)}
							</p>
							<h2>{blog.title}</h2>
							{auth?.userId === blog.creatorId && (
								<Link
									className="button-link fit-link"
									to={`/blogs/${blog.blogId}/edit`}
								>
									Edit blog
								</Link>
							)}
							<p className="blog-description">
								{blog.description}
							</p>

							<div className="detail-grid">
								<div>
									<span className="detail-label">
										Creator
									</span>
									<div className="creator-row">
										<div className="avatar-frame">
											<RemoteImage
												src={`${apiBaseUrl}/users/${blog.creatorId}/image`}
												alt=""
											/>
										</div>
										<Link
											className="text-link"
											to={`/users/${blog.creatorId}`}
										>
											{creatorName}
										</Link>
									</div>
								</div>
								<div>
									<span className="detail-label">City</span>
									<p>
										{cityLookup[blog.cityId] ??
											`City ${blog.cityId}`}
									</p>
								</div>
								<div>
									<span className="detail-label">Series</span>
									<p>{blog.series ?? "No Series"}</p>
								</div>
								<div>
									<span className="detail-label">
										Unique commenters
									</span>
									<p>{blog.numberOfUniqueCommenters ?? 0}</p>
								</div>
							</div>

							<div>
								<span className="detail-label">Categories</span>
								<div
									className="tag-list"
									aria-label={`Categories for ${blog.title}`}
								>
									{categoryNames.map((category) => (
										<span key={category}>{category}</span>
									))}
								</div>
							</div>

							<div>
								<span className="detail-label">Reactions</span>
								<div className="reaction-list">
									{reactionOptions.map((option) => {
										let IconComponent = option.icon;

										return (
											<span
												key={option.value}
												style={{
													display: "flex",
													flexDirection: "row",
													alignItems: "center",
													gap: "8px",
												}}
											>
												<IconComponent color="#8c8c8c" />{" "}
												{reactionCounts[option.value] ??
													0}
											</span>
										);
									})}
								</div>
							</div>

							<div className="interaction-panel">
								<span className="detail-label">
									Your reaction
								</span>
								{!isAuthenticated && (
									<p className="form-note">
										<Link to="/login">Log in</Link> or{" "}
										<Link to="/register">register</Link> to
										react.
									</p>
								)}
								{isAuthenticated && isCreator && (
									<Notice>
										Creators cannot react to their own
										blogs.
									</Notice>
								)}
								{isAuthenticated && !isCreator && (
									<>
										<div className="reaction-controls">
											{reactionOptions.map((option) => (
												<Button
													className={
														myReaction?.reaction ===
														option.value
															? "selected-button"
															: "secondary-button"
													}
													variant={
														myReaction?.reaction ===
														option.value
															? "default"
															: "secondary"
													}
													disabled={actionBusy}
													key={option.value}
													type="button"
													onClick={() =>
														handleReaction(
															option.value,
														)
													}
												>
													{option.label}
												</Button>
											))}
										</div>
										{myReaction && (
											<Button
												className="danger-button fit-link"
												variant="destructive"
												disabled={actionBusy}
												type="button"
												onClick={handleRemoveReaction}
											>
												Remove reaction
											</Button>
										)}
									</>
								)}
							</div>
						</div>
					</article>

					{actionError && <Notice error>{actionError}</Notice>}

					<section className="detail-panel">
						<div className="section-header compact">
							<p className="eyebrow">Comments</p>
							<h2>{comments.length} comments</h2>
						</div>
						{!isAuthenticated ? (
							<p className="form-note">
								<Link to="/login">Log in</Link> or{" "}
								<Link to="/register">register</Link> to comment.
							</p>
						) : replyTarget ? (
							<CommentForm
								label={`Reply to ${replyTarget.commenterFirstName} ${replyTarget.commenterLastName}`}
								busy={actionBusy}
								onSubmit={(comment) =>
									handleComment(
										comment,
										replyTarget.commentId,
									)
								}
								onCancel={() => setReplyTarget(null)}
							/>
						) : (
							<CommentForm
								label="Add a comment"
								busy={actionBusy}
								onSubmit={(comment) => handleComment(comment)}
							/>
						)}
						<CommentList
							comments={comments}
							canComment={isAuthenticated}
							onReply={setReplyTarget}
						/>
					</section>

					<section className="detail-panel">
						<div className="section-header compact">
							<p className="eyebrow">Similar Blogs</p>
							<h2>{similarBlogs.length} related posts</h2>
						</div>
						{similarBlogs.length === 0 ? (
							<Notice>No similar blogs found.</Notice>
						) : (
							<div className="similar-grid">
								{similarBlogs.map((similarBlog) => (
									<BlogSummaryCard
										key={similarBlog.blogId}
										blog={similarBlog}
										categoryLookup={categoryLookup}
										cityLookup={cityLookup}
									/>
								))}
							</div>
						)}
					</section>
				</div>
			)}
		</section>
	);
}
