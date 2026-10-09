/**
 * Home Tab Component
 */
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Icon,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import {
	globe,
	link,
	comment,
	cover,
	external,
	layout,
	symbol,
	plus,
	blockDefault,
	brush,
	settings,
	help,
} from "@wordpress/icons";

import "./home.scss";

const Home = () => {
	const quickLinks = [
		{
			label: __("Blocklayouts.com", "blocklayouts"),
			url: "https://blocklayouts.com/",
			icon: <Icon icon={globe} />,
		},
		{
			label: __("Patterns Library", "blocklayouts"),
			url: "https://blocklayouts.com/patterns/",
			icon: <Icon icon={layout} />,
		},
		{
			label: __("Documentation", "blocklayouts"),
			url: "https://blocklayouts.com/docs/",
			icon: <Icon icon={cover} />,
		},
		{
			label: __("Support", "blocklayouts"),
			url: "https://blocklayouts.com/support/",
			icon: <Icon icon={comment} />,
		},
	];

	const howToSteps = [
		{
			icon: symbol,
			title: __("Open the pattern library", "blocklayouts"),
			description: __(
				"In the block editor, click the Blocklayouts icon in the top toolbar to browse patterns and page templates.",
				"blocklayouts",
			),
		},
		{
			icon: plus,
			title: __("Insert a pattern", "blocklayouts"),
			description: __(
				"Filter by category, preview a design, and click it to add it to your page. Patterns are made of regular blocks, so you can edit everything.",
				"blocklayouts",
			),
		},
		{
			icon: blockDefault,
			title: __("Add custom blocks", "blocklayouts"),
			description: __(
				"Open the block inserter and look for the Blocklayouts category to find the Icon, Marquee and Table of Contents blocks. Infinite Scroll is available inside a Query Loop block.",
				"blocklayouts",
			),
		},
		{
			icon: brush,
			title: __("Use the block extensions", "blocklayouts"),
			description: __(
				"Select a core block such as Button, Group or Gallery and open the block settings sidebar to find extra controls like effects, hover colors, links, button icons and masonry layouts.",
				"blocklayouts",
			),
		},
		{
			icon: settings,
			title: __("Manage your blocks", "blocklayouts"),
			description: __(
				"Use the Blocks tab on this screen to turn individual blocks on or off.",
				"blocklayouts",
			),
		},
	];

	return (
		<div className="blocklayouts-dashboard__home">
			<div className="blocklayouts-dashboard__home-content">
				<h2 style={{ fontSize: "28px" }}>
					{__("Welcome to Blocklayouts!", "blocklayouts")}
				</h2>
				<p style={{ marginBottom: "24px", color: "#757575" }}>
					{__(
						"Blocklayouts is a WordPress plugin that enhances your block editor experience with custom blocks, enhanced core blocks, and pre-designed patterns to build WordPress sites faster.",
						"blocklayouts",
					)}
				</p>

				<section className="blocklayouts-dashboard__howto">
					<div className="blocklayouts-dashboard__howto-header">
						<h3>{__("How to use Blocklayouts", "blocklayouts")}</h3>
						<p>
							{__(
								"Go from a blank page to a finished layout in a few steps.",
								"blocklayouts",
							)}
						</p>
					</div>
					<ol className="blocklayouts-dashboard__howto-grid" role="list">
						{howToSteps.map((step, index) => (
							<li key={step.title} className="blocklayouts-dashboard__howto-step">
								<div className="blocklayouts-dashboard__howto-step-top">
									<span className="blocklayouts-dashboard__howto-icon">
										<Icon icon={step.icon} size={24} />
									</span>
									<span
										className="blocklayouts-dashboard__howto-number"
										aria-hidden="true"
									>
										{String(index + 1).padStart(2, "0")}
									</span>
								</div>
								<h4>{step.title}</h4>
								<p>{step.description}</p>
							</li>
						))}
						<li className="blocklayouts-dashboard__howto-step is-help">
							<div className="blocklayouts-dashboard__howto-step-top">
								<span className="blocklayouts-dashboard__howto-icon">
									<Icon icon={help} size={24} />
								</span>
							</div>
							<h4>{__("Need more help?", "blocklayouts")}</h4>
							<p>
								{__(
									"Guides and examples for every block and extension.",
									"blocklayouts",
								)}
							</p>
							<Button
								variant="secondary"
								href="https://blocklayouts.com/docs/"
								target="_blank"
								rel="noopener noreferrer"
								icon={external}
								iconPosition="right"
								__next40pxDefaultSize
							>
								{__("Read the documentation", "blocklayouts")}
							</Button>
						</li>
					</ol>
				</section>
			</div>
			<div className="blocklayouts-dashboard__home-sidebar">
				<div className="blocklayouts-dashboard__home-sidebar-item">
					<Icon icon={external} size={28} style={{ marginBottom: "8px" }} />
					<h3 style={{ marginBottom: "24px" }}>
						{__("Quick Links", "blocklayouts")}
					</h3>
					<ul>
						{quickLinks.map((link) => (
							<li key={link.label}>
								<Button
									variant="link"
									href={link.url}
									target="_blank"
									rel="noopener noreferrer"
									icon={link.icon}
									__next40pxDefaultSize
									style={{ padding: 0 }}
								>
									{link.label}
								</Button>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default Home;
