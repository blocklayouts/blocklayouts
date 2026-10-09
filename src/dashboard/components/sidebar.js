/**
 * Sidebar Component
 */
import { Button, Icon } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { home, starFilled, layout, plugins, cog } from "@wordpress/icons";
// import "./sidebar.scss";

const PluginIcon = (
	<svg
		width="28"
		height="28"
		viewBox="0 0 28 28"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M18.3024 11.0626L15.8267 12.5194L10.5443 9.41094C8.96904 8.48402 7 9.64242 7 11.4967V4.41205C7 2.55775 8.96904 1.39934 10.5443 2.32626L18.3024 6.89152C19.8776 7.81844 19.8776 10.1357 18.3024 11.0626Z"
			fill="#DBEAFE"
		/>
		<path
			d="M15.8267 12.5194L10.5443 15.6279C8.96904 16.5548 7 15.3964 7 13.5421V11.4967C7 9.64242 8.96904 8.48402 10.5443 9.41093L15.8267 12.5194Z"
			fill="#93C5FD"
		/>
		<path
			d="M20.8182 19.6282L10.5443 25.6738C8.96904 26.6007 7 25.4418 7 23.588V13.5421C7 15.3964 8.96904 16.5548 10.5443 15.6279L15.8267 12.5194L20.8182 15.4566C22.3939 16.3835 22.3939 18.7013 20.8182 19.6282Z"
			fill="#2563EB"
		/>
	</svg>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
	const { version } = window.blocklayouts_config || {};

	const navItems = [
		{ id: "home", label: __("Home", "blocklayouts"), icon: home },
		{ id: "blocks", label: __("Blocks", "blocklayouts"), icon: layout },
		{
			id: "extensions",
			label: __("Extensions", "blocklayouts"),
			icon: plugins,
		},
		{
			id: "preferences",
			label: __("Preferences", "blocklayouts"),
			icon: cog,
		},
	];

	return (
		<div className="blocklayouts-dashboard__sidebar">
			<div className="blocklayouts-dashboard__sidebar-header">
				<Icon icon={PluginIcon} size={26} />
				<h1>{__("Blocklayouts", "blocklayouts")}</h1>
				{/* {version && <p className="version">{version}</p>} */}
			</div>

			<nav className="blocklayouts-dashboard__sidebar-nav">
				{navItems.map((item) => (
					<Button
						key={item.id}
						className={`blocklayouts-dashboard__sidebar-nav-item ${
							activeTab === item.id ? "is-active" : ""
						}`}
						onClick={() => setActiveTab(item.id)}
						__next40pxDefaultSize
					>
						<Icon icon={item.icon} />
						<span>{item.label}</span>
					</Button>
				))}
			</nav>
		</div>
	);
};

export default Sidebar;
