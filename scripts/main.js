import { faceRecognition } from './faceRecognition.js';
import { faceDetection } from './faceDetection.js';

// Execute
const $faceRecognitionContainer = document.querySelector('.face-recognition-container');
if ($faceRecognitionContainer) {
	faceRecognition();
}
const $faceDetectionContainer = document.querySelector('.face-detection-container');
if ($faceDetectionContainer) {
	faceDetection();
}