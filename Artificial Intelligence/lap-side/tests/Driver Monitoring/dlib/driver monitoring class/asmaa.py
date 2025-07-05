import cv2
import dlib
from scipy.spatial import distance as dist
from playsound import playsound
import threading
import time
import os

def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

shape_predictor_path = "shape_predictor_68_face_landmarks.dat"
if not os.path.exists(shape_predictor_path):
    raise FileNotFoundError(f"File '{shape_predictor_path}' not found. Please download it and place it in the same directory.")

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(shape_predictor_path)

EAR_THRESHOLD = 0.25
ALARM_DURATION_THRESHOLD = 3
NO_FACE_THRESHOLD = 4
MESSAGE_DISPLAY_DURATION = 2

closed_eyes_start_time = None
no_face_start_time = None
alarm_on = False
message_time = None
message_text = ""

def play_alarm():
    playsound("alarm.wav")

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Camera not open")
    exit()

print("Press 'q' to quit the program.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error reading frame.")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)

    if len(faces) == 0:
        if no_face_start_time is None:
            no_face_start_time = time.time()
        elif time.time() - no_face_start_time >= NO_FACE_THRESHOLD:
            if not alarm_on:
                message_text = "Face not detected!"
                message_time = time.time()
                alarm_on = True
                threading.Thread(target=play_alarm).start()
    else:
        no_face_start_time = None
        for face in faces:
            landmarks = predictor(gray, face)

            left_eye = [(landmarks.part(i).x, landmarks.part(i).y) for i in range(36, 42)]
            right_eye = [(landmarks.part(i).x, landmarks.part(i).y) for i in range(42, 48)]

            left_ear = eye_aspect_ratio(left_eye)
            right_ear = eye_aspect_ratio(right_eye)
            ear = (left_ear + right_ear) / 2.0

            if ear < EAR_THRESHOLD:
                if closed_eyes_start_time is None:
                    closed_eyes_start_time = time.time()
                elif time.time() - closed_eyes_start_time >= ALARM_DURATION_THRESHOLD:
                    if not alarm_on:
                        message_text = "Driver is sleeping!"
                        message_time = time.time()
                        alarm_on = True
                        threading.Thread(target=play_alarm).start()
            else:
                closed_eyes_start_time = None
                alarm_on = False

            cv2.putText(frame, f"EAR: {ear:.2f}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    if message_text and time.time() - message_time <= MESSAGE_DISPLAY_DURATION:
        cv2.putText(frame, message_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

    cv2.imshow("Driver Status", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()