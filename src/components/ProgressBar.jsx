import { useEffect, useState } from "react";

export const ProgressBar = ({timer}) => {
	const [remainingTime, setRemainingTime] = useState(timer);
	
    useEffect(() => {
		const interval = setInterval(() => {
			console.log('interval');
			setRemainingTime(prev => prev - 10);
		}, 10);

		return () => {
			clearTimeout(interval);
		};
	}, []);

	return <progress value={remainingTime} max={timer} />;
};
