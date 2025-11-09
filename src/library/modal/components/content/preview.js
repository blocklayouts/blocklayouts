// components/PatternPreview.js
import { useCallback, useMemo } from "@wordpress/element";
import { Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { BlockPreview } from "@wordpress/block-editor";
import { lock } from "@wordpress/icons";
import { useSelect } from "@wordpress/data";

// Memoized premium button
const PremiumButton = ({ onClick }) => (
	<Button
		variant="primary"
		className="blocklayouts-modal__pattern-license"
		icon={lock}
		iconSize={18}
		onClick={onClick}
	>
		{__("Pro", "blocklayouts")}
	</Button>
);

export const PatternPreview = ({
	thumbnailUrl,
	showPremiumButton,
	blocks,
	onClick,
}) => {
	const livePreview = useSelect((select) => {
		const { get } = select("core/preferences");
		return get("blocklayouts/preferences", "livePreview") ?? true;
	}, []);

	// Memoize the premium button click handler
	const handlePremiumClick = useCallback(() => {
		window.open("https://blocklayouts.com/premium/", "_blank");
	}, []);

	if (!livePreview) {
		return (
			<div className="blocklayouts-modal__pattern-preview" onClick={onClick}>
				{showPremiumButton && <PremiumButton onClick={handlePremiumClick} />}
				<img src={thumbnailUrl} alt={__("Preview", "blocklayouts")} />
			</div>
		);
	}

	// Memoize additional styles to prevent recreation on every render
	const additionalStyles = useMemo(
		() => [
			{
				css: `
				* { 
					pointer-events: none !important; 
					user-select: none !important;
				}

				body{
					padding-top: 50px;
					padding-bottom: 50px;
				}
			`,
			},
		],
		[],
	);

	if (!blocks) {
		return (
			<div className="blocklayouts-modal__pattern-preview" onClick={onClick}>
				{showPremiumButton && <PremiumButton onClick={handlePremiumClick} />}
				<div
					style={{
						width: "100%",
						height: "150px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						borderRadius: "4px",
						border: "1px solid #ddd",
						backgroundColor: "#f9f9f9",
						color: "#666",
					}}
				>
					<span>{__("Preview not available", "blocklayouts")}</span>
				</div>
			</div>
		);
	}

	return (
		<div className="blocklayouts-modal__pattern-preview" onClick={onClick}>
			{showPremiumButton && <PremiumButton onClick={handlePremiumClick} />}
			<BlockPreview
				blocks={blocks}
				viewportWidth={1300}
				additionalStyles={additionalStyles}
			/>
		</div>
	);
};
