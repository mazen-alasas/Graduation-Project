import cv2
import dlib
import threading
import time
from playsound import playsound
from helper import eye_aspect_ratio, check_shape_predictor

class DriverMonitor:
    def __init__(self):
        self.shape_predictor_path = "shape_predictor_68_face_landmarks.dat"
        check_shape_predictor(self.shape_predictor_path)
        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor(self.shape_predictor_path)

        self.EAR_THRESHOLD = 0.25
        self.ALARM_DURATION_THRESHOLD = 3
        self.NO_FACE_THRESHOLD = 4
        self.MESSAGE_DISPLAY_DURATION = 2

        self.closed_eyes_start_time = None
        self.no_face_start_time = None
        self.alarm_on = False
        self.message_time = None
        self.message_text = ""

    def play_alarm(self):
        playsound("alarm.wav")

    def monitor(self):
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Camera not open")
            return

        print("Press 'q' to quit the program.")
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Error reading frame.")
                break

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.detector(gray)

            if len(faces) == 0:
                self._handle_no_face_detected()
            else:
                self.no_face_start_time = None
                self._handle_faces_detected(faces, gray, frame)

            if self.message_text and time.time() - self.message_time <= self.MESSAGE_DISPLAY_DURATION:
                cv2.putText(frame, self.message_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

            cv2.imshow("Driver Status", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

    def _handle_no_face_detected(self):
        if self.no_face_start_time is None:
            self.no_face_start_time = time.time()
        elif time.time() - self.no_face_start_time >= self.NO_FACE_THRESHOLD:
            if not self.alarm_on:
                self.message_text = "Face not detected!"
                self.message_time = time.time()
                self.alarm_on = True
                threading.Thread(target=self.play_alarm).start()

    def _handle_faces_detected(self, faces, gray, frame):
        for face in faces:
            landmarks = self.predictor(gray, face)

            left_eye = [(landmarks.part(i).x, landmarks.part(i).y) for i in range(36, 42)]
            right_eye = [(landmarks.part(i).x, landmarks.part(i).y) for i in range(42, 48)]

            left_ear = eye_aspect_ratio(left_eye)
            right_ear = eye_aspect_ratio(right_eye)
            ear = (left_ear + right_ear) / 2.0

            if ear < self.EAR_THRESHOLD:
                if self.closed_eyes_start_time is None:
                    self.closed_eyes_start_time = time.time()
                elif time.time() - self.closed_eyes_start_time >= self.ALARM_DURATION_THRESHOLD:
                    if not self.alarm_on:
                        self.message_text = "Driver is sleeping!"
                        self.message_time = time.time()
                        self.alarm_on = True
                        threading.Thread(target=self.play_alarm).start()
            else:
                self.closed_eyes_start_time = None
                self.alarm_on = False

            cv2.putText(frame, f"EAR: {ear:.2f}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
