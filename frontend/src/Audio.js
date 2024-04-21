import { Player } from 'react-simple-player';

const Audio = ({url}) => {
			
	return (<Player
		src={url}
		height={40}
		>
		</Player>)
}

export default Audio;
