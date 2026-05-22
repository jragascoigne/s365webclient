import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { apiBaseUrl } from "./config";
import { BlogDetailPage } from "./pages/BlogDetailPage";
import { CreateBlogPage } from "./pages/CreateBlogPage";
import { EditBlogPage } from "./pages/EditBlogPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MyBlogsPage } from "./pages/MyBlogsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Button } from "./components/ui/button";
import { useAuth } from "./stores/auth";
import "./styles/base.css";
import { Tent } from "lucide-react";

const publicNavItems = [{ to: "/", label: "Dashboard" }];
const privateNavItems = [
	{ to: "/blogs/new", label: "Create Blog" },
	{ to: "/my-blogs", label: "My Blogs" },
];

function ProfileMenu({ currentUser, onLogout }: any) {
	const [imageFailed, setImageFailed] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const location = useLocation();
	const userId = currentUser?.userId;
	const initials = `${currentUser?.firstName?.[0] ?? ""}${
		currentUser?.lastName?.[0] ?? ""
	}`.trim();

	useEffect(() => {
		setImageFailed(false);
	}, [userId]);

	useEffect(() => {
		setIsOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		if (!isOpen) return;

		function handlePointerDown(event: PointerEvent) {
			if (!menuRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	async function handleLogoutClick() {
		setIsOpen(false);
		await onLogout();
	}

	return (
		<div className="profile-menu" ref={menuRef}>
			<button
				className="profile-menu-trigger"
				type="button"
				aria-label="Account menu"
				aria-expanded={isOpen}
				onClick={() => setIsOpen((current) => !current)}
			>
				<span className="header-avatar">
					{userId && !imageFailed ? (
						<img
							src={`${apiBaseUrl}/users/${userId}/image`}
							alt=""
							onError={() => setImageFailed(true)}
						/>
					) : (
						<span>{initials || "A"}</span>
					)}
				</span>
			</button>
			{isOpen && (
				<div className="profile-menu-panel">
					<NavLink to={`/users/${userId}`}>View profile</NavLink>
					<Button
						variant="destructive"
						type="button"
						onClick={handleLogoutClick}
					>
						Log out
					</Button>
				</div>
			)}
		</div>
	);
}

export default function App() {
	const { currentUser, isAuthenticated, logout } = useAuth();

	async function handleLogout() {
		await logout();
	}

	return (
		<div className="app-shell">
			<header className="top-bar">
				<Link
					to="/"
					className="nav-title"
				>
					<Tent /> Atent
				</Link>
				<nav aria-label="Primary navigation">
					{[
						...publicNavItems,
						...(isAuthenticated ? privateNavItems : []),
					].map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.to === "/"}
						>
							{item.label}
						</NavLink>
					))}
					{isAuthenticated ? (
						<ProfileMenu
							currentUser={currentUser}
							onLogout={handleLogout}
						/>
					) : (
						<>
							<NavLink to="/login">Log in</NavLink>
							<NavLink to="/register">Register</NavLink>
						</>
					)}
				</nav>
			</header>

			<main>
				<Routes>
					<Route
						path="/"
						element={<HomePage apiBaseUrl={apiBaseUrl} />}
					/>
					<Route path="/blogs/:blogId" element={<BlogDetailPage />} />
					<Route
						path="/blogs/new"
						element={
							<ProtectedRoute>
								<CreateBlogPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/blogs/:blogId/edit"
						element={
							<ProtectedRoute>
								<EditBlogPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/my-blogs"
						element={
							<ProtectedRoute>
								<MyBlogsPage />
							</ProtectedRoute>
						}
					/>
					<Route path="/users/:userId" element={<ProfilePage />} />
					<Route
						path="/profile/edit"
						element={
							<ProtectedRoute>
								<EditProfilePage />
							</ProtectedRoute>
						}
					/>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
				</Routes>
			</main>
		</div>
	);
}
