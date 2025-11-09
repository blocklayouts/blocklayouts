/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import {
	Modal,
	__experimentalScrollable as Scrollable,
} from "@wordpress/components";
import { useSelect } from "@wordpress/data";

/*
 * Internal dependencies
 */
import { useSettings, Notices } from "../hooks";
import { Header } from "./components/header";
import { Sidebar } from "./components/sidebar";
import { Content } from "./components/content";

import {
	usePatternsData,
	useCategoriesData,
	usePageTemplatesData,
} from "../api";

export const PatternLibraryModal = ({ isOpen, onClose, openPreferences }) => {
	const [selectedCategory, setSelectedCategory] = useState("");
	const [activeTab, setActiveTab] = useState("patterns");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isOverlayOpen, setIsOverlayOpen] = useState(false);

	// Define tabs
	const tabs = [
		{ label: __("Patterns", "blocklayouts"), value: "patterns" },
		{ label: __("Pages", "blocklayouts"), value: "pages" },
		{
			label: __("Favorites", "blocklayouts"),
			value: "favorites",
			disabled: true,
		},
	];

	// Data hooks
	const {
		patterns,
		loading: patternsLoading,
		error: patternsError,
	} = usePatternsData();

	const {
		categories,
		loading: categoriesLoading,
		error: categoriesError,
	} = useCategoriesData({
		post_type: activeTab === "pages" ? "page-template" : "component",
	});

	const {
		pageTemplates,
		loading: pagesLoading,
		error: pagesError,
	} = usePageTemplatesData();

	const setUpgradeOpen = () => {
		setIsOverlayOpen(true);
		setIsDropdownOpen(true);
	};

	const onDropdownToggle = (isOpen) => {
		setIsOverlayOpen(false);
		setIsDropdownOpen(isOpen);
	};

	// Handle tab changes
	const onTabChange = (tab) => {
		setActiveTab(tab);
		setSelectedCategory("");
	};

	// Use the license hook
	const { isPremiumUser } = useSettings();

	if (!isOpen) return null;

	return (
		<Modal
			overlayClassName="blocklayouts-modal__overlay"
			className={`blocklayouts-modal is-${activeTab}`}
			title={__("Patterns Library", "blocklayouts")}
			onRequestClose={onClose}
			isFullScreen={true}
			headerActions={
				<Header
					tabs={tabs}
					activeTab={activeTab}
					onTabChange={onTabChange}
					isDropdownOpen={isDropdownOpen}
					onDropdownToggle={onDropdownToggle}
					openPreferences={openPreferences}
				/>
			}
		>
			<Notices variant="modal" />

			<div className="blocklayouts-modal__container">
				<Sidebar
					categories={categories}
					category={selectedCategory}
					setCategory={setSelectedCategory}
					isLoading={categoriesLoading}
				/>
				<div className="blocklayouts-modal__content">
					<Scrollable className="blocklayouts-modal__scrollable">
						<Content
							components={activeTab === "patterns" ? patterns : pageTemplates}
							loading={
								activeTab === "patterns" ? patternsLoading : pagesLoading
							}
							error={activeTab === "patterns" ? patternsError : pagesError}
							selectedCategory={selectedCategory}
							isPremiumUser={isPremiumUser}
							onClose={onClose}
							setUpgradeOpen={setUpgradeOpen}
						/>
						{isOverlayOpen && (
							<div className="blocklayouts-modal__screen-overlay"></div>
						)}
					</Scrollable>
				</div>
			</div>
		</Modal>
	);
};
