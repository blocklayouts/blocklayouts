/**
 * WordPress dependencies.
 */
import { NoticeList } from "@wordpress/components";
import { useDispatch } from "@wordpress/data";
import { store as noticesStore } from "@wordpress/notices";
import { useSelect } from "@wordpress/data";

/**
 * Internal dependencies.
 */

import Home from "./tabs/home";
import Extensions from "./tabs/extensions";
import Blocks from "./tabs/blocks";
import Preferences from "./tabs/preferences";

const Main = ({ activeTab }) => {
	const { notices } = useSelect((select) => {
		return {
			// Only get notices that belong to our context
			notices: select(noticesStore).getNotices("blocklayouts"),
		};
	}, []);

	const { removeNotice } = useDispatch(noticesStore);

	const renderTabContent = () => {
		switch (activeTab) {
			case "blocks":
				return <Blocks />;
			case "extensions":
				return <Extensions />;
			case "preferences":
				return <Preferences />;
			default:
				return <Home />;
		}
	};

	return (
		<main className="blocklayouts-dashboard__main">
			<NoticeList
				notices={notices}
				onRemove={(id) => removeNotice(id, "blocklayouts")}
			/>
			{renderTabContent()}
		</main>
	);
};

export default Main;
