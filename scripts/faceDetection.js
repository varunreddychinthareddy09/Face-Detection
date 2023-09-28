const $faceDetectionContainer = document.querySelector('.face-detection-container');
const $video = document.getElementById('video');

const startVideo = () => {
	navigator.getUserMedia(
		{ video: {} },
		stream => video.srcObject = stream,
		err => console.log(err)
	)
}

const faceDetection = () => {
	const URL = './models';
	Promise.all([
		faceapi.nets.tinyFaceDetector.loadFromUri(URL),
		faceapi.nets.faceLandmark68Net.loadFromUri(URL),
		faceapi.nets.faceRecognitionNet.loadFromUri(URL),
		faceapi.nets.faceExpressionNet.loadFromUri(URL)
	]).then(startVideo);
	detectFaces();
}

const detectFaces = () => {
	$video.addEventListener('play', () => {
		const canvas = faceapi.createCanvasFromMedia(video)
		$faceDetectionContainer.append(canvas);
		const displaySize = {
			width: $video.width, height: $video.height
		}
		faceapi.matchDimensions(canvas, displaySize); 

		setInterval(async() => {
			const detections = await faceapi.detectAllFaces($video, new faceapi.TinyFaceDetectorOptions())
				.withFaceLandmarks().withFaceExpressions();
			const resizedDetections = faceapi.resizeResults(detections, displaySize);
			// Clear canvas
			canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
			// Draw detection, face marks and emotions within the canvas
			faceapi.draw.drawDetections(canvas, resizedDetections);
			faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
			faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
		}, 100);
	})
}

export { faceDetection };