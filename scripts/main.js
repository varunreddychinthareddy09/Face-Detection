const $imageUpload = document.getElementById('imageUpload');

const start = async () => {
	const $container = document.querySelector('.face-detection-container');
	const labeledFaceDescriptors = await loadLabeledImages();
	// 0.6 is the 60% percent value that we need in order to recognize a face as a character
	const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
	let uploadedImage;
	let canvas;

	const $loader = document.querySelector('.face-detection-loader');
	$loader.classList.add('is-hidden');
	$imageUpload.classList.replace('is-hidden', 'is-visible');
	const $header = document.querySelector('.face-detection-header.is-hidden');
	$header.classList.replace('is-hidden', 'is-visible');

	// When you select an image
	$imageUpload.addEventListener('change', async () => {
		if (uploadedImage) { uploadedImage.remove(); };
		if (canvas) { canvas.remove(); };
		// Get uploaded image
		uploadedImage = await faceapi.bufferToImage($imageUpload.files[0]);

		// Display image and canvas on top of the image
		$container.append(uploadedImage);
		canvas = faceapi.createCanvasFromMedia(uploadedImage);
		$container.append(canvas);
		const displaySize = { width: uploadedImage.width, height: uploadedImage.height };
		// Resize canvas
		faceapi.matchDimensions(canvas, displaySize);

		// Detect faces from the uploaded image, determine where the different face are (withFaceLandMarks), and draw the boxes around these faces (withFaceDescriptors)
		const detections = await faceapi.detectAllFaces(uploadedImage).withFaceLandmarks().withFaceDescriptors();
		// Adjust the correct sizes based on the sizes that we passed in: the displaySize
		const resizedDetections = faceapi.resizeResults(detections, displaySize);

		// Find the best match while going through the images
		const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
		results.forEach((result, i) => {
			const box = resizedDetections[i].detection.box
			// Draw our box and add the characters' name
			const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
			drawBox.draw(canvas);
		})
	})
}

const URL = './models';
Promise.all([
	// Select the library from the API which you want to use, for example: faceRecognitionNet
	faceapi.nets.faceRecognitionNet.loadFromUri(URL),
	// Detect where the actual faces are
	faceapi.nets.faceLandmark68Net.loadFromUri(URL),
	// Detect which ones are face
	faceapi.nets.ssdMobilenetv1.loadFromUri(URL)
]).then(start)
.catch(err => {
	console.log('There was a problem fetching the Face API', err);
});

const loadLabeledImages = () => {
	// Labels are the names of the folders with marvel images (which will be fetched)
	const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark'];
	return Promise.all(
		labels.map(async label => {
			const descriptions = [];
			// Only two images are added per folder, so loop through these two
			for (let i = 1; i <= 2; i++) {
				// Fetch the two marvel images per folder on github
				const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`);
				const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
				descriptions.push(detections.descriptor);
			}

			return new faceapi.LabeledFaceDescriptors(label, descriptions);
		})
	);
};