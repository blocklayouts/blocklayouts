/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import {
	Flex,
	FlexItem,
	FlexBlock,
	ToggleControl,
	Button,
	Icon,
} from "@wordpress/components";
import { blockDefault, lock } from "@wordpress/icons";
import { store as coreStore, useEntityRecord } from "@wordpress/core-data";
import { store as noticesStore } from "@wordpress/notices";
import { useDispatch } from "@wordpress/data";

/**
 * Internal dependencies
 */
import { useBlocks } from "../../../context/hooks";
import { BlocksSkeleton } from "../../../utils/skeleton";

import "./blocks.scss";

const BlockItem = ({ block, onToggle, disabled, isActiveLicense }) => {
	const { icon, title, description, premium } = block;

	return (
		<Flex
			className="blocklayouts-dashboard__card-item"
			gap={3}
			align="flex-start"
			justify="space-between"
		>
			<FlexItem className="blocklayouts-dashboard__card-item__icon">
				{icon ? <Icon icon={icon} /> : <Icon icon={blockDefault} />}
			</FlexItem>

			<FlexBlock className="blocklayouts-dashboard__card-item__content">
				<h4 className="blocklayouts-dashboard__card-item__title">{title}</h4>
				{description && (
					<p className="blocklayouts-dashboard__card-item__description">
						{description}
					</p>
				)}
			</FlexBlock>

			<FlexItem className="blocklayouts-dashboard__card-item__toggle">
				{premium && !isActiveLicense ? (
					<Button
						variant="primary"
						style={{
							padding: "6px 8px",
							backgroundColor: "#000",
							minHeight: "28px",
						}}
						size="small"
						icon={lock}
						iconSize={16}
						href="https://blocklayouts.com/premium/"
						target="_blank"
						rel="noopener noreferrer"
					>
						{__("Pro", "blocklayouts")}
					</Button>
				) : (
					<ToggleControl
						checked={block.active}
						onChange={() => onToggle(block.name)}
						disabled={disabled}
						__nextHasNoMarginBottom
					/>
				)}
			</FlexItem>
		</Flex>
	);
};

const Blocks = () => {
	const { toggle } = useBlocks();

	const blocksData = useEntityRecord("blocklayouts/v1", "blocks");
	const blocks = blocksData?.record?.data;
	const blocksLoading = !blocksData.hasResolved;

	const licenseData = useEntityRecord("blocklayouts/v1", "license");
	const license = licenseData?.record?.data;
	const isActiveLicense = license?.is_active;
	const licenseLoading = !licenseData.hasResolved;

	const [toggling, setToggling] = useState(null);

	const { saveEntityRecord } = useDispatch(coreStore);
	const { createNotice } = useDispatch(noticesStore);

	const handleToggle = async (blockName) => {
		setToggling(blockName);

		const record = blocks.map((block) => {
			if (block.name === blockName) {
				return { ...block, active: !block.active };
			}
			return block;
		});

		const response = await saveEntityRecord(
			"blocklayouts/v1",
			"blocks",
			record,
		);

		if (response) {
			createNotice("success", "Blocks updated successfully!", {
				context: "blocklayouts",
				isDismissible: true,
			});
		} else {
			createNotice("error", "Failed to update blocks", {
				context: "blocklayouts",
				isDismissible: true,
			});
		}

		setToggling(null);
	};

	if (licenseLoading || blocksLoading) {
		return <BlocksSkeleton />;
	}

	return (
		<div className="blocklayouts-dashboard__blocks">
			<div className="blocklayouts-dashboard__grid">
				{blocks.map((block) => (
					<div key={block.name} className="blocklayouts-dashboard__card">
						<BlockItem
							block={block}
							onToggle={handleToggle}
							disabled={toggling === block.name || blocksLoading}
							isActiveLicense={isActiveLicense}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default Blocks;
