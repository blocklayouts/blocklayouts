/**
 * Effects attributes for blocks
 */
export function registerEffectsAttributes(settings, name) {
	return {
		...settings,
		attributes: {
			...settings.attributes,
			effects: {
				type: "object",
				animation: {
					type: "object",
					enabled: {
						type: "boolean",
					},
					trigger: {
						type: "string",
					},
					preset: {
						type: "string",
					},
					easing: {
						type: "string",
					},
					duration: {
						type: "number",
					},
					delay: {
						type: "number",
					},
				},
				hover: {
					type: "object",
					enabled: {
						type: "boolean",
					},
				},
			},
		},
	};
}
