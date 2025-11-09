/**
 * WordPress dependencies
 */
import { useState, useEffect, useCallback } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { parse } from "@wordpress/blocks";

/**
 * Custom hook to fetch patterns data from WordPress REST API
 */
export const usePatternsData = () => {
	const [patterns, setPatterns] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchPatterns = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			// Make API request using WordPress apiFetch
			const data = await apiFetch({
				path: "/blocklayouts/v1/patterns",
			});

			if (data.success) {
				// Parse blocks for each pattern immediately after fetching
				const patternsWithBlocks = (data.patterns || []).map((pattern) => {
					try {
						// Parse blocks if content exists
						const parsedBlocks = pattern.content
							? parse(pattern.content, {
									__unstableSkipMigrationLogs: true,
							  })
							: [];

						return {
							...pattern,
							parsedBlocks,
						};
					} catch (parseError) {
						console.error(
							`Error parsing blocks for pattern ${pattern.id}:`,
							parseError,
						);
						return {
							...pattern,
							parsedBlocks: [],
						};
					}
				});

				setPatterns(patternsWithBlocks);
			} else {
				console.log("data", data);
				setError(
					data.message ||
						"Couldn't load patterns. Please try again in a moment.",
				);
				setPatterns([]);
			}
		} catch (err) {
			console.error("Error fetching patterns:", err);
			setError(err.message || "Failed to fetch patterns");
			setPatterns([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPatterns();
	}, [fetchPatterns]);

	return {
		patterns,
		loading,
		error,
		refetch: fetchPatterns,
	};
};

/**
 * Custom hook to fetch pages data from WordPress REST API
 */
export const usePageTemplatesData = () => {
	const [pageTemplates, setPageTemplates] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchPages = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			// Make API request using WordPress apiFetch
			const data = await apiFetch({
				path: "/blocklayouts/v1/page-templates",
			});

			if (data.success) {
				// Parse blocks for each pattern immediately after fetching
				const templatesWithBlocks = (data.pages || []).map((page) => {
					try {
						// Parse blocks if content exists
						const parsedBlocks = page.content
							? parse(page.content, {
									__unstableSkipMigrationLogs: true,
							  })
							: [];

						return {
							...page,
							parsedBlocks,
						};
					} catch (parseError) {
						console.error(
							`Error parsing blocks for page ${page.id}:`,
							parseError,
						);
						return {
							...page,
							parsedBlocks: [],
						};
					}
				});

				setPageTemplates(templatesWithBlocks);
			} else {
				setError("Couldn't load page templates. Please try again in a moment.");
				setPageTemplates([]);
			}
		} catch (err) {
			console.error("Error fetching patterns:", err);
			setError(err.message || "Failed to fetch patterns");
			setPageTemplates([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPages();
	}, [fetchPages]);

	return {
		pageTemplates,
		loading,
		error,
		refetch: fetchPages,
	};
};
/**
 * Custom hook to fetch categories from WordPress REST API
 */
export const useCategoriesData = ({ post_type = "" } = {}) => {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchCategories = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			// Build query parameters
			const params = {};
			if (post_type) params.post_type = post_type;

			const queryString =
				Object.keys(params).length > 0
					? "?" + new URLSearchParams(params).toString()
					: "";

			const data = await apiFetch({
				path: `/blocklayouts/v1/categories${queryString}`,
			});

			if (data.success) {
				setCategories(data.categories || []);
			} else {
				setError("Couldn't load categories. Please try again in a moment.");
				setCategories([]);
			}
		} catch (err) {
			console.error("Error fetching categories:", err);
			setError(err.message || "Failed to fetch categories");
			setCategories([]);
		} finally {
			setLoading(false);
		}
	}, [post_type]);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	return {
		categories,
		loading,
		error,
		refetch: fetchCategories,
	};
};

/**
 * Custom hook to fetch industries from WordPress REST API
 */
export const useIndustriesData = ({ post_type = "" } = {}) => {
	const [industries, setIndustries] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchIndustries = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			// Build query parameters
			const params = {};
			if (post_type) params.post_type = post_type;

			const queryString =
				Object.keys(params).length > 0
					? "?" + new URLSearchParams(params).toString()
					: "";

			const data = await apiFetch({
				path: `/blocklayouts/v1/industries${queryString}`,
			});

			if (data.success) {
				setIndustries(data.industries || []);
			} else {
				setError("Couldn't load industries. Please try again in a moment.");
				setIndustries([]);
			}
		} catch (err) {
			console.error("Error fetching industries:", err);
			setError(err.message || "Failed to fetch industries");
			setIndustries([]);
		} finally {
			setLoading(false);
		}
	}, [post_type]);

	useEffect(() => {
		fetchIndustries();
	}, [fetchIndustries]);

	return {
		industries,
		loading,
		error,
		refetch: fetchIndustries,
	};
};
