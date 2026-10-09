/**
 * WordPress dependencies.
 */
import { __ } from "@wordpress/i18n";
import domReady from "@wordpress/dom-ready";
import { createRoot } from "@wordpress/element";
import { useState, useEffect } from "@wordpress/element";
import { dispatch } from "@wordpress/data";
/**
 * Internal dependencies.
 */
import { SettingsProvider } from "../context";

import Header from "./components/header";
import Sidebar from "./components/sidebar";
import Main from "./components/main";

import "./index.scss";

/**
 * Add our custom entities.
 *
 * @since 0.2.0
 */
dispatch("core").addEntities([
	{
		label: __("Blocklayouts License", "blocklayouts"),
		kind: "blocklayouts/v1",
		name: "license",
		baseURL: "/blocklayouts/v1/license",
	},
	{
		label: __("Blocklayouts Blocks", "blocklayouts"),
		kind: "blocklayouts/v1",
		name: "blocks",
		baseURL: "/blocklayouts/v1/blocks",
	},
]);

/**
 * Get URL parameter value
 *
 * @param {string} param - Parameter name
 * @return {string|null} Parameter value or null
 */
const getUrlParameter = (param) => {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get(param);
};

/**
 * Update URL parameter
 *
 * @param {string} param - Parameter name
 * @param {string} value - Parameter value
 */
const updateUrlParameter = (param, value) => {
	const url = new URL(window.location.href);
	url.searchParams.set(param, value);
	window.history.pushState({}, "", url);
};

const Dashboard = () => {
	// Get initial tab from URL or default to "home"
	const initialTab = getUrlParameter("path") || "home";
	const [activeTab, setActiveTab] = useState(initialTab);

	// Update URL when tab changes
	useEffect(() => {
		updateUrlParameter("path", activeTab);
	}, [activeTab]);

	// Handle browser back/forward navigation
	useEffect(() => {
		const handlePopState = () => {
			const pathFromUrl = getUrlParameter("path") || "home";
			setActiveTab(pathFromUrl);
		};

		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, []);

	return (
		<SettingsProvider>
			<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
			<div class="wrapper">
				<Header activeTab={activeTab} />
				<Main activeTab={activeTab} />
				
			</div>
		</SettingsProvider>
	);
};

domReady(() => {
	const root = createRoot(document.getElementById("blocklayouts-dashboard"));
	root.render(<Dashboard />);
});
