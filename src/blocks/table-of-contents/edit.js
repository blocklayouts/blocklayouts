/**
 * External dependencies.
 */
import clsx from "clsx";

/**
 * WordPress dependencies.
 */
import { isRTL, __ } from "@wordpress/i18n";
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	RichText,
} from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";
import { store as blockEditorStore } from "@wordpress/block-editor";
import { useMemo } from "@wordpress/element";
import { create, getTextContent } from "@wordpress/rich-text";
import {
	PanelBody,
	ToggleControl,
	CheckboxControl,
	ToolbarButton,
	Dropdown,
	Button,
	MenuGroup,
	MenuItem,
	Icon,
} from "@wordpress/components";
import {
	formatListBullets,
	formatListBulletsRTL,
	formatListNumbered,
	formatListNumberedRTL,
	check,
	chevronDown,
} from "@wordpress/icons";

/**
 * Internal dependencies.
 */
import "./editor.scss";

/**
 * Returns an array of heading blocks enhanced with properties.
 */
const computeOutlineHeadings = (blocks = [], allowedHeadings = []) => {
	return blocks
		.filter((block) => {
			if (block.name !== "core/heading") {
				return false;
			}
			const level = block.attributes.level;
			return allowedHeadings.includes(level);
		})
		.map((block) => ({
			...block,
			level: block.attributes.level,
			isEmpty: isEmptyHeading(block),
		}));
};

const isEmptyHeading = (heading) =>
	!heading.attributes.content || heading.attributes.content.trim().length === 0;

/**
 * Builds a hierarchical nested list structure from flat headings array.
 */
const buildNestedList = (headings, ListTag) => {
	if (headings.length === 0) return null;

	const items = [];
	let currentLevel = 0;
	const stack = [{ children: items, level: 0 }];

	headings.forEach((item) => {
		const level = item.level;
		const text = item.isEmpty
			? __("(Empty heading)", "blocklayouts")
			: getTextContent(
					create({
						html: item.attributes.content,
					}),
			  );

		const listItem = {
			key: item.clientId,
			text,
			isEmpty: item.isEmpty,
			clientId: item.clientId,
			level,
			children: [],
		};

		// Find the correct parent in the stack
		while (stack.length > 1 && stack[stack.length - 1].level >= level) {
			stack.pop();
		}

		// Add to parent's children
		const parent = stack[stack.length - 1];
		parent.children.push(listItem);

		// Push this item onto the stack as a potential parent
		stack.push({ children: listItem.children, level });
	});

	// Recursive function to render nested items
	const renderItems = (items) => {
		return items.map((item) => (
			<li
				key={item.key}
				className={clsx("wp-block-blocklayouts-table-of-contents__item", {
					"is-empty": item.isEmpty,
				})}
			>
				<a
					href={`#block-${item.clientId}`}
					className="wp-block-blocklayouts-table-of-contents__link"
				>
					{item.text}
				</a>
				{item.children.length > 0 && (
					<ListTag className="wp-block-blocklayouts-table-of-contents__list">
						{renderItems(item.children)}
					</ListTag>
				)}
			</li>
		));
	};

	return renderItems(items);
};

/**
 * Edit component for the Table of Contents block.
 */
export default function Edit({
	attributes,
	setAttributes,
	className,
	clientId,
}) {
	const { ordered, headingTitle, showTitle, allowedHeadings, smoothScroll } =
		attributes;

	const blocks = useSelect(
		(select) => {
			const { getClientIdsWithDescendants, getBlock } =
				select(blockEditorStore);
			const clientIds = getClientIdsWithDescendants();
			// Filter out the current TOC block to avoid including itself
			return clientIds
				.filter((id) => id !== clientId)
				.map((id) => getBlock(id));
		},
		[clientId],
	);

	const headings = useMemo(
		() => computeOutlineHeadings(blocks, allowedHeadings),
		[blocks, allowedHeadings],
	);

	const blockProps = useBlockProps({
		className: clsx(className, "wp-block-blocklayouts-table-of-contents"),
	});

	const ListTag = ordered ? "ol" : "ul";

	return (
		<>
			<BlockControls group="block">
				<ToolbarButton
					icon={isRTL() ? formatListBulletsRTL : formatListBullets}
					title={__("Unordered")}
					description={__("Convert to unordered list")}
					isActive={ordered === false}
					onClick={() => {
						setAttributes({ ordered: false });
					}}
				/>
				<ToolbarButton
					icon={isRTL() ? formatListNumberedRTL : formatListNumbered}
					title={__("Ordered")}
					description={__("Convert to ordered list")}
					isActive={ordered === true}
					onClick={() => {
						setAttributes({ ordered: true });
					}}
				/>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={__("Settings", "blocklayouts")}>
					<div style={{ marginBottom: "16px" }}>
						<p
							style={{
								fontSize: "11px",
								fontWeight: 500,
								lineHeight: 1.4,
								textTransform: "uppercase",
							}}
						>
							{__("Heading Levels", "blocklayouts")}
						</p>
						<Dropdown
							popoverProps={{ placement: "left-start" }}
							style={{ width: "100%" }}
							renderToggle={({ isOpen, onToggle }) => (
								<Button
									onClick={onToggle}
									aria-expanded={isOpen}
									// variant="secondary"
									style={{
										fontSize: "13px",
										width: "100%",
										justifyContent: "space-between",
										border: "1px solid #949494",
										paddingLeft: "12px",
									}}
									icon={chevronDown}
									iconPosition="right"
									iconSize={20}
									__next40pxDefaultSize
								>
									<span>
										{allowedHeadings.length === 6
											? __("All (H1-H6)", "blocklayouts")
											: allowedHeadings
													.sort((a, b) => a - b)
													.map((l) => `H${l}`)
													.join(", ")}
									</span>
								</Button>
							)}
							renderContent={() => (
								<MenuGroup label={__("Select Heading Levels", "blocklayouts")}>
									{[1, 2, 3, 4, 5, 6].map((level) => {
										const isChecked = allowedHeadings.includes(level);
										return (
											<MenuItem
												key={level}
												onClick={() => {
													const newAllowedHeadings = isChecked
														? allowedHeadings.filter((l) => l !== level)
														: [...allowedHeadings, level].sort((a, b) => a - b);
													setAttributes({
														allowedHeadings: newAllowedHeadings,
													});
												}}
												suffix={isChecked ? <Icon icon={check} /> : null}
											>
												{`H${level}`}
											</MenuItem>
										);
									})}
								</MenuGroup>
							)}
						/>
						<p
							style={{
								marginTop: "8px",
								marginBottom: "0px",
								fontSize: "12px",
								fontStyle: "normal",
								color: "rgb(117, 117, 117)",
							}}
						>
							{__(
								"Select which heading levels (H1-H6) should be included in the table of contents.",
								"blocklayouts",
							)}
						</p>
					</div>

					<ToggleControl
						label={__("Show Title", "blocklayouts")}
						checked={showTitle}
						onChange={(showTitle) => setAttributes({ showTitle })}
						__nextHasNoMarginBottom
					/>

					<ToggleControl
						label={__("Smooth Scroll", "blocklayouts")}
						checked={smoothScroll}
						onChange={(smoothScroll) => setAttributes({ smoothScroll })}
						help={__(
							"Enable smooth scrolling when clicking links",
							"blocklayouts",
						)}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<nav className="wp-block-blocklayouts-table-of-contents__wrapper">
					{showTitle && (
						<RichText
							tagName="h2"
							value={headingTitle}
							onChange={(headingTitle) => setAttributes({ headingTitle })}
							placeholder={__("Table of Contents", "blocklayouts")}
							className="wp-block-blocklayouts-table-of-contents__title wp-block-heading"
							allowedFormats={["core/bold", "core/italic"]}
						/>
					)}

					{headings.length > 0 ? (
						<ListTag className="wp-block-blocklayouts-table-of-contents__list">
							{buildNestedList(headings, ListTag)}
						</ListTag>
					) : (
						<p className="wp-block-blocklayouts-table-of-contents__empty">
							{__(
								"No headings found. Add heading blocks to your content to populate the table of contents.",
								"blocklayouts",
							)}
						</p>
					)}
				</nav>
			</div>
		</>
	);
}
