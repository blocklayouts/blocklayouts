/**
 * WordPress dependencies
 */
import { useEffect } from "@wordpress/element";
import { Notice } from "@wordpress/components";

/**
 * Internal dependencies
 */
import { useSettings } from "./use-settings";

export const Notices = ({
	variant = "inline", // "inline" or "modal"
	className = "",
	...props
}) => {
	const { notice, dismissNotice } = useSettings();

	// Auto-dismiss functionality
	useEffect(() => {
		if (notice?.autoDismissible && notice?.timeout) {
			const timer = setTimeout(() => {
				dismissNotice();
			}, notice.timeout);

			return () => clearTimeout(timer);
		}
	}, [notice, dismissNotice]);

	// Don't render if no notice or if notice variant doesn't match
	if (!notice || notice.variant !== variant) {
		return null;
	}

	const handleDismiss = () => {
		if (notice.isDismissible) {
			dismissNotice();
		}
	};

	return (
		<div
			className={`blocklayouts-notice blocklayouts-notice__${variant} ${className}`}
		>
			<Notice
				status={notice.type}
				isDismissible={notice.isDismissible}
				onDismiss={handleDismiss}
				{...props}
			>
				{notice.message}
			</Notice>
		</div>
	);
};
