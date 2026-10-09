/**
 * WordPress dependencies
 */
import { createHigherOrderComponent } from "@wordpress/compose";
import { addFilter } from "@wordpress/hooks";
import { useEntityRecord } from "@wordpress/core-data";
/**
 * Internal dependencies
 */
import { AdditionalCSS } from "./additional-css";
import { Effects } from "./effects";
import { HoverColors } from "./hover-colors";
import { Typography } from "./typography";
import { WrapperLink } from "./wrapper-link";
import { Masonry } from "./masonry";

/**
 * Import all extensions
 */
import "./additional-css";
import "./effects";
import "./hover-colors";
import "./typography";
import "./wrapper-link";
import "./icon-button";
import "./masonry";

import { SettingsProvider } from "../context";

/**
 * Add Extensions inspector controls to the block editor
 */
addFilter(
	"editor.BlockEdit",
	"blocklayouts/extensions/add-inspector-controls",
	createHigherOrderComponent((BlockEdit) => {
		return (props) => {
			const { name, attributes, setAttributes, clientId } = props;

			return (
				<>
					<BlockEdit key="edit" {...props} />
					<SettingsProvider>
						<AdditionalCSS
							name={name}
							attributes={attributes}
							setAttributes={setAttributes}
							clientId={clientId}
						/>
						<Effects
							name={name}
							attributes={attributes}
							setAttributes={setAttributes}
							clientId={clientId}
						/>
						<HoverColors
							name={name}
							attributes={attributes}
							setAttributes={setAttributes}
							clientId={clientId}
						/>
						<Typography
							name={name}
							attributes={attributes}
							setAttributes={setAttributes}
							clientId={clientId}
						/>
						<WrapperLink
							name={name}
							attributes={attributes}
							setAttributes={setAttributes}
							clientId={clientId}
						/>
						<Masonry
							name={name}
							attributes={attributes}
							setAttributes={setAttributes}
							clientId={clientId}
						/>
					</SettingsProvider>
				</>
			);
		};
	}, "withExtensionsControls"),
);
