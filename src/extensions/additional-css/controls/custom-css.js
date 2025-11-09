import { __ } from "@wordpress/i18n";
import { __experimentalToolsPanelItem as ToolsPanelItem } from "@wordpress/components";
import { useEffect, useRef } from "@wordpress/element";

// CodeMirror CSS Editor Component (using hooks)
const CodeMirrorCSS = ({ value, onChange }) => {
	const textareaRef = useRef(null);
	const editorRef = useRef(null);
	const onChangeRef = useRef(onChange);

	// Keep the onChange ref updated
	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	// Only initialize CodeMirror once
	useEffect(() => {
		if (
			textareaRef.current &&
			window.wp &&
			window.wp.CodeMirror &&
			!editorRef.current
		) {
			const editorInstance = window.wp.CodeMirror.fromTextArea(
				textareaRef.current,
				{
					lineNumbers: true,
					mode: "css",
					theme: "default",
					extraKeys: { "Ctrl-Space": "autocomplete" },
					matchBrackets: true,
					autoCloseBrackets: true,
					viewportMargin: Infinity,
				},
			);

			editorInstance.on("change", () => {
				const newValue = editorInstance.getValue();
				if (onChangeRef.current) {
					onChangeRef.current(newValue);
				}
			});

			editorRef.current = editorInstance;

			// Refresh editor after initialization
			setTimeout(() => {
				editorInstance.refresh();
			}, 100);
		}

		// Cleanup function
		return () => {
			if (editorRef.current) {
				editorRef.current.toTextArea();
				editorRef.current = null;
			}
		};
	}, []);

	// Update editor value if prop changes (but don't trigger change event)
	useEffect(() => {
		const editor = editorRef.current;
		if (editor && value !== editor.getValue()) {
			const cursor = editor.getCursor();
			editor.setValue(value || "");
			editor.setCursor(cursor);
		}
	}, [value]);

	return (
		<div className="blocklayouts-css-editor">
			<textarea ref={textareaRef} defaultValue={value} />
		</div>
	);
};

const CustomCSS = ({ setAttributes, additionalCSS }) => {
	const { customCSS, selector } = additionalCSS;

	const setSelector = () => {
		const random = Math.random().toString(36).substring(2, 11);
		setAttributes({
			additionalCSS: {
				...additionalCSS,
				selector: "blocklayouts-" + random,
			},
		});
	};
	const setCustomCSS = (value) => {
		setAttributes({
			additionalCSS: {
				...additionalCSS,
				customCSS: value,
			},
		});
	};

	// Generate CSS selector when custom CSS is added or changed
	useEffect(() => {
		if (customCSS) {
			setSelector();
		}
	}, [customCSS]);

	return (
		<>
			<ToolsPanelItem
				hasValue={() => customCSS}
				label={__("Custom CSS", "blocklayouts")}
				onDeselect={() =>
					setAttributes({
						additionalCSS: { ...additionalCSS, customCSS: undefined },
					})
				}
				onSelect={() =>
					setAttributes({
						additionalCSS: {
							...additionalCSS,
							customCSS: `selector {
  
}`,
						},
					})
				}
			>
				<h4
					style={{
						fontSize: "11px",
						fontWeight: "500",
						lineHeight: "1.4",
						textTransform: "uppercase",
						display: "block",
						marginBottom: "8px",
						marginTop: "0px",
					}}
				>
					{__("Custom CSS", "blocklayouts")}
				</h4>
				<CodeMirrorCSS
					value={customCSS}
					onChange={(value) => {
						setCustomCSS(value);
					}}
				/>
				<p
					style={{
						marginTop: "8px",
						fontStyle: "italic",
					}}
				>
					Write CSS using <code>selector</code> to target this block. You can
					add pseudo-classes like <code>selector:hover</code> for interactive
					states.{" "}
					<a
						href="https://blocklayouts.com/docs/extensions/additional-css/#how-to-use-custom-css"
						target="_blank"
						rel="noopener noreferrer"
					>
						Learn more
					</a>
				</p>
			</ToolsPanelItem>
		</>
	);
};

export default CustomCSS;
