/**
 * WordPress dependencies.
 */
import { registerBlockType } from "@wordpress/blocks";

/**
 * Internal dependencies.
 */
import "./style.scss";
import Edit from "./edit";
import metadata from "./block.json";

const blockIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
		<path d="M4 6.75h16v1.5H4zm3 4.5h10v1.5H7zm3 4.5h4v1.5h-4z" />
	</svg>
);

registerBlockType(metadata.name, {
	icon: blockIcon,
	edit: Edit,
	save: () => null,
});
