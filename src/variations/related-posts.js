/**
 * WordPress dependencies
 */
import { registerBlockVariation } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { FormTokenField } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { store as coreStore } from "@wordpress/core-data";

/**
 * Register "Related Posts" variation for core/query block
 */
registerBlockVariation("core/query", {
	name: "blocklayouts/related-posts",
	title: __("Related Posts", "blocklayouts"),
	description: __(
		"Display posts related to the current post based on categories, tags, or custom taxonomies.",
		"blocklayouts",
	),
	category: "blocklayouts",
	scope: ["inserter"],
	attributes: {
		namespace: "blocklayouts/related-posts",
	},
	isActive: ({ namespace }) => {
		return namespace === "blocklayouts/related-posts";
	},
	innerBlocks: [
		[
			"core/post-template",
			{
				namespace: "blocklayouts/related-posts-template",
				layout: {
					type: "grid",
					columnCount: 3,
				},
			},
			[["core/post-featured-image"], ["core/post-title"]],
		],
		["core/query-no-results"],
	],
});

registerBlockVariation("core/post-template", {
	name: "blocklayouts/related-posts-template",
	title: __("Related Posts Template", "blocklayouts"),
	category: "blocklayouts",
	scope: ["inserter"],
	attributes: {
		namespace: "blocklayouts/related-posts-template", // core/post-template doesn't have namespace attribute!!
		layout: {
			type: "grid",
			columnCount: 3,
		},
	},
	isActive: ({ namespace }) => {
		return namespace === "blocklayouts/related-posts-template";
	},
});

addFilter(
	"blocks.registerBlockType",
	"blocklayouts/related-posts/add-namespace-attribute",
	(settings, name) => {
		if (name !== "core/post-template") {
			return settings;
		}

		return {
			...settings,
			attributes: {
				...settings.attributes,
				namespace: {
					type: "string",
				},
			},
			usesContext: [...(settings.usesContext || []), "relatedPostsTaxonomies"],
		};
	},
);

addFilter(
	"blocks.registerBlockType",
	"blocklayouts/related-posts/add-related-posts-taxonomies-attribute",
	(settings, name) => {
		if (name !== "core/query") {
			return settings;
		}

		return {
			...settings,
			attributes: {
				...settings.attributes,
				relatedPostsTaxonomies: {
					type: "array",
				},
			},
			providesContext: {
				...(settings.providesContext || {}),
				relatedPostsTaxonomies: "relatedPostsTaxonomies",
			},
		};
	},
);
/**
 * Add inspector controls for Related Posts
 */
addFilter(
	"editor.BlockEdit",
	"blocklayouts/related-posts/add-inspector-controls",
	createHigherOrderComponent((BlockEdit) => {
		return (props) => {
			const { name, attributes, setAttributes } = props;

			// Only apply to core/query with our namespace
			if (
				name !== "core/query" ||
				attributes.namespace !== "blocklayouts/related-posts"
			) {
				return <BlockEdit {...props} />;
			}

			const { relatedPostsTaxonomies = [] } = attributes;

			// Fetch all public taxonomies
			const { taxonomies, isLoadingTaxonomies } = useSelect((select) => {
				const { getTaxonomies } = select(coreStore);
				const allTaxonomies = getTaxonomies({ per_page: -1 }) || [];

				// Filter to get only public taxonomies
				const publicTaxonomies = allTaxonomies.filter(
					(taxonomy) => taxonomy.visibility?.publicly_queryable !== false,
				);

				return {
					taxonomies: publicTaxonomies,
					isLoadingTaxonomies: !allTaxonomies,
				};
			}, []);

			// Prepare suggestions - show taxonomy names
			const suggestions = taxonomies
				? taxonomies.map((taxonomy) => taxonomy.name)
				: [];

			// Get the selected taxonomy labels for display
			const selectedTaxonomyLabels = relatedPostsTaxonomies.map((slug) => {
				const taxonomy = taxonomies?.find((tax) => tax.slug === slug);
				return taxonomy ? taxonomy.name : slug;
			});

			// Handle taxonomy selection
			const handleTaxonomyChange = (tokens) => {
				// Convert taxonomy names back to slugs
				const taxonomySlugs = tokens.map((token) => {
					const taxonomy = taxonomies?.find(
						(tax) => tax.name === token || tax.slug === token,
					);
					return taxonomy ? taxonomy.slug : token;
				});

				setAttributes({ relatedPostsTaxonomies: taxonomySlugs });
			};

			return (
				<>
					<BlockEdit key="edit" {...props} />
					<InspectorControls group="filters">just testing</InspectorControls>

					<InspectorControls group="advanced">
						<FormTokenField
							label={__("Filter by Taxonomies", "blocklayouts")}
							value={selectedTaxonomyLabels}
							suggestions={suggestions}
							onChange={handleTaxonomyChange}
							placeholder={__(
								"Add taxonomies (e.g., Categories, Tags)",
								"blocklayouts",
							)}
							disabled={isLoadingTaxonomies}
							__next40pxDefaultSize
							__experimentalAutoSelectFirstMatch
							__experimentalExpandOnFocus
							__experimentalShowHowTo={false}
						/>
						<p style={{ fontSize: "12px", color: "#757575" }}>
							{__(
								"Select which taxonomies to use for finding related posts. Leave empty to use all taxonomies.",
								"blocklayouts",
							)}
						</p>
					</InspectorControls>
				</>
			);
		};
	}, "withRelatedPostsControls"),
);
