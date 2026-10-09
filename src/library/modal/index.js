/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import {
	Modal,
	NoticeList,
	__experimentalScrollable as Scrollable,
} from "@wordpress/components";
import { useSelect, useDispatch } from "@wordpress/data";
import { useEntityRecord } from "@wordpress/core-data";
import { store as noticesStore } from "@wordpress/notices";
/*
 * Internal dependencies
 */
import { Header } from "./components/header";
import { Sidebar } from "./components/sidebar";
import { Content } from "./components/content";
import { PatternSkeleton } from "../../utils/skeleton";

export const PatternLibraryModal = ({ isOpen, onClose, openPreferences }) => {
	const [selectedCategory, setSelectedCategory] = useState("");
	const [activeTab, setActiveTab] = useState("patterns");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isOverlayOpen, setIsOverlayOpen] = useState(false);

	// Check if the user has a premium license.
	const licenseData = useEntityRecord("blocklayouts/v1", "license");
	const isPremium = licenseData?.record?.data?.is_active;

	// Patterns data
	const PatternsData = useEntityRecord("blocklayouts/v1", "patterns");
	const patterns = PatternsData?.record?.patterns;
	const patternsLoading = !PatternsData.hasResolved;

	// Page templates data
	const PageTemplatesData = useEntityRecord(
		"blocklayouts/v1",
		"page-templates",
	);
	const pageTemplates = PageTemplatesData?.record?.pages;
	const pagesLoading = !PageTemplatesData.hasResolved;

	// Categories data
	const patternsCategoriesData = useEntityRecord(
		"blocklayouts/v1",
		"patterns-categories",
	);
	const patternsCategories = patternsCategoriesData?.record?.categories;
	const patternsCategoriesLoading = !patternsCategoriesData.hasResolved;

	// Page templates categories data
	const pagesCategoriesData = useEntityRecord(
		"blocklayouts/v1",
		"page-templates-categories",
	);
	const pagesCategories = pagesCategoriesData?.record?.categories;
	const pagesCategoriesLoading = !pagesCategoriesData.hasResolved;

	const { notices } = useSelect((select) => {
		return {
			// Only get notices that belong to our context
			notices: select(noticesStore).getNotices("blocklayouts"),
		};
	}, []);
	const { removeNotice } = useDispatch(noticesStore);

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
			<div className="blocklayouts-modal__container">
				<Sidebar
					categories={
						activeTab === "patterns" ? patternsCategories : pagesCategories
					}
					category={selectedCategory}
					setCategory={setSelectedCategory}
					isLoading={
						activeTab === "patterns"
							? patternsCategoriesLoading
							: pagesCategoriesLoading
					}
				/>
				<div className="blocklayouts-modal__content">
					<NoticeList
						notices={notices}
						onRemove={(id) => removeNotice(id, "blocklayouts")}
					/>
					<Scrollable className="blocklayouts-modal__scrollable">
						{patternsLoading || pagesLoading ? (
							<PatternSkeleton />
						) : (
							<Content
								components={activeTab === "patterns" ? patterns : pageTemplates}
								// error={activeTab === "patterns" ? patternsError : pagesError}
								selectedCategory={selectedCategory}
								isPremiumUser={isPremium}
								onClose={onClose}
								setUpgradeOpen={setUpgradeOpen}
							/>
						)}

						{isOverlayOpen && (
							<div className="blocklayouts-modal__screen-overlay"></div>
						)}
					</Scrollable>
				</div>
			</div>
		</Modal>
	);
};
