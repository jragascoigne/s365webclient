import { NavLink, Route, Routes } from "react-router-dom";
import { apiBaseUrl } from "./config.js";
import { BlogDetailPage } from "./pages/BlogDetailPage.jsx";
import { CreateBlogPage } from "./pages/CreateBlogPage.jsx";
import { EditBlogPage } from "./pages/EditBlogPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { MyBlogsPage } from "./pages/MyBlogsPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { EditProfilePage } from "./pages/EditProfilePage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { SetupPage } from "./pages/SetupPage.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { Button } from "./components/ui/button.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const publicNavItems = [{ to: "/", label: "Dashboard" }];
const privateNavItems = [
	{ to: "/blogs/new", label: "Create Blog" },
	{ to: "/my-blogs", label: "My Blogs" },
];

export default function App() {
	const { currentUser, isAuthenticated, logout } = useAuth();

	async function handleLogout() {
		await logout();
	}

	return (
		<div className="app-shell">
			<header className="top-bar">
				<div>
					<h1>Travel Blog Client</h1>
				</div>
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
					{isAuthenticated && (
						<NavLink to={`/users/${currentUser?.userId}`}>
							Profile
						</NavLink>
					)}
					<NavLink to="/setup">Setup</NavLink>
					{isAuthenticated ? (
						<Button
							className="nav-button"
							variant="outline"
							type="button"
							onClick={handleLogout}
						>
							Log out
							{currentUser?.firstName
								? ` ${currentUser.firstName}`
								: ""}
						</Button>
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
