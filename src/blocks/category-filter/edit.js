/**
 * External dependencies.
 */
import clsx from "clsx";

/**
 * WordPress dependencies.
 */
import { __, sprintf } from "@wordpress/i18n";
import { useEffect, useMemo } from "@wordpress/element";
import { useSelect, useDispatch } from "@wordpress/data";
import { store as coreStore, useEntityRecords } from "@wordpress/core-data";
// The color dropdown is the same (experimental) control core blocks use for
// extra color settings in the Color panel.
/* eslint-disable @wordpress/no-unsafe-wp-apis */
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	JustifyToolbar,
	store as blockEditorStore,
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
} from "@wordpress/block-editor";
/* eslint-enable @wordpress/no-unsafe-wp-apis */
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	FormTokenField,
	Notice,
	Button,
	Placeholder,
	Spinner,
} from "@wordpress/components";
import { decodeEntities } from "@wordpress/html-entities";

/**
 * Internal dependencies.
 */
import "./editor.scss";

const ORDER_OPTIONS = [
	{ value: "count/desc", label: __("Most items first", "blocklayouts") },
	{ value: "count/asc", label: __("Fewest items first", "blocklayouts") },
	{ value: "name/asc", label: __("Name: A → Z", "blocklayouts") },
	{ value: "name/desc", label: __("Name: Z → A", "blocklayouts") },
];

/**
 * Color settings shown in the block's Color panel, and the CSS custom property
 * each one sets (render.php uses the same map). Settings that aren't shown by
 * default can be added from the panel's options menu.
 */
const COLOR_SETTINGS = [
	{ attribute: "itemBorderColor", cssVar: "--bl-filter-item-border", label: __("Item border", "blocklayouts"), isShownByDefault: true },
	{ attribute: "itemBackgroundColor", cssVar: "--bl-filter-item-background", label: __("Item background", "blocklayouts") },
	{ attribute: "hoverBackgroundColor", cssVar: "--bl-filter-hover-background", label: __("Hover background", "blocklayouts") },
	{ attribute: "countColor", cssVar: "--bl-filter-count-color", label: __("Count text", "blocklayouts") },
	{ attribute: "countBackgroundColor", cssVar: "--bl-filter-count-background", label: __("Count background", "blocklayouts"), isShownByDefault: true },
	{ attribute: "activeColor", cssVar: "--bl-filter-accent", label: __("Active accent", "blocklayouts"), isShownByDefault: true },
	{ attribute: "activeTextColor", cssVar: "--bl-filter-active-color", label: __("Active text", "blocklayouts") },
	{ attribute: "activeBackgroundColor", cssVar: "--bl-filter-active-background", label: __("Active background", "blocklayouts"), isShownByDefault: true },
	{ attribute: "activeCountColor", cssVar: "--bl-filter-active-count-color", label: __("Active count text", "blocklayouts") },
	{ attribute: "activeCountBackgroundColor", cssVar: "--bl-filter-active-count-background", label: __("Active count background", "blocklayouts") },
];

/**
 * Convert a block style value such as `var:preset|spacing|40` to CSS.
 *
 * @param {string} value Raw value.
 * @return {string|undefined} CSS value.
 */
const toCssValue = (value) => {
	if (typeof value !== "string" || !value) {
		return undefined;
	}
	if (value.startsWith("var:")) {
		return `var(--wp--${value.slice(4).split("|").join("--")})`;
	}
	return value;
};

/**
 * Sort and filter terms the same way render.php does.
 *
 * @param {Array}  terms      Terms from the REST API.
 * @param {Object} attributes Block attributes.
 * @param {Object} taxonomy   Taxonomy object.
 * @return {Array} Terms to display.
 */
const prepareTerms = (terms, attributes, taxonomy) => {
	const { includeTerms, hideEmpty, topLevelOnly, orderBy } = attributes;

	if (includeTerms?.length) {
		return includeTerms
			.map((id) => terms.find((term) => term.id === id))
			.filter((term) => term && (!hideEmpty || term.count > 0));
	}

	const [field, order] = orderBy.split("/");
	const direction = order === "asc" ? 1 : -1;

	return terms
		.filter((term) => !hideEmpty || term.count > 0)
		.filter((term) => !topLevelOnly || !taxonomy?.hierarchical || !term.parent)
		.sort((a, b) =>
			field === "name"
				? direction * a.name.localeCompare(b.name)
				: direction * (a.count - b.count)
		);
};

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		mode,
		queryId,
		postType,
		taxonomy,
		showAll,
		allLabel,
		showCount,
		hideEmpty,
		topLevelOnly,
		orderBy,
		includeTerms,
		label,
		justifyContent,
		style,
	} = attributes;

	const isQueryMode = mode === "query";
	const colorGradientSettings = useMultipleOriginColorsAndGradients();
	const { updateBlockAttributes } = useDispatch(blockEditorStore);

	// Query Loops available in the current editor.
	const queryClientIds = useSelect(
		(select) => select(blockEditorStore).getBlocksByName("core/query"),
		[]
	);
	const queryAttributes = useSelect(
		(select) =>
			queryClientIds.map((id) => select(blockEditorStore).getBlockAttributes(id)),
		[queryClientIds]
	);
	const queries = useMemo(
		() =>
			queryClientIds
				.map((id, index) => ({ clientId: id, ...queryAttributes[index] }))
				.filter((query) => query.queryId !== undefined),
		[queryClientIds, queryAttributes]
	);
	const targetQuery = queries.find((query) => query.queryId === queryId);

	// Pick the only Query Loop automatically.
	useEffect(() => {
		if (isQueryMode && queryId === undefined && queries.length === 1) {
			setAttributes({ queryId: queries[0].queryId });
		}
	}, [isQueryMode, queryId, queries, setAttributes]);

	// Keep the post type in sync with the target Query Loop.
	const targetPostType = targetQuery?.query?.postType;
	useEffect(() => {
		if (isQueryMode && targetPostType && targetPostType !== postType) {
			setAttributes({ postType: targetPostType });
		}
	}, [isQueryMode, targetPostType, postType, setAttributes]);

	// Taxonomies that can be used with this post type.
	const allTaxonomies = useSelect(
		(select) => select(coreStore).getTaxonomies({ per_page: -1 }),
		[]
	);
	const taxonomyOptions = useMemo(
		() =>
			(allTaxonomies || [])
				.filter((tax) => tax.visibility?.show_ui !== false)
				.filter((tax) => !postType || tax.types?.includes(postType))
				.filter((tax) => isQueryMode || tax.visibility?.publicly_queryable)
				.map((tax) => ({ value: tax.slug, label: tax.name })),
		[allTaxonomies, postType, isQueryMode]
	);
	const taxonomyObject = allTaxonomies?.find((tax) => tax.slug === taxonomy);

	// Fall back to the first valid taxonomy when the current one doesn't apply.
	useEffect(() => {
		if (
			postType &&
			taxonomyOptions.length &&
			!taxonomyOptions.some((option) => option.value === taxonomy)
		) {
			setAttributes({ taxonomy: taxonomyOptions[0].value, includeTerms: [] });
		}
	}, [postType, taxonomyOptions, taxonomy, setAttributes]);

	const { records: terms, isResolving } = useEntityRecords("taxonomy", taxonomy, {
		per_page: 100,
		hide_empty: false,
		_fields: "id,name,slug,count,parent",
		context: "view",
	});

	const visibleTerms = useMemo(
		() =>
			prepareTerms(
				terms || [],
				{ includeTerms, hideEmpty, topLevelOnly, orderBy },
				taxonomyObject
			),
		[terms, includeTerms, hideEmpty, topLevelOnly, orderBy, taxonomyObject]
	);

	const blockProps = useBlockProps({
		className: clsx({
			[`is-content-justification-${justifyContent}`]: justifyContent,
		}),
		style: {
			"--bl-filter-gap": toCssValue(style?.spacing?.blockGap),
			"--bl-filter-radius":
				typeof style?.border?.radius === "string"
					? toCssValue(style.border.radius)
					: undefined,
			...Object.fromEntries(
				COLOR_SETTINGS.map(({ attribute, cssVar }) => [
					cssVar,
					attributes[attribute] || undefined,
				])
			),
		},
	});

	const termNames = (terms || []).map((term) => decodeEntities(term.name));
	const selectedTermNames = (includeTerms || [])
		.map((id) => terms?.find((term) => term.id === id))
		.filter(Boolean)
		.map((term) => decodeEntities(term.name));

	const onChangeIncludedTerms = (names) => {
		const ids = names
			.map((name) => terms?.find((term) => decodeEntities(term.name) === name))
			.filter(Boolean)
			.map((term) => term.id);
		setAttributes({ includeTerms: [...new Set(ids)] });
	};

	// Total for the "All" option.
	const { totalItems } = useEntityRecords(
		"postType",
		postType || "post",
		{ per_page: 1, _fields: "id", context: "view" },
		{ enabled: showAll && showCount }
	);

	const items = [
		...(showAll
			? [
					{
						id: "all",
						name: allLabel || __("All", "blocklayouts"),
						count: showCount ? totalItems ?? "–" : null,
					},
			  ]
			: []),
		...visibleTerms.map((term) => ({
			id: term.id,
			name: decodeEntities(term.name),
			count: showCount ? term.count : null,
		})),
	];

	const inspector = (
		<>
			<BlockControls group="block">
				<JustifyToolbar
					allowedControls={["left", "center", "right"]}
					value={justifyContent}
					onChange={(value) => setAttributes({ justifyContent: value })}
				/>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={__("Filter settings", "blocklayouts")}>
					<SelectControl
						label={__("Links go to", "blocklayouts")}
						value={mode}
						options={[
							{
								value: "query",
								label: __("Filtered Query Loop on this page", "blocklayouts"),
							},
							{
								value: "archive",
								label: __("Term archive pages", "blocklayouts"),
							},
						]}
						onChange={(value) => setAttributes({ mode: value })}
						help={
							isQueryMode
								? __(
										"Filters the results of a Query Loop on the same page.",
										"blocklayouts"
								  )
								: __(
										"Each option links to its own archive page. Best for SEO landing pages.",
										"blocklayouts"
								  )
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					{isQueryMode && queries.length > 0 && (
						<SelectControl
							label={__("Query Loop", "blocklayouts")}
							value={queryId ?? ""}
							options={[
								...(queryId === undefined
									? [{ value: "", label: __("Select a Query Loop", "blocklayouts") }]
									: []),
								...queries.map((query) => ({
									value: query.queryId,
									label: sprintf(
										/* translators: 1: Query Loop ID, 2: post type. */
										__("Query Loop #%1$d (%2$s)", "blocklayouts"),
										query.queryId,
										query.query?.postType || "post"
									),
								})),
							]}
							onChange={(value) =>
								setAttributes({ queryId: value === "" ? undefined : Number(value) })
							}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					)}

					{isQueryMode && queries.length === 0 && (
						<TextControl
							type="number"
							label={__("Query Loop ID", "blocklayouts")}
							value={queryId ?? ""}
							min={0}
							onChange={(value) =>
								setAttributes({ queryId: value === "" ? undefined : Number(value) })
							}
							help={__(
								"No Query Loop found in this editor. Enter the queryId of the Query Loop to filter (it may live in the template).",
								"blocklayouts"
							)}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					)}

					{isQueryMode && targetQuery?.query?.inherit && (
						<Notice status="warning" isDismissible={false} className="blocklayouts-category-filter-notice">
							{__(
								"This Query Loop uses the template's query, so it can't be filtered here. Set the Query Loop's query type to “Custom”, or switch to term archive pages.",
								"blocklayouts"
							)}
						</Notice>
					)}

					{isQueryMode && targetQuery && !targetQuery.query?.inherit && !targetQuery.enhancedPagination && (
						<Notice status="info" isDismissible={false} className="blocklayouts-category-filter-notice">
							<p>
								{__(
									"The Query Loop reloads the full page. Turn on instant filtering to update results without a page reload.",
									"blocklayouts"
								)}
							</p>
							<Button
								variant="secondary"
								onClick={() =>
									updateBlockAttributes(targetQuery.clientId, {
										enhancedPagination: true,
									})
								}
							>
								{__("Turn on instant filtering", "blocklayouts")}
							</Button>
						</Notice>
					)}

					<SelectControl
						label={__("Taxonomy", "blocklayouts")}
						value={taxonomy}
						options={taxonomyOptions}
						onChange={(value) => setAttributes({ taxonomy: value, includeTerms: [] })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={__("Options", "blocklayouts")}>
					<ToggleControl
						label={__("Show “All” option", "blocklayouts")}
						checked={showAll}
						onChange={(value) => setAttributes({ showAll: value })}
						help={
							!isQueryMode
								? __("Links to the post type archive, when it has one.", "blocklayouts")
								: undefined
						}
						__nextHasNoMarginBottom
					/>
					{showAll && (
						<TextControl
							label={__("“All” label", "blocklayouts")}
							value={allLabel}
							placeholder={__("All", "blocklayouts")}
							onChange={(value) => setAttributes({ allLabel: value })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					)}
					<ToggleControl
						label={__("Show item count", "blocklayouts")}
						checked={showCount}
						onChange={(value) => setAttributes({ showCount: value })}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__("Hide empty terms", "blocklayouts")}
						checked={hideEmpty}
						onChange={(value) => setAttributes({ hideEmpty: value })}
						__nextHasNoMarginBottom
					/>
					<FormTokenField
						label={__("Only show these terms", "blocklayouts")}
						value={selectedTermNames}
						suggestions={termNames}
						onChange={onChangeIncludedTerms}
						__experimentalExpandOnFocus
						__experimentalShowHowTo={false}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<p className="components-base-control__help">
						{__("Leave empty to show all terms. Selected terms keep the order you add them in.", "blocklayouts")}
					</p>
					{!includeTerms?.length && (
						<>
							<SelectControl
								label={__("Order", "blocklayouts")}
								value={orderBy}
								options={ORDER_OPTIONS}
								onChange={(value) => setAttributes({ orderBy: value })}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
							{taxonomyObject?.hierarchical && (
								<ToggleControl
									label={__("Top-level terms only", "blocklayouts")}
									checked={topLevelOnly}
									onChange={(value) => setAttributes({ topLevelOnly: value })}
									__nextHasNoMarginBottom
								/>
							)}
						</>
					)}
					<TextControl
						label={__("Accessible label", "blocklayouts")}
						value={label}
						placeholder={sprintf(
							/* translators: %s: Taxonomy singular name. */
							__("Filter by %s", "blocklayouts"),
							taxonomyObject?.labels?.singular_name || taxonomy
						)}
						onChange={(value) => setAttributes({ label: value })}
						help={__("Read by screen readers to describe this filter.", "blocklayouts")}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="color">
				<ColorGradientSettingsDropdown
					__experimentalIsRenderedInSidebar
					settings={COLOR_SETTINGS.map(
						({ attribute, label: colorLabel, isShownByDefault = false }) => ({
							colorValue: attributes[attribute],
							label: colorLabel,
							onColorChange: (value) => setAttributes({ [attribute]: value }),
							isShownByDefault,
							resetAllFilter: (blockAttributes) => ({
								...blockAttributes,
								[attribute]: undefined,
							}),
							enableAlpha: true,
							clearable: true,
						})
					)}
					panelId={clientId}
					{...colorGradientSettings}
				/>
			</InspectorControls>
		</>
	);

	if (isQueryMode && queryId === undefined && queries.length !== 1) {
		return (
			<>
				{inspector}
				<div {...blockProps}>
					<Placeholder
						icon="filter"
						label={__("Category Filter", "blocklayouts")}
						instructions={
							queries.length
								? __("Choose the Query Loop to filter in the block settings.", "blocklayouts")
								: __(
										"Add a Query Loop to this page, or switch to term archive links in the block settings.",
										"blocklayouts"
								  )
						}
					/>
				</div>
			</>
		);
	}

	return (
		<>
			{inspector}
			<nav {...blockProps}>
				{isResolving && !terms && <Spinner />}
				{!(isResolving && !terms) && items.length === 0 && (
					<p className="wp-block-blocklayouts-category-filter__empty">
						{__("No terms to show.", "blocklayouts")}
					</p>
				)}
				{!(isResolving && !terms) && items.length > 0 && (
					<>
						<div className="wp-block-blocklayouts-category-filter__viewport">
							<ul className="wp-block-blocklayouts-category-filter__list">
								{items.map((item, index) => (
									<li key={item.id} className="wp-block-blocklayouts-category-filter__item">
										<a
											href="#category-filter"
											className={clsx("wp-block-blocklayouts-category-filter__link", {
												"is-active": index === 0,
											})}
											aria-current={index === 0 ? "page" : undefined}
											onClick={(event) => event.preventDefault()}
										>
											<span className="wp-block-blocklayouts-category-filter__label">
												{item.name}
											</span>
											{item.count !== null && (
												<span className="wp-block-blocklayouts-category-filter__count">
													{item.count}
												</span>
											)}
										</a>
									</li>
								))}
							</ul>
						</div>
					</>
				)}
			</nav>
		</>
	);
}
