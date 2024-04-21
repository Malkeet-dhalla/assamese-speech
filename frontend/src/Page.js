import React, { useRef, useState } from 'react';
import { Grid, CircularProgress } from '@mui/joy';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Textarea from '@mui/joy/Textarea'
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import { AudioRecorder } from 'react-audio-voice-recorder';
import Audio from './Audio';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import { MdOutlineTranslate } from "react-icons/md";
import { CgTranscript } from "react-icons/cg";
import { SlSpeech } from "react-icons/sl";
import { FaQuestion } from "react-icons/fa6";
import Tasks from './Tasks';

const Page = () => {
	const [model, setModel] = useState('');
	const [audioFile, setAudioFile] = useState(null);
	const [outputText, setOutputText] = useState('');
	const [audioUrl, setAudioUrl] = useState('');
	const audioBlob = useRef(null);
	const [isLoaded, setIsLoaded] = useState(true);

	const models = ['xlsr-large-53', 'xls-r-300m', 'indicwav2vec', 'whisper'];
	const tasks = [
		{ name: 'Transcript', icon: <CgTranscript />, color: "secondary" },
		{ name: 'Translate', icon: <MdOutlineTranslate />, color: "danger"},
		{ name: 'Question', icon: <FaQuestion />, color: "success" },
	];
	const [task, setTask] = useState(tasks[0].name);
	const handleModelChange = (event, newValue) => {
		setModel(newValue);
	};


	const handleTaskChange = (event, newValue) => {
		setTask(newValue);
	};

	const handleAudioRecord = (blob) => {
		const url = URL.createObjectURL(blob);
		audioBlob.current = blob;
		setAudioFile(null);
		setAudioUrl(url);
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		const url = URL.createObjectURL(file);
		console.log(`file url: ${url}`);
		audioBlob.current = null;
		setAudioFile(file)
		setAudioUrl(url);
	};

	const handleSendToAPI = () => {
		setIsLoaded(false);
		console.log('Sending to API:', { model, task, audioUrl });
		const formData = new FormData();
		formData.append('model', model)
		formData.append('task', task);
		console.log(audioFile);
		if (audioFile) {
			console.log(audioFile);
			formData.append('audio', audioFile);
			formData.append('isFile', true);
		} else {
			formData.append('audio', audioBlob.current, 'audio.ogg');
			formData.append('isFile', false);
		}

		fetch("http://127.0.0.1:5000/submit", {
			method: "POST",
			mode: "cors",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				setIsLoaded(true);
				setOutputText(data.output)
			})
			.catch((err) => {
				setIsLoaded(true);
				console.error(err)
			});

	};


	function renderValue(option) {
		if (!option) {
			return null;
		}

		return (
			<React.Fragment>
				<ListItemDecorator sx={{ mr: 2 }}>
					{tasks.find((o) => o.name === option.value)?.icon}
				</ListItemDecorator>
				{option.label}
			</React.Fragment>
		);
	}

	return (
		<div>
			<Typography variant="h4">Speech Processing App</Typography>
			<Grid container spacing={2} >
				<Grid item xs={6}>
					<Box sx={{ marginTop: 2 }}>
						<FormControl>
							<Select
								id="model"
								value={model}
								onChange={handleModelChange}
								size="lg"
								placeholder="Select a model..."
							>
								{models.map((model) => <Option value={model} key={model}>{model}</Option>)}
							</Select>
						</FormControl>
					</Box>
					<Box sx={{ marginTop: 2 }}>
						<Tasks 
							tasks={tasks}
							currentTask={task}
							onChange={handleTaskChange}
						/>
					</Box>
					<Box sx={{ marginTop: 2 }}>
						<AudioRecorder
							onRecordingComplete={handleAudioRecord}
							onNotAllowedOrFound={(err) => console.err(err)}
							mediaRecorderOptions={{
								audioBitsPerSecond: 128000,
							}}
							showVisualizer={true}
						/>
					</Box>
					<Box sx={{ marginTop: 2 }}>
						<input
							accept="audio/wav"
							id="audio-file"
							type="file"
							onChange={handleFileChange}
							style={{ display: 'none' }}
						/>
						<label htmlFor="audio-file">
							<Button variant="outlined" component="span">
								Upload Audio
							</Button>
							{audioFile && <Typography>{audioFile.name}</Typography>}
						</label>
					</Box>
					<Box sx={{ marginTop: 2 }}>
						{audioUrl && <Audio url={audioUrl} />}
					</Box>
					<Box sx={{ marginTop: 2 }}>
						<Button
							variant="solid"
							size="lg"
							onClick={handleSendToAPI}
							disabled={!(model && task && audioUrl)}
						>
							Send
						</Button>
					</Box>
				</Grid>
				<Grid item xs={6}>
					<Box sx={{ marginTop: 2 }}>
						{isLoaded ?
							<Textarea
								id="output-text"
								minRows={10}
								variant="soft"
								value={outputText}
								readOnly
							/>
							: <CircularProgress variant="soft" />
						}
					</Box>
				</Grid>
			</Grid>
		</div>
	);
};

export default Page;

