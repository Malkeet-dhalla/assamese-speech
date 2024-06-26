import { MdOutlineTranslate } from "react-icons/md";
import { CgTranscript } from "react-icons/cg";
import { SlSpeech } from "react-icons/sl";
import { ToggleButtonGroup } from "@mui/joy";
import { Button } from "@mui/joy";
import { useState } from "react";

const Tasks = ({currentTask, tasks, onChange}) => {
	return (
		<ToggleButtonGroup
			spacing={1}
			variant="plain"
			value={currentTask}
			onChange={onChange}
			>
			{tasks.map((task) => 
				<Button
					key={task.value}
					value={task.value}
					startDecorator={task.icon}
					color={task.color}
				>
					{task.label}
				</Button>
			)}
		</ToggleButtonGroup>
	)
}

export default Tasks;
