import './Page.css';
import './AudioRecorder.css';

import React, { useEffect, useRef, useState } from 'react';
import { Grid, CircularProgress, Divider } from '@mui/joy';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Textarea from '@mui/joy/Textarea'
import Typography from '@mui/joy/Typography';
import FormLabel from '@mui/joy/FormLabel';
import Box from '@mui/joy/Box';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import Audio from './Audio';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import { MdOutlineTranslate } from "react-icons/md";
import { CgTranscript } from "react-icons/cg";
import { MdOutlineCloudUpload } from "react-icons/md";
import { FaQuestion } from "react-icons/fa6";
import Tasks from './Tasks';

const Page = () => {
	const [audioFile, setAudioFile] = useState(null);
	const [outputText, setOutputText] = useState('');
	const [audioUrl, setAudioUrl] = useState('');
	const audioBlob = useRef(null);
	const [isLoaded, setIsLoaded] = useState(true);
	const recorderControls = useAudioRecorder();

	// Model and task labels. This first element is the default selection.
	const models = ['whisper', 'xlsr-large-53', 'xls-r-300m', 'indicwav2vec'];
	const tasks = [
		{ label: 'Transcript', value: 'transcript', icon: <CgTranscript />, color: "secondary" },
		{ label: 'Translate', value: 'translate', icon: <MdOutlineTranslate />, color: "danger" },
		{ label: 'Question', value: 'question', icon: <FaQuestion />, color: "success" },
	];


	const outputPlaceholder = "Your result will appear here..."
	const recordingTimeLimit = 30; // In secs;

	const [model, setModel] = useState(models[0]);
	const [task, setTask] = useState(tasks[0].value);

	useEffect(() => {
		if (recorderControls.recordingTime >= recordingTimeLimit) {
			recorderControls.stopRecording();
			handleAudioRecord(recorderControls.recordingBlob);
		}
	}, [recorderControls.recordingTime])

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
		audioBlob.current = null;
		setAudioFile(file)
		setAudioUrl(url);
	};

	const handleSendToAPI = () => {
		setIsLoaded(false);
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

	return (
		<div className="page">
			<Grid container spacing={2} >
				<Grid item xs={6}>
					<Box sx={{ marginTop: 2 }}>
						<FormControl>
							<FormLabel id="model-label" htmlFor="model">
								Model
							</FormLabel>
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
					<Box sx={{ marginTop: 5 }}>
						<Divider />
					</Box>
					<Grid container spacing={2}>
						<Grid item xs={4}>
							<Box sx={{ marginTop: 2 }}>
								<input
									accept="audio/wav"
									id="audio-file"
									type="file"
									onChange={handleFileChange}
									style={{ display: 'none' }}
								/>
								<label htmlFor="audio-file">
									<Button
										variant="outlined"
										component="span"
										startDecorator={<MdOutlineCloudUpload />}
									>
										Upload Audio
									</Button>
								</label>
							</Box>
						</Grid>
						<Grid item xs={1}>
							<Box sx={{ marginTop: 2, paddingTop: 1 }}>
								<Typography color="neutral">or</Typography>
							</Box>
						</Grid>
						<Grid item xs={7}>
							<Box sx={{ marginTop: 2 }}>
								<AudioRecorder
									onRecordingComplete={handleAudioRecord}
									onNotAllowedOrFound={(err) => console.err(err)}
									mediaRecorderOptions={{
										audioBitsPerSecond: 128000,
									}}
									showVisualizer={true}
									classes={{
										AudioRecorderClass: "audio-recorder-joy",
									}}
									recorderControls={recorderControls}
								/>
							</Box>
						</Grid>
					</Grid>
					<Box sx={{ marginTop: 2, width: '80%' }}>
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
					<Box
						sx={{
							marginTop: 2,
							width: 1,
							height: 1,
							display: 'flex',
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						{isLoaded ?
							<Textarea
								id="output-text"
								minRows={10}
								variant="soft"
								value={outputText}
								readOnly
								placeholder={outputPlaceholder}
								sx={{
									flexGrow: 1,
									alignSelf: "stretch",
									padding: 3,
								}}
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

