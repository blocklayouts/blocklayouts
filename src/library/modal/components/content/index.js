/**
 * External dependencies
 */
import {
	useState,
	useEffect,
	useMemo,
	useCallback,
	useRef,
} from "@wordpress/element";
import { Notice, Spinner } from "@wordpress/components";
import { isUnmodifiedDefaultBlock } from "@wordpress/blocks";
import { __, sprintf } from "@wordpress/i18n";
import { store as noticesStore } from "@wordpress/notices";
import { useSelect } from "@wordpress/data";
import { DataViews, filterSortAndPaginate } from "@wordpress/dataviews/wp";
import { store as blockEditorStore } from "@wordpress/block-editor";
import { useDispatch } from "@wordpress/data";
import { parse } from "@wordpress/blocks";

/**
 * Internal dependencies
 */
import "./dataview.scss";
import { createFields } from "./fields";

const DEFAULT_LAYOUTS = {
	grid: {
		layout: {
			primaryField: "id",
			mediaField: "preview",
		},
	},
};

export const Content = ({
	components,
	loading,
	error,
	isPremiumUser,
	onClose,
	selectedCategory,
	setUpgradeOpen,
}) => {
	const { itemsPerPage, orderBy } = useSelect((select) => {
		const { get } = select("core/preferences");
		return {
			itemsPerPage: get("blocklayouts/preferences", "itemsPerPage") ?? 12,
			orderBy: get("blocklayouts/preferences", "orderBy") ?? "newest",
		};
	}, []);

	const getSortField = (orderBy) => {
		switch (orderBy) {
			case "newest":
				return {
					field: "date",
					direction: "desc",
				};
			case "oldest":
				return {
					field: "date",
					direction: "asc",
				};

			case "name":
				return {
					field: "title",
					direction: "asc",
				};
			default:
				return {
					field: "is_premium",
					direction: "asc",
				};
		}
	};

	const DEFAULT_VIEW = {
		type: "grid",
		perPage: itemsPerPage,
		page: 1,
		layout: {
			primaryField: "id",
			mediaField: "preview",
		},
		mediaField: "preview",
		titleField: "title",
		sort: getSortField(orderBy),
		showMedia: true,
		showTitle: true,
	};
	const [view, setView] = useState(DEFAULT_VIEW);

	const { insertBlocks, replaceBlocks } = useDispatch(blockEditorStore);
	const { createNotice } = useDispatch(noticesStore);

	// Infinite scroll: how many "pages" of items are shown. The installed
	// DataViews version has no infinite scroll, so it's done here: a marker
	// under the grid loads the next page when it scrolls into view.
	const [pagesShown, setPagesShown] = useState(1);
	const sentinelRef = useRef(null);

	useEffect(() => {
		if (selectedCategory) {
			setView((prevView) => ({
				...prevView,
				page: 1, // Reset to first page
				filters: [
					{
						field: "category",
						operator: "isAny",
						value: [selectedCategory],
					},
				],
			}));
		} else {
			setView((prevView) => {
				const { filters, ...rest } = prevView;
				return {
					...rest,
					page: 1, // Reset to first page when clearing filters
				};
			});
		}
	}, [selectedCategory]);

	// Pattern insertion handler
	const insertPattern = useCallback(
		(pattern) => {
			if (!isPremiumUser && pattern.is_premium) {
				setUpgradeOpen();
			} else {
				try {
					// Use pre-parsed blocks directly
					const blocks = parse(pattern.content, {
						__unstableSkipMigrationLogs: true,
					});
					if (selectedBlock && isDefaultBlock) {
						replaceBlocks(selectedBlock.clientId, blocks);
					} else if (selectedBlock) {
						insertBlocks(blocks, insertIndex, rootClientId);
					} else {
						insertBlocks(blocks);
					}

					// Show a success notice
					createNotice(
						"success",
						sprintf(
							/* translators: %s: Pattern title. */
							__('"%s" pattern added.', "blocklayouts"),
							pattern.title,
						),
						{
							isDismissible: true,
							type: "snackbar",
						},
					);
					onClose();
				} catch (error) {
					console.error("Error inserting pattern:", error);
				}
			}
		},
		[isPremiumUser, insertBlocks, onClose],
	);

	// Memoized fields definition
	const fields = useMemo(
		() => createFields(isPremiumUser, insertPattern),
		[isPremiumUser, insertPattern],
	);

	// Start again from the first page when the list or the view changes.
	useEffect(() => {
		setPagesShown(1);
	}, [components, view.search, view.filters, view.sort, view.perPage]);

	// Filter and sort everything, and show the first `pagesShown` pages.
	const perPage = view.perPage || 12;
	const { data: shownData, paginationInfo: filteredInfo } = useMemo(() => {
		return filterSortAndPaginate(
			components || [],
			{ ...view, page: 1, perPage: perPage * pagesShown },
			fields,
		);
	}, [components, view, fields, perPage, pagesShown]);

	const totalItems = filteredInfo?.totalItems ?? 0;
	const hasMoreData = shownData.length < totalItems;

	// Load the next page when the marker under the grid comes into view.
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel || !hasMoreData) {
			return;
		}
		const observer = new window.IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setPagesShown((n) => n + 1);
				}
			},
			{
				root: sentinel.closest(".blocklayouts-modal__scrollable"),
				rootMargin: "0px 0px 600px 0px",
			},
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [hasMoreData, shownData.length]);

	const getItemId = (item) => {
		return item.id.toString();
	};

	const { selectedBlock, isDefaultBlock, rootClientId, insertIndex } =
		useSelect((select) => {
			const selectedBlockClientId =
				select(blockEditorStore).getSelectedBlockClientId();

			if (!selectedBlockClientId) {
				return {
					selectedBlock: null,
					isDefaultBlock: false,
				};
			}

			const rootClientId = select(blockEditorStore).getBlockRootClientId(
				selectedBlockClientId,
			);
			const insertIndex =
				select(blockEditorStore).getBlockIndex(selectedBlockClientId) + 1;

			const block = select(blockEditorStore).getBlock(selectedBlockClientId);

			return {
				selectedBlock: block,
				isDefaultBlock: block ? isUnmodifiedDefaultBlock(block) : false,
				rootClientId,
				insertIndex,
			};
		}, []);

	// Memoized actions
	const actions = useMemo(
		() => [
			{
				id: "insert-pattern",
				label: __("Insert Pattern", "blocklayouts"),
				isPrimary: true,
				callback: ([item]) => {
					insertPattern(item);
				},
			},

			{
				id: "view-preview",
				label: __("Live Preview", "blocklayouts"),
				callback: ([item]) => {
					if (item.preview_url) {
						window.open(item.preview_url, "_blank");
					} else if (item.permalink) {
						window.open(item.permalink, "_blank");
					}
				},
			},
		],
		[insertPattern],
	);

	// A single "page", so DataViews doesn't show its own pager.
	const paginationInfo = {
		totalItems,
		totalPages: 1,
	};

	return (
		<>
			{error && (
				<Notice
					status="error"
					isDismissible={false}
					style={{ marginBottom: "20px" }}
				>
					{error}
				</Notice>
			)}

			{loading ? (
				<div className="blocklayouts-modal__spinner">
					<Spinner
						style={{
							width: "30px",
							height: "30px",
						}}
					/>
				</div>
			) : (
				<>
					<DataViews
						getItemId={getItemId}
						paginationInfo={paginationInfo}
						data={shownData}
						fields={fields}
						view={view}
						onChangeView={(newView) => setView({ ...newView, page: 1 })}
						actions={actions}
						defaultLayouts={DEFAULT_LAYOUTS}
					/>
					{hasMoreData && (
						<div
							ref={sentinelRef}
							className="blocklayouts-modal__load-more"
							aria-hidden="true"
						>
							<Spinner />
						</div>
					)}
				</>
			)}
		</>
	);
};
