/**
 * External dependencies
 */
import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";

/**
 * Internal dependencies
 */
import { PatternPreview } from "./preview";

// Constants
const COLUMN_OPTIONS = [
	{ label: "1 Columns", value: "1" },
	{ label: "2 Columns", value: "2" },
	{ label: "3 Columns", value: "3" },
	{ label: "4 Columns", value: "4" },
	{ label: "5+ Columns", value: "5+" },
];

const MEDIA_ALIGNMENT_OPTIONS = [
	{ label: "Left", value: "left" },
	{ label: "Right", value: "right" },
	{ label: "Background", value: "background" },
	{ label: "Center", value: "center" },
];

const ELEMENTS_OPTIONS = [
	{ label: "Image", value: "image" },
	{ label: "Paragraph", value: "paragraph" },
	{ label: "Heading", value: "heading" },
	{ label: "Button", value: "button" },
	{ label: "Cover", value: "cover" },
	{ label: "Icon", value: "icon" },
];

export const createFields = (isPremiumUser, insertPattern) => [
	{
		id: "preview",
		label: __("Preview", "blocklayouts"),
		render: ({ item }) => (
			<PatternPreview
				thumbnailUrl={item.thumbnail_url}
				isPremiumUser={isPremiumUser}
				showPremiumButton={item.is_premium && !isPremiumUser}
				blocks={item.parsedBlocks}
				onClick={() => insertPattern(item)}
			/>
		),
		enableSorting: false,
		enableGlobalSearch: false,
		enableHiding: false,
	},
	{
		id: "title",
		label: __("Title", "blocklayouts"),
		getValue: ({ item }) => String(item.title || ""),
		render: ({ item }) => {
			// Check if item is new (within 15 days)
			const isNew = () => {
				if (!item.date) return false;

				const itemDate = new Date(item.date);
				const currentDate = new Date();
				const diffTime = Math.abs(currentDate - itemDate);
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

				return diffDays <= 15;
			};

			return (
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<span>{item.title || ""}</span>
					{isNew() && (
						<span
							style={{
								backgroundColor: "#eff6ff",
								color: "#2563eb",
								fontSize: "10px",
								fontWeight: "500",
								padding: "4px 6px",
								borderRadius: "99px",
								lineHeight: "1",
								textTransform: "uppercase",
								border: "1px solid #93c5fd",
							}}
						>
							{__("New", "blocklayouts")}
						</span>
					)}
				</div>
			);
		},
		enableGlobalSearch: true,
		enableSorting: true,
		enableHiding: false,
	},
	{
		id: "id",
		label: __("ID", "blocklayouts"),
		getValue: ({ item }) => String(item.id || ""),
		enableGlobalSearch: true,
		enableSorting: false,
	},
	{
		id: "keywords",
		label: __("Keywords", "blocklayouts"),
		getValue: ({ item }) => String(item.keywords || ""),
		enableGlobalSearch: true,
		enableSorting: false,
	},
	{
		id: "columns",
		label: __("Columns", "blocklayouts"),
		getValue: ({ item }) => String(item.columns || ""),
		enableGlobalSearch: false,
		elements: COLUMN_OPTIONS,
		filterBy: {
			operators: ["isAny"],
		},
		enableSorting: false,
	},
	{
		id: "elements",
		label: __("Elements", "blocklayouts"),
		getValue: ({ item }) => item.elements || "",
		enableGlobalSearch: false,
		elements: ELEMENTS_OPTIONS,
		filterBy: {
			operators: ["isAny"],
		},
		enableSorting: false,
	},
	{
		id: "media_alignment",
		label: __("Media Alignment", "blocklayouts"),
		getValue: ({ item }) => item.media_alignment || "",
		enableGlobalSearch: false,
		elements: MEDIA_ALIGNMENT_OPTIONS,
		filterBy: {
			operators: ["isAny"],
		},
		enableSorting: false,
	},
	{
		id: "dependencies",
		label: __("Dependencies", "blocklayouts"),
		getValue: ({ item }) => item.dependencies || "",
		enableGlobalSearch: false,
		filterBy: {
			operators: ["isAny"],
		},
		enableSorting: false,
		isVisible: false,
	},
	{
		id: "categories",
		label: __("Categories", "blocklayouts"),
		getValue: ({ item }) =>
			String(item.categories?.map((cat) => cat.name).join(", ") || ""),
		enableGlobalSearch: true,
		enableSorting: false,
	},
	{
		id: "category",
		label: __("Category", "blocklayouts"),
		getValue: ({ item }) => item.categories?.map((cat) => cat.slug) || "",
		filterBy: {
			operators: [`isAny`],
		},
		enableGlobalSearch: false,
		enableSorting: false,
		isVisible: false,
	},
	{
		id: "is_premium",
		label: __("Premium", "blocklayouts"),
		getValue: ({ item }) => String(item.is_premium ? "1" : "0"),
		filterBy: {
			operators: ["is"],
		},
		enableSorting: true,
	},
	{
		id: "date",
		label: __("Date Created", "blocklayouts"),
		getValue: ({ item }) => String(item.date || ""),
		enableSorting: true,
	},
];
