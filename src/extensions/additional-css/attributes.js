/**
 * Additional CSS attributes
 */

export function registerAdditionalCSSAttributes(settings, name) {
	return {
		...settings,
		attributes: {
			...settings.attributes,
			additionalCSS: {
				type: "object",
				position: {
					type: "string",
				},
				top: {
					type: "string",
				},
				right: {
					type: "string",
				},
				bottom: {
					type: "string",
				},
				left: {
					type: "string",
				},
				zIndex: {
					type: "number",
				},
				rotate: {
					type: "number",
				},
				translateX: {
					type: "string",
				},
				translateY: {
					type: "string",
				},
				translateZ: {
					type: "string",
				},
				blur: {
					type: "string",
				},
				opacity: {
					type: "number",
				},
				overflowHidden: {
					type: "boolean",
				},
				// Retained for backward compatibility with the removed Custom CSS feature.
				customCSS: {
					type: "string",
				},
				selector: {
					type: "string",
				},
			},
		},
	};
}
