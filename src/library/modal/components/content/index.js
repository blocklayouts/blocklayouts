/**
 * External dependencies
 */
import { useState, useEffect, useMemo, useCallback } from "@wordpress/element";
import { Notice, Spinner } from "@wordpress/components";
import { isUnmodifiedDefaultBlock } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";
import { store as noticesStore } from "@wordpress/notices";
import { useSelect } from "@wordpress/data";
import { DataViews, filterSortAndPaginate } from "@wordpress/dataviews/wp";
import { store as blockEditorStore } from "@wordpress/block-editor";
import { useDispatch } from "@wordpress/data";

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
		infiniteScrollEnabled: true,
	};
	const [view, setView] = useState(DEFAULT_VIEW);

	const { insertBlocks, replaceBlocks } = useDispatch(blockEditorStore);
	const { createNotice } = useDispatch(noticesStore);

	// Infinite scroll state management
	const [allLoadedRecords, setAllLoadedRecords] = useState([]);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

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
					const blocks = pattern.parsedBlocks || [];
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
						__(`"${pattern.title}" pattern added.`, "blocklayouts"),
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

	// Process data for DataViews
	const { data: shownData } = useMemo(() => {
		return filterSortAndPaginate(components, view, fields);
	}, [components, view, fields]);

	// Infinite scroll pagination logic
	const totalItems = components.length;
	const totalPages = Math.ceil(totalItems / (view.perPage || 12));
	const currentPage = view.page || 1;
	const hasMoreData = currentPage < totalPages;

	const getItemId = (item) => {
		return item.id.toString();
	};

	// Infinite scroll handler
	const infiniteScrollHandler = useCallback(() => {
		if (isLoadingMore || currentPage >= totalPages) {
			return;
		}
		setIsLoadingMore(true);
		setView({
			...view,
			page: currentPage + 1,
		});
	}, [isLoadingMore, currentPage, totalPages, view]);

	// Reset data when components change (tab switch)
	useEffect(() => {
		setAllLoadedRecords([]);
		setView((prevView) => ({
			...prevView,
			page: 1,
		}));
	}, [components]);

	// Initialize data on first load or when view changes significantly
	useEffect(() => {
		if (currentPage === 1 || !view.infiniteScrollEnabled) {
			// First page - replace all data
			setAllLoadedRecords(shownData);
		} else {
			// Subsequent pages - append to existing data
			setAllLoadedRecords((prev) => {
				const existingIds = new Set(prev.map(getItemId));
				const newRecords = shownData.filter(
					(record) => !existingIds.has(getItemId(record)),
				);
				return [...prev, ...newRecords];
			});
		}
		setIsLoadingMore(false);
	}, [
		view.search,
		view.filters,
		view.perPage,
		currentPage,
		view.infiniteScrollEnabled,
		shownData,
		getItemId,
	]);

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

	// Pagination info with infinite scroll handler
	const paginationInfo = {
		totalItems,
		totalPages,
		infiniteScrollHandler,
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
				<DataViews
					data={allLoadedRecords}
					fields={fields}
					view={view}
					onChangeView={setView}
					actions={actions}
					defaultLayouts={DEFAULT_LAYOUTS}
					onChangeSelection={() => {}}
					getItemId={getItemId}
					isLoading={isLoadingMore}
					paginationInfo={paginationInfo}
				/>
			)}
		</>
	);
};
