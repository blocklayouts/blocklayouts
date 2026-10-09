import { useEffect } from "@wordpress/element";
import { useBlocklayouts } from "./index";

/**
 * Hook for patterns-related functionality
 */
export const usePatterns = () => {
	const {
		patterns,
		patternsLoading,
		patternsCategories,
		fetchPatterns,
		fetchCategories,
	} = useBlocklayouts();

	useEffect(() => {
		fetchPatterns();
		fetchCategories("component");
	}, []);

	return {
		patterns,
		loading: patternsLoading,
		categories: patternsCategories,
		fetchPatterns,
		fetchCategories: (params) => fetchCategories("component", params),
	};
};

/**
 * Hook for page templates-related functionality
 */
export const usePageTemplates = () => {
	const {
		pageTemplates,
		templatesLoading,
		templatesCategories,
		fetchPageTemplates,
		fetchCategories,
	} = useBlocklayouts();

	useEffect(() => {
		fetchPageTemplates();
		fetchCategories("page-template");
	}, []);

	return {
		templates: pageTemplates,
		loading: templatesLoading,
		categories: templatesCategories,
		fetchPageTemplates,
		fetchCategories: (params) => fetchCategories("page-template", params),
	};
};

/**
 * Hook for blocks-related functionality
 */
export const useBlocks = () => {
	const { blocks, blocksLoading, updateBlocks, toggleBlock, fetchBlocks } =
		useBlocklayouts();

	useEffect(() => {
		if (!blocks.length && !blocksLoading) {
			fetchBlocks();
		}
	}, []);

	return {
		blocks,
		loading: blocksLoading,
		update: updateBlocks,
		toggle: toggleBlock,
		refresh: fetchBlocks,
	};
};

/**
 * Hook for notice handling
 */
export const useNotice = () => {
	const { notice, setNotice, clearNotice } = useBlocklayouts();

	return {
		notice,
		setNotice,
		clearNotice,
		hasNotice: !!notice,
	};
};
