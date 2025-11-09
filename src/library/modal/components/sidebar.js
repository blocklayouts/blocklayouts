/**
 * WordPress dependencies
 */
import {
	__experimentalScrollable as Scrollable,
	Button,
} from "@wordpress/components";
import { file } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";

export const Sidebar = ({
	categories = [],
	category,
	setCategory,
	isLoading = false,
}) => {
	return (
		<div className="blocklayouts-modal__sidebar">
			<h4
				style={{
					textTransform: "uppercase",
				}}
			>
				{__("Categories", "blocklayouts")}
			</h4>
			{isLoading ? (
				<div
					className="blocklayouts-skeleton-sidebar animate-pulse"
					style={{ width: 220 }}
				>
					<div
						style={{
							height: 20,
							background: "#e0e0e0",
							borderRadius: 6,
							marginBottom: 20,
						}}
					/>
					{[...Array(8)].map((_, i) => (
						<div
							key={i}
							style={{
								height: 20,
								background: "#e0e0e0",
								borderRadius: 6,
								marginBottom: 20,
								width: `${80 + Math.random() * 20}%`,
							}}
						/>
					))}
				</div>
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
		</div>
	);
};
