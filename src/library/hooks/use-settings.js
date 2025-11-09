/**
 * WordPress dependencies
 */
import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "@wordpress/element";

// Default preferences
const DEFAULT_PREFERENCES = {
	display: {
		livePreview: false, // TODO: Change to true.
		orderBy: "newest",
		itemsPerPage: 12,
	},
	blocks: {
		icon: true,
		marquee: true,
	},
	extensions: {
		"button-icon": true,
		"linked-group": true,
		"css-position": true,
		"css-z-index": true,
		"css-transform": true,
		"css-background-blur": true,
		"css-opacity": true,
		"css-overflow": true,
		"custom-css": true,
		animations: true,
		"hover-effects": true,
	},
};

// Create settings context
const SettingsContext = createContext();

// Settings Provider Component
export const SettingsProvider = ({ children }) => {
	// License state
	const [license, setLicense] = useState(() => {
		return window.blocklayouts_config?.license || {};
	});

	// Notice state
	const [notice, setNotice] = useState(null);

	// Update license data and sync with global config
	const updateLicense = useCallback((newLicense) => {
		// Ensure the global config object exists
		if (!window.blocklayouts_config) {
			window.blocklayouts_config = {};
		}

		// Update the licensing part of the config
		window.blocklayouts_config.license = {
			...window.blocklayouts_config.license,
			...newLicense,
		};

		// Update local state
		setLicense(window.blocklayouts_config.license);

		// Dispatch custom event to notify other components
		window.dispatchEvent(
			new CustomEvent("blocklayoutsConfigUpdated", {
				detail: {
					type: "license",
					newConfig: window.blocklayouts_config,
					license: window.blocklayouts_config.license,
				},
			}),
		);
	}, []);

	// Clear license data
	const clearLicense = useCallback(() => {
		const defaultLicense = {
			is_active: false,
			license_key: {
				key: "",
				status: "inactive",
			},
		};
		updateLicense(defaultLicense);
	}, [updateLicense]);

	// Notice management functions
	const showNotice = useCallback((options) => {
		const {
			type = "info", // "info", "error", "success", "warning"
			message = "",
			variant = "inline", // "inline" or "modal"
			isDismissible = true,
			autoDismissible = false,
			timeout = 5000, // Auto-dismiss timeout in milliseconds
		} = options;

		const noticeData = {
			type,
			message,
			variant,
			isDismissible,
			autoDismissible,
			timeout: autoDismissible ? timeout : null,
			id: Date.now(), // Simple ID for tracking
		};

		setNotice(noticeData);
	}, []);

	const dismissNotice = useCallback(() => {
		setNotice(null);
	}, []);

	// Clear notice when variant changes (helpful for switching between inline/modal)
	const clearNoticeByVariant = useCallback((variant) => {
		setNotice((currentNotice) => {
			if (currentNotice?.variant === variant) {
				return null;
			}
			return currentNotice;
		});
	}, []);

	// Listen for external config updates
	useEffect(() => {
		const handleConfigUpdate = (event) => {
			if (event.detail.type === "license") {
				setLicense(event.detail.license);
			}
		};

		window.addEventListener("blocklayoutsConfigUpdated", handleConfigUpdate);

		return () => {
			window.removeEventListener(
				"blocklayoutsConfigUpdated",
				handleConfigUpdate,
			);
		};
	}, []);

	// Computed license values
	const isActive =
		license?.is_active || license?.license_key?.status === "active" || false;

	const isPremiumUser = isActive || false;

	const value = {
		// License
		license,
		updateLicense,
		clearLicense,
		isPremiumUser,
		isActive,

		// Notice management
		notice,
		showNotice,
		dismissNotice,
		clearNoticeByVariant,
	};

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
};

// Custom hook to use settings context
export const useSettings = () => {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
};
