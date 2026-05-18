import { BlogBrowser } from "../components/BlogBrowser";

export function HomePage({ apiBaseUrl }) {
	return (
		<>
			<div className="home-page">
				<BlogBrowser />
			</div>
		</>
	);
}
