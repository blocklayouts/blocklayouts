import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { parse } from "@wordpress/blocks";
/**
 * Blocklayouts Context
 * Provides global state for patterns, templates, license, and blocks
 */
const BlocklayoutsContext = createContext();

/**
 * Custom hook to use the Blocklayouts context
 */
export const useBlocklayouts = () => {
	const context = useContext(BlocklayoutsContext);
	if (!context) {
		throw new Error("useBlocklayouts must be used within a SettingsProvider");
	}
	return context;
};

// Export specialized hooks
export { usePatterns, usePageTemplates, useBlocks } from "./hooks";

/**
 * Settings Provider Component
 */
export const SettingsProvider = ({ children }) => {
	// Patterns & Templates State
	const [patterns, setPatterns] = useState([]);
	const [pageTemplates, setPageTemplates] = useState([]);
	const [patternsCategories, setPatternsCategories] = useState([]);
	const [templatesCategories, setTemplatesCategories] = useState([]);
	const [patternsLoading, setPatternsLoading] = useState(false);
	const [templatesLoading, setTemplatesLoading] = useState(false);

	// License State
	const [license, setLicense] = useState(null);
	const [licenseKey, setLicenseKey] = useState("");
	const [isActiveLicense, setIsActiveLicense] = useState(false);
	const [isValidLicense, setIsValidLicense] = useState(false);
	const [isPremium, setIsPremium] = useState(false);
	const [licenseLoading, setLicenseLoading] = useState(false);

	// Blocks State
	const [blocks, setBlocks] = useState([]);
	const [blocksLoading, setBlocksLoading] = useState(false);

	// Notice State
	const [notice, setNotice] = useState(null);

	/**
	 * Fetch patterns from API
	 */
	const fetchPatterns = useCallback(async (params = {}) => {
		setPatternsLoading(true);
		setNotice(null);

		try {
			const queryString = new URLSearchParams(params).toString();
			const path = queryString
				? `/blocklayouts/v1/patterns?${queryString}`
				: "/blocklayouts/v1/patterns";

			const response = await apiFetch({
				path,
				method: "GET",
			});

			if (response.success) {
				// Parse blocks for each pattern immediately after fetching
				const parsedPatterns = (response.patterns || []).map((pattern) => {
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

				setPatterns(parsedPatterns);
			}
		} catch (err) {
			setNotice({
				type: "error",
				variant: "main",
				message: err.message || "Failed to fetch patterns",
			});
			console.error("Error fetching patterns:", err);
		} finally {
			setPatternsLoading(false);
		}
	}, []);

	/**
	 * Fetch page templates from API
	 */
	const fetchPageTemplates = useCallback(async (params = {}) => {
		setTemplatesLoading(true);
		setNotice(null);

		try {
			const queryString = new URLSearchParams(params).toString();
			const path = queryString
				? `/blocklayouts/v1/page-templates?${queryString}`
				: "/blocklayouts/v1/page-templates";

			const response = await apiFetch({
				path,
				method: "GET",
			});

			if (response.success) {
				// Parse blocks for each page immediately after fetching
				const parsedPages = (response.pages || []).map((page) => {
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
				setPageTemplates(parsedPages);
			}
		} catch (err) {
			setNotice({
				type: "error",
				variant: "main",
				message: err.message || "Failed to fetch page templates",
			});
			console.error("Error fetching page templates:", err);
		} finally {
			setTemplatesLoading(false);
		}
	}, []);

	/**
	 * Fetch categories from API
	 */
	const fetchCategories = useCallback(async (postType = "") => {
		setNotice(null);

		try {
			const response = await apiFetch({
				path: `/blocklayouts/v1/categories?post_type=${postType}`,
				method: "GET",
			});

			if (response.success) {
				if (postType === "component") {
					setPatternsCategories(response.categories || []);
				} else if (postType === "page-template") {
					setTemplatesCategories(response.categories || []);
				}
			}
		} catch (err) {
			setNotice({
				type: "error",
				variant: "main",
				message:
					err.message ||
					"Couldn't load categories. Please try again in a moment.",
			});
			console.error("Error fetching categories:", err);
		}
	}, []);

	/**
	 * Fetch license data from API
	 */
	const fetchLicense = useCallback(async () => {
		setLicenseLoading(true);
		setNotice(null);

		try {
			const response = await apiFetch({
				path: "/blocklayouts/v1/license",
				method: "GET",
			});

			if (response.success && response.data) {
				const licenseData = response.data;
				setLicense(licenseData);
				setLicenseKey(licenseData.key || "");
				setIsActiveLicense(licenseData.is_active || false);
				setIsValidLicense(!licenseData.is_expired && licenseData.is_active);
				setIsPremium(licenseData.is_active || false);
			}
		} catch (err) {
			setNotice({
				type: "error",
				variant: "main",
				message: err.message || "Failed to fetch license",
			});
			console.error("Error fetching license:", err);
		} finally {
			setLicenseLoading(false);
		}
	}, []);

	/**
	 * Activate license
	 */
	const activateLicense = useCallback(async (key) => {
		setLicenseLoading(true);
		setNotice(null);

		try {
			const response = await apiFetch({
				path: "/blocklayouts/v1/license/activate",
				method: "POST",
				data: {
					license_key: key,
					nonce: window.blocklayouts_config?.api?.nonce || "",
				},
			});

			if (response.success && response.data) {
				const licenseData = response.data;
				setLicense(licenseData);
				setLicenseKey(licenseData.key || "");
				setIsActiveLicense(licenseData.is_active || false);
				setIsValidLicense(!licenseData.is_expired && licenseData.is_active);
				setIsPremium(licenseData.is_active || false);
				setNotice({
					type: "success",
					variant: "main",
					message: "You're all set! Your license is now active!",
				});
				return { success: true, data: licenseData };
			} else if (response.error) {
				setNotice({
					type: "error",
					variant: "main",
					message: response.error,
				});
				return { success: false, error: response.error };
			}
		} catch (err) {
			const errorMessage = err.message || "Failed to activate license";
			setNotice({
				type: "error",
				variant: "main",
				message: errorMessage,
			});
			console.error("Error activating license:", err);
			return { success: false, error: errorMessage };
		} finally {
			setLicenseLoading(false);
		}
	}, []);

	/**
	 * Deactivate license
	 */
	const deactivateLicense = useCallback(async () => {
		if (!license || !license.key || !license.instance?.id) {
			setNotice({
				type: "error",
				variant: "main",
				message: "Missing license information",
			});

			return { success: false, error: "Missing license information" };
		}

		setLicenseLoading(true);
		setNotice(null);

		try {
			const response = await apiFetch({
				path: "/blocklayouts/v1/license/deactivate",
				method: "POST",
				data: {
					license_key: license.key,
					instance_id: license.instance.id,
					nonce: window.blocklayouts_config?.api?.nonce || "",
				},
			});

			if (response.success) {
				setLicense(null);
				setLicenseKey("");
				setIsActiveLicense(false);
				setIsValidLicense(false);
				setIsPremium(false);
				return { success: true };
			} else if (response.error) {
				setNotice({
					type: "error",
					variant: "main",
					message: response.error,
				});
				return { success: false, error: response.error };
			}
		} catch (err) {
			const errorMessage = err.message || "Failed to deactivate license";
			setNotice({
				type: "error",
				variant: "main",
				message: errorMessage,
			});
			console.error("Error deactivating license:", err);
			return { success: false, error: errorMessage };
		} finally {
			setLicenseLoading(false);
		}
	}, [license]);

	/**
	 * Fetch blocks preferences from API
	 */
	const fetchBlocks = useCallback(async () => {
		setBlocksLoading(true);
		setNotice(null);

		try {
			const response = await apiFetch({
				path: "/blocklayouts/v1/blocks",
				method: "GET",
			});

			if (response.success && response.data) {
				setBlocks(response.data);
			}
		} catch (err) {
			setNotice({
				type: "error",
				variant: "main",
				message: err.message || "Failed to fetch blocks",
			});
			console.error("Error fetching blocks:", err);
		} finally {
			setBlocksLoading(false);
		}
	}, []);

	/**
	 * Update blocks preferences
	 */
	const updateBlocks = useCallback(
		async (updatedBlocks) => {
			setBlocksLoading(true);
			setNotice(null);

			try {
				const blocksData = {};
				updatedBlocks.forEach((block) => {
					blocksData[block.name] = {
						active: block.active,
					};
				});

				const response = await apiFetch({
					path: "/blocklayouts/v1/blocks",
					method: "POST",
					data: {
						blocks: blocksData,
						nonce: window.blocklayouts_config?.api?.nonce || "",
					},
				});

				if (response.success && response.data) {
					// Refresh blocks after update
					await fetchBlocks();
					setNotice({
						type: "success",
						variant: "main",
						message: "Blocks updated successfully",
					});
					return { success: true };
				} else if (response.error) {
					setNotice({
						type: "error",
						variant: "main",
						message: response.error,
					});
					return { success: false, error: response.error };
				}
			} catch (err) {
				const errorMessage = err.message || "Failed to update blocks";
				setNotice({
					type: "error",
					variant: "main",
					message: errorMessage,
				});
				console.error("Error updating blocks:", err);
				return { success: false, error: errorMessage };
			} finally {
				setBlocksLoading(false);
			}
		},
		[fetchBlocks],
	);

	/**
	 * Toggle a single block active state
	 */
	const toggleBlock = useCallback(
		async (blockName) => {
			const updatedBlocks = blocks.map((block) => {
				if (block.name === blockName) {
					return { ...block, active: !block.active };
				}
				return block;
			});

			return await updateBlocks(updatedBlocks);
		},
		[blocks, updateBlocks],
	);

	/**
	 * Clear notice
	 */
	const clearNotice = useCallback(() => {
		setNotice(null);
	}, []);

	const value = {
		// Patterns & Templates
		patterns,
		pageTemplates,
		patternsCategories,
		templatesCategories,
		patternsLoading,
		templatesLoading,
		fetchPatterns,
		fetchPageTemplates,
		fetchCategories,

		// License
		license,
		licenseKey,
		isActiveLicense,
		isValidLicense,
		isPremium,
		licenseLoading,
		activateLicense,
		deactivateLicense,
		fetchLicense,

		// Blocks
		blocks,
		blocksLoading,
		updateBlocks,
		toggleBlock,
		fetchBlocks,

		// Notice handling
		notice,
		setNotice,
		clearNotice,
	};

	return (
		<BlocklayoutsContext.Provider value={value}>
			{children}
		</BlocklayoutsContext.Provider>
	);
};

export default BlocklayoutsContext;
