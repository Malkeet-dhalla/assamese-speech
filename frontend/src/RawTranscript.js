import { Button, Textarea } from "@mui/joy";
import { useState } from "react";
import { FaAnglesDown } from "react-icons/fa6";
import { FaAnglesRight } from "react-icons/fa6";

const RawTranscript = ({ text }) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleToggle = () => {
		setIsOpen(open => !open);
	}

	const placeholder = "Raw transcript..."

	return (
		<>
			<Button
				variant="plain"
				color="neutral"
				endDecorator={isOpen ? <FaAnglesDown /> : <FaAnglesRight />}
				onClick={handleToggle}
				sx={{
					color: "#636B74",
					fontWeight: "normal",
				}}
			>
				Raw transcript
			</Button>
			<Textarea
				minRows={5}
				maxRows={5}
				variant="soft"
				value={text}
				readOnly
				placeholder={placeholder}
				sx={{
					visibility: isOpen ? 'visible' : 'hidden',
					marginTop: 1,
					padding: 3,
				}}
			/>
		</>
	)
}

export default RawTranscript;
