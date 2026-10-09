/**
 * Effects controls component with Dropdown interface
 */
import {
	__experimentalToolsPanelItem as ToolsPanelItem,
	Dropdown,
	Button,
	__experimentalVStack as VStack,
	ColorPalette,
	ColorIndicator,
	TabPanel,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { Icon, reset } from "@wordpress/icons";
import { useEffect } from "@wordpress/element";
import { useSetting } from "@wordpress/block-editor";

/*
 * Internal dependencies
 */

const hoverIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
	>
		<path d="M13.9093 12.3603L17.0007 20.8537L14.1816 21.8798L11.0902 13.3864L6.91797 16.5422L8.4087 1.63318L19.134 12.0959L13.9093 12.3603Z"></path>
	</svg>
);

const Hovers = ({ attributes, setAttributes, clientId }) => {
	const { effects = {} } = attributes;
	const { hover = {} } = effects;

	// Get theme color palette
	const colors = useSetting("color.palette");

	const updateHoverEffect = (newValues) => {
		setAttributes({
			effects: {
				...effects,
				hover: {
					...hover,
					...newValues,
				},
			},
		});
	};

	const resetHoverEffect = () => {
		setAttributes({
			effects: {
				...effects,
				hover: {
					enabled: undefined,
					color: undefined,
					customColor: undefined,
					backgroundColor: undefined,
					customBackgroundColor: undefined,
					borderColor: undefined,
					customBorderColor: undefined,
				},
			},
		});
	};

	// Auto-enable hover when any hover property is set
	useEffect(() => {
		if (
			!hover?.enabled &&
			(hover?.color ||
				hover?.customColor ||
				hover?.backgroundColor ||
				hover?.customBackgroundColor ||
				hover?.borderColor ||
				hover?.customBorderColor)
		) {
			updateHoverEffect({ enabled: true });
		}
	}, [hover]);

	const currentTextColor = hover?.customColor || hover?.color;
	const currentBackgroundColor =
		hover?.customBackgroundColor || hover?.backgroundColor;
	const currentBorderColor = hover?.customBorderColor || hover?.borderColor;

	return (
		<ToolsPanelItem
			hasValue={() => !!hover.enabled}
			label={__("Hover", "blocklayouts")}
			onDeselect={resetHoverEffect}
			onSelect={() => {
				updateHoverEffect({
					enabled: true,
				});
			}}
			className="blocklayouts-tools-panel-effects-settings__item"
		>
			<Dropdown
				popoverProps={{
					placement: "left-start",
					offset: 36,
					shift: true,
				}}
				className="blocklayouts-effects-settings"
				renderToggle={({ isOpen, onToggle }) => (
					<div className="blocklayouts-effects-settings__dropdown">
						<Button
							onClick={onToggle}
							aria-expanded={isOpen}
							className="blocklayouts-effects-settings__dropdown-toggle"
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						>
							{hover?.enabled ? (
								<span className="blocklayouts-effects-settings__indicator">
									<Icon size={16} icon={hoverIcon} />
								</span>
							) : (
								<span className="blocklayouts-effects-settings__indicator disabled"></span>
							)}

							<span>{__("Hover", "blocklayouts")}</span>
						</Button>

						{hover?.enabled && (
							<Button
								onClick={() => {
									resetHoverEffect();
									onToggle();
								}}
								size="small"
								icon={reset}
								className="blocklayouts-effects-settings__dropdown-reset"
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						)}
					</div>
				)}
				renderContent={() => (
					<div
						className="blocklayouts-effects-settings_hover"
						style={{ width: "260px" }}
					>
						<TabPanel
							className="blocklayouts-effects-settings_hover-tab-panel"
							onSelect={() => {}}
							tabs={[
								{
									name: "colors",
									title: "Colors",
									className: "blocklayouts-effects-settings_hover-tab-colors",
								},
								{
									name: "transition",
									title: "Transition",
									className:
										"blocklayouts-effects-settings_hover-tab-transition",
								},
							]}
						>
							{(tab) => <p>{tab.title}</p>}
						</TabPanel>
					</div>
				)}
			/>
		</ToolsPanelItem>
	);
};

export default Hovers;
