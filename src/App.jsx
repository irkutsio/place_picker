import { useCallback, useEffect, useRef, useState } from 'react';
import { sortPlacesByDistance } from './loc.js';
import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';

function App() {
	const selectedPlace = useRef();
	const storedIDs = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
	const storedPlaces = storedIDs.map(id => AVAILABLE_PLACES.find(place => place.id === id));
	const [isOpenModal, setIsOpenModal] = useState(false);
	const [pickedPlaces, setPickedPlaces] = useState(storedPlaces);
	const [availablePlaces, setAvailablePlaces] = useState([]);

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(position => {
			const sortedPlaces = sortPlacesByDistance(
				AVAILABLE_PLACES,
				position.coords.latitude,
				position.coords.longitude
			);
			setAvailablePlaces(sortedPlaces);
		});
	}, []);

	function handleStartRemovePlace(id) {
		setIsOpenModal(true);
		selectedPlace.current = id;
	}

	function handleStopRemovePlace() {
		setIsOpenModal(false);
	}

	function handleSelectPlace(id) {
		setPickedPlaces(prevPickedPlaces => {
			if (prevPickedPlaces.some(place => place.id === id)) {
				return prevPickedPlaces;
			}
			const place = AVAILABLE_PLACES.find(place => place.id === id);
			return [place, ...prevPickedPlaces];
		});

		const storedIDs = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
		if (storedIDs.indexOf(id) === -1) {
			localStorage.setItem('selectedPlaces', JSON.stringify([id, ...storedIDs]));
		}
	}

	const handleRemovePlace = useCallback(function handleRemovePlace() {
		setPickedPlaces(prevPickedPlaces =>
			prevPickedPlaces.filter(place => place.id !== selectedPlace.current)
		);
		setIsOpenModal(false);

		const storedIDs = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
		localStorage.setItem(
			'selectedPlaces',
			JSON.stringify(storedIDs.filter(id => id !== selectedPlace.current))
		);
	}, []);

	return (
		<>
			<Modal open={isOpenModal} onClose={handleStopRemovePlace}>
				<DeleteConfirmation onCancel={handleStopRemovePlace} onConfirm={handleRemovePlace} />
			</Modal>

			<header>
				<img src={logoImg} alt="Stylized globe" />
				<h1>PlacePicker</h1>
				<p>
					Create your personal collection of places you would like to visit or you have visited.
				</p>
			</header>
			<main>
				<Places
					title="I'd like to visit ..."
					fallbackText={'Select the places you would like to visit below.'}
					places={pickedPlaces}
					onSelectPlace={handleStartRemovePlace}
				/>
				<Places
					title="Available Places"
					places={availablePlaces}
					fallbackText="Sorting places by distance..."
					onSelectPlace={handleSelectPlace}
				/>
			</main>
		</>
	);
}

export default App;
