/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import {
	BlockControls,
	__experimentalLinkControl as LinkControl, // eslint-disable-line
} from "@wordpress/block-editor";
import {
	Button,
	ToolbarButton,
	MenuGroup,
	MenuItem,
	Popover,
} from "@wordpress/components";
import { link, linkOff, page, Icon } from "@wordpress/icons";
import { useState } from "@wordpress/element";

/**
 * Extended link controls component.
 */
const LinkControls = ({ attributes, setAttributes, clientId }) => {
	const [isEditingURL, setIsEditingURL] = useState(false);
	const [popoverAnchor, setPopoverAnchor] = useState(null);
	const { wrapperLink } = attributes;

	const { href, linkDestination, linkTarget } = wrapperLink || {};

	return (
		<>
			<BlockControls group="block">
				<ToolbarButton
					ref={setPopoverAnchor}
					name="link"
					icon={link}
					title={__("Link", "blocklayouts")}
					onClick={() => setIsEditingURL(true)}
					isActive={!!href || linkDestination === "post" || isEditingURL}
				/>
				{isEditingURL && (
					<Popover
						anchor={popoverAnchor}
						onClose={() => setIsEditingURL(false)}
						placement="bottom"
						focusOnMount={true}
						offset={12}
						className="blocklayouts__link-popover"
						variant="alternate"
					>
						{linkDestination !== "post" && (
							<LinkControl
								value={{
									url: href,
									opensInNewTab: linkTarget === "_blank",
								}}
								onChange={({ url: newURL = "", opensInNewTab }) => {
									setAttributes({
										wrapperLink: {
											href: newURL,
											linkDestination: newURL ? "custom" : undefined,
											linkTarget: opensInNewTab ? "_blank" : undefined,
										},
									});
								}}
								onRemove={() =>
									setAttributes({
										wrapperLink: {
											href: undefined,
											linkDestination: undefined,
											linkTarget: undefined,
										},
									})
								}
							/>
						)}
						{!href && !linkDestination && (
							<div className="blocklayouts__link-popover-menu">
								<MenuGroup>
									<MenuItem
										icon={page}
										iconPosition="left"
										info={__(
											"Links to post when used in Query block. Avoid nested links.",
											"blocklayouts",
										)}
										onClick={() =>
											setAttributes({
												wrapperLink: {
													linkDestination: "post",
												},
											})
										}
									>
										{__("Link to current post", "blocklayouts")}
									</MenuItem>
								</MenuGroup>
							</div>
						)}
						{linkDestination === "post" && (
							<div className="blocklayouts__link-popover-post-selected">
								<div className="blocklayouts__link-popover-post-selected-label">
									<span className="blocklayouts__link-popover-post-selected-icon">
										<Icon icon={page} />
									</span>
									{__("Linked to current post", "blocklayouts")}
								</div>
								<Button
									icon={linkOff}
									label={__("Remove link", "blocklayouts")}
									onClick={() =>
										setAttributes({
											wrapperLink: {
												linkDestination: undefined,
											},
										})
									}
								/>
							</div>
						)}
					</Popover>
				)}
			</BlockControls>
		</>
	);
};

export default LinkControls;
