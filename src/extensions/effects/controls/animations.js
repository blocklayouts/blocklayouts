/**
 * Effects controls component with Dropdown interface
 */
import {
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	Dropdown,
	Button,
	SelectControl,
	RangeControl,
	__experimentalVStack as VStack,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { Icon, reset } from "@wordpress/icons";
import { useEffect } from "@wordpress/element";

const animationIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
	>
		<path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path>
	</svg>
);

const Animations = ({ attributes, setAttributes, clientId }) => {
	const { effects = {} } = attributes;
	const { animation = {} } = effects;

	const updateAnimationEffect = (newValues) => {
		setAttributes({
			effects: {
				...effects,
				animation: {
					...animation,
					...newValues,
				},
			},
		});
	};

	const resetAnimationEffect = () => {
		setAttributes({
			effects: {
				...effects,
				animation: {
					enabled: undefined,
					trigger: undefined,
					preset: undefined,
					duration: undefined,
					delay: undefined,
					easing: undefined,
				},
			},
		});
	};

	// Generate CSS selector when custom CSS is added
	useEffect(() => {
		if (!animation?.enabled && (animation?.trigger || animation?.preset)) {
			setAttributes({
				effects: {
					...effects,
					animation: {
						enabled: true,
					},
				},
			});
		}
	}, [animation]);

	const presetOptions = [
		{
			label: __("Select an option", "blocklayouts"),
			value: "",
			disabled: true,
		},
		{ label: __("Fade In", "blocklayouts"), value: "fadeIn" },
		{ label: __("Scale In", "blocklayouts"), value: "scaleIn" },
		{ label: __("Slide Up", "blocklayouts"), value: "slideUp" },
		{ label: __("Slide Down", "blocklayouts"), value: "slideDown" },
		{ label: __("Slide Left", "blocklayouts"), value: "slideLeft" },
		{ label: __("Slide Right", "blocklayouts"), value: "slideRight" },
		{
			label: __("Custom (Coming soon)", "blocklayouts"),
			value: "custom",
			disabled: true,
		},
	];

	const easingOptions = [
		{
			label: __("Select an option", "blocklayouts"),
			value: "",
			disabled: true,
		},
		{ label: __("Ease", "blocklayouts"), value: "ease" },
		{ label: __("Ease In", "blocklayouts"), value: "ease-in" },
		{ label: __("Ease Out", "blocklayouts"), value: "ease-out" },
		{ label: __("Ease In Out", "blocklayouts"), value: "ease-in-out" },
		{ label: __("Linear", "blocklayouts"), value: "linear" },
	];

	return (
		<ToolsPanelItem
			hasValue={() => !!animation.enabled}
			label={__("Animation", "blocklayouts")}
			onDeselect={resetAnimationEffect}
			onSelect={() => {
				setAttributes({
					effects: {
						animation: {
							enabled: true,
							trigger: "onAppear",
							preset: "fadeIn",
							duration: 0.4,
							delay: 0,
							easing: "ease-in-out",
						},
					},
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
							{animation?.enabled ? (
								<span className="blocklayouts-effects-settings__indicator">
									<Icon size={16} icon={animationIcon} />
								</span>
							) : (
								<span className="blocklayouts-effects-settings__indicator disabled"></span>
							)}

							<span>{__("Animation", "blocklayouts")}</span>
						</Button>

						{animation?.enabled && (
							<Button
								onClick={() => {
									resetAnimationEffect();
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
						className="blocklayouts-effects-settings_animation"
						style={{ width: "260px", padding: "8px" }}
					>
						<VStack spacing={4}>
							<ToggleGroupControl
								label={__("Trigger", "blocklayouts")}
								value={animation?.trigger || ""}
								onChange={(trigger) => updateAnimationEffect({ trigger })}
								isBlock
								help={__(
									"Choose when the animation should start.",
									"blocklayouts",
								)}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							>
								<ToggleGroupControlOption
									value="onAppear"
									label={__("On Appear", "blocklayouts")}
									aria-label={__("On page load", "blocklayouts")}
									showTooltip
								/>
								<ToggleGroupControlOption
									value="onScroll"
									label={__("On Scroll", "blocklayouts")}
									aria-label={__("On scroll into view", "blocklayouts")}
									showTooltip
								/>
							</ToggleGroupControl>

							<SelectControl
								label={__("Animation Name", "blocklayouts")}
								value={animation?.preset || ""}
								options={presetOptions}
								onChange={(preset) => updateAnimationEffect({ preset })}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>

							<SelectControl
								label={__("Easing", "blocklayouts")}
								value={animation?.easing || ""}
								options={easingOptions}
								onChange={(easing) => updateAnimationEffect({ easing })}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>

							<RangeControl
								label={__("Duration (s)", "blocklayouts")}
								value={animation?.duration || 0}
								onChange={(duration) => updateAnimationEffect({ duration })}
								min={0.2}
								max={1.2}
								step={0.1}
								marks={[
									{
										value: 0.2,
									},
									{
										value: 0.4,
									},
									{
										value: 0.6,
									},
									{
										value: 0.8,
									},
									{
										value: 1,
									},
									{
										value: 1.2,
									},
								]}
								withInputField={false}
								__nextHasNoMarginBottom
							/>
							<RangeControl
								label={__("Delay (s)", "blocklayouts")}
								value={animation?.delay || 0}
								onChange={(delay) => updateAnimationEffect({ delay })}
								min={0}
								max={10}
								step={0.1}
								withInputField
								__next40pxDefaultSize
							/>
						</VStack>
					</div>
				)}
			/>
		</ToolsPanelItem>
	);
};

export default Animations;
