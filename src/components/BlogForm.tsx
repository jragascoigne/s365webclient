import { useEffect, useMemo, useRef, useState } from "react";
import { validateImage } from "../utils/validation";
import { Notice } from "./Notice";
import { RequiredLabel } from "./RequiredLabel";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { ChevronsUpDown } from "lucide-react";

function toInitialCategoryIds(blog) {
	return blog?.categoryIds?.map(String) ?? [];
}

export function BlogForm({
	blog,
	categories,
	cities,
	seriesOptions = [],
	imageRequired = false,
	onSubmit,
	submitLabel,
	busy,
}: any) {
	const [title, setTitle] = useState(blog?.title ?? "");
	const [description, setDescription] = useState(blog?.description ?? "");
	const [cityId, setCityId] = useState(
		blog?.cityId ? String(blog.cityId) : "",
	);
	const [categoryIds, setCategoryIds] = useState(toInitialCategoryIds(blog));
	const [series, setSeries] = useState(blog?.series ?? "");
	const [seriesOpen, setSeriesOpen] = useState(false);
	const seriesRef = useRef<HTMLDivElement>(null);
	const [image, setImage] = useState(null);
	const [error, setError] = useState("");

	useEffect(() => {
		setTitle(blog?.title ?? "");
		setDescription(blog?.description ?? "");
		setCityId(blog?.cityId ? String(blog.cityId) : "");
		setCategoryIds(toInitialCategoryIds(blog));
		const initialSeries = blog?.series ?? "";
		setSeries(initialSeries);
		setImage(null);
	}, [blog]);

	useEffect(() => {
		function handleClickOutside(event) {
			if (
				seriesRef.current &&
				!seriesRef.current.contains(event.target)
			) {
				setSeriesOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const categoryOptions = useMemo(() => categories ?? [], [categories]);
	const categorySummary =
		categoryIds.length === 0
			? "Select categories"
			: categoryOptions
					.filter((category) =>
						categoryIds.includes(String(category.categoryId)),
					)
					.map((category) => category.name)
					.join(", ");

	function toggleCategory(value) {
		setCategoryIds((current) =>
			current.includes(value)
				? current.filter((item) => item !== value)
				: [...current, value],
		);
	}

	function handleSubmit(event) {
		event.preventDefault();
		const imageError = validateImage(image);

		if (!title.trim()) {
			setError("Title is required.");
			return;
		}
		if (!description.trim()) {
			setError("Description is required.");
			return;
		}
		if (!cityId) {
			setError("Choose a city.");
			return;
		}
		if (categoryIds.length === 0) {
			setError("Choose at least one category.");
			return;
		}

		if (imageError) {
			setError(imageError);
			return;
		}

		setError("");
		onSubmit({
			data: {
				title: title.trim(),
				description: description.trim(),
				cityId: Number(cityId),
				categoryIds: categoryIds.map(Number),
				...(series.trim() ? { series: series.trim() } : {}),
			},
			image,
		});
	}

	return (
		<form className="entity-form" onSubmit={handleSubmit}>
			{error && <Notice error>{error}</Notice>}

			<div className="control-group">
				<RequiredLabel htmlFor="blog-title">Title</RequiredLabel>
				<Input
					id="blog-title"
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					required
				/>
			</div>

			<div className="control-group">
				<RequiredLabel htmlFor="blog-description">
					Description
				</RequiredLabel>
				<Textarea
					id="blog-description"
					value={description}
					onChange={(event) => setDescription(event.target.value)}
					rows="7"
					required
				/>
			</div>

			<div className="split-controls">
				<div className="control-group">
					<RequiredLabel htmlFor="blog-city">City</RequiredLabel>
					<Select value={cityId} onValueChange={setCityId} required>
						<SelectTrigger id="blog-city" className="w-full">
							<SelectValue placeholder="Select a city" />
						</SelectTrigger>
						<SelectContent>
							{cities.map((city) => (
								<SelectItem
									key={city.cityId}
									value={String(city.cityId)}
								>
									{city.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="control-group">
					<Label htmlFor="blog-series">Series</Label>
					<div className="series-combobox" ref={seriesRef}>
						<div className="series-combobox-trigger">
							<Input
								id="blog-series"
								value={series}
								onChange={(event) =>
									setSeries(event.target.value)
								}
								onFocus={() => setSeriesOpen(true)}
								placeholder="Select or type a series"
								autoComplete="off"
							/>
							{seriesOptions.length > 0 && (
								<button
									type="button"
									className="series-combobox-chevron"
									tabIndex={-1}
									onClick={() =>
										setSeriesOpen((open) => !open)
									}
									aria-label="Toggle series options"
								>
									<ChevronsUpDown
										className="dropdown-icon"
										aria-hidden="true"
									/>
								</button>
							)}
						</div>
						{seriesOpen && seriesOptions.length > 0 && (
							<div className="series-combobox-menu">
								{seriesOptions.map((option) => (
									<button
										key={option}
										type="button"
										className="series-combobox-option"
										onMouseDown={(e) => {
											e.preventDefault();
											setSeries(option);
											setSeriesOpen(false);
										}}
									>
										{option}
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			<fieldset className="control-group">
				<legend>
					Categories{" "}
					<span className="required-marker" aria-hidden="true">
						*
					</span>
				</legend>
				<details className="category-picker">
					<summary>
						<span>{categorySummary}</span>
						<ChevronsUpDown
							className="dropdown-icon"
							aria-hidden="true"
						/>
					</summary>
					<div className="checkbox-grid spacious">
						{categoryOptions.map((category) => {
							const value = String(category.categoryId);
							return (
								<label key={category.categoryId}>
									<Checkbox
										checked={categoryIds.includes(value)}
										onCheckedChange={() =>
											toggleCategory(value)
										}
									/>
									<span>{category.name}</span>
								</label>
							);
						})}
					</div>
				</details>
			</fieldset>

			<div className="control-group">
				{imageRequired ? (
					<RequiredLabel htmlFor="blog-image">Image</RequiredLabel>
				) : (
					<Label htmlFor="blog-image">Image</Label>
				)}
				<div className="file-picker">
					<Input
						id="blog-image"
						className="file-picker-input"
						type="file"
						accept="image/png,image/jpeg,image/gif"
						onChange={(event) =>
							setImage(event.target.files?.[0] ?? null)
						}
					/>
					<label className="file-picker-button" htmlFor="blog-image">
						Select image
					</label>
					<span className="file-picker-name">
						{image?.name ?? "No image selected"}
					</span>
				</div>
			</div>

			<Button type="submit" disabled={busy}>
				{busy ? "Saving..." : submitLabel}
			</Button>
		</form>
	);
}
