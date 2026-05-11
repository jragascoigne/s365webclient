import { BlogBrowser } from "../components/BlogBrowser.jsx";

export function HomePage({ apiBaseUrl }) {
	return (
		<>
			<div className="home-page">
				<BlogBrowser />
			</div>
		</>
	);
}
