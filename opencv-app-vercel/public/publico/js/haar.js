let currentFaceCount = 0;
let interactionCount = 0;
let isFaceDetection = true;

function openCvReady() {
    cv['onRuntimeInitialized'] = () => {
        let video = document.getElementById("cam_input");
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function(err) {
                console.log("An error occurred! " + err);
            });

        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let gray = new cv.Mat();
        let cap = new cv.VideoCapture(video);
        let faces = new cv.RectVector();
        let eyes = new cv.RectVector();
        let faceClassifier = new cv.CascadeClassifier();
        let eyeClassifier = new cv.CascadeClassifier();

        let faceCascadeFile = 'haarcascade_frontalface_default.xml';
        let eyeCascadeFile = 'haarcascade_eye.xml';

        utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
            faceClassifier.load(faceCascadeFile);
        });
        utils.createFileFromUrl(eyeCascadeFile, eyeCascadeFile, () => {
            eyeClassifier.load(eyeCascadeFile);
        });

        const FPS = 24;

        function processVideo() {
            let begin = Date.now();
            cap.read(src);
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);

            faceClassifier.detectMultiScale(gray, faces, 1.1, 3, 0);
            currentFaceCount = faces.size();  // Actualiza conteo de caras

            for (let i = 0; i < faces.size(); ++i) {
                let face = faces.get(i);
                let point1 = new cv.Point(face.x, face.y);
                let point2 = new cv.Point(face.x + face.width, face.y + face.height);
                cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
                if (!isFaceDetection) {
                    let roiGray = gray.roi(face);
                    eyeClassifier.detectMultiScale(roiGray, eyes, 1.1, 3, 0);
                    for (let j = 0; j < eyes.size(); ++j) {
                        let eye = eyes.get(j);
                        let ePoint1 = new cv.Point(face.x + eye.x, face.y + eye.y);
                        let ePoint2 = new cv.Point(face.x + eye.x + eye.width, face.y + eye.y + eye.height);
                        cv.rectangle(dst, ePoint1, ePoint2, [0, 255, 0, 255]);
                    }
                    roiGray.delete();
                }
            }

            cv.imshow("canvas_output", dst);
            let delay = 1000 / FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        }

        addNavigationButtons();
        setTimeout(processVideo, 0);
    };
}

function switchDetection() {
    isFaceDetection = !isFaceDetection;
    interactionCount++;  // Cuenta interacciones
}

function sendData() {
    const data = { faces: currentFaceCount, interactions: interactionCount };
    fetch('/api/send-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => console.log(result.message))
    .catch(err => console.error('Error enviando datos:', err));
}

function addNavigationButtons() {
    let switchButton = document.createElement('button');
    switchButton.textContent = 'Switch Detection';
    switchButton.addEventListener('click', switchDetection);

    let sendButton = document.createElement('button');
    sendButton.textContent = 'Enviar Datos';
    sendButton.addEventListener('click', sendData);

    let buttonContainer = document.getElementById('buttonContainer');
    buttonContainer.appendChild(switchButton);
    buttonContainer.appendChild(sendButton);
}