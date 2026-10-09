/**
 * WordPress dependencies
 */
import {
	__experimentalScrollable as Scrollable,
	Button,
} from "@wordpress/components";
import { file } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";

/*
 * Internal dependencies
 */
import { SidebarSkeleton } from "../../../utils/skeleton";

export const Sidebar = ({
	categories = [],
	category,
	setCategory,
	isLoading = false,
}) => {
	return (
		<aside className="blocklayouts-modal__sidebar">
			<h4
				style={{
					textTransform: "uppercase",
				}}
			>
				{__("Categories", "blocklayouts")}
			</h4>

			{isLoading ? (
				<SidebarSkeleton />
			) : (
				<Scrollable className="blocklayouts-modal__scrollable">
					<div className="blocklayouts-modal__sidebar-buttons">
						{categories.map((cat) => (
							<Button
								icon={file}
								iconSize={20}
								className={`blocklayouts-modal__sidebar-button ${
									category === cat.slug ? "is-selected" : ""
								}`}
								onClick={() => setCategory(cat.slug)}
							>
								{cat.name}
								<span
									style={{
										flex: "1",
										textAlign: "right",
									}}
								>
									{cat.count || "0"}
								</span>
							</Button>
						))}
					</div>
				</Scrollable>
			)}
		</aside>
	);
};
