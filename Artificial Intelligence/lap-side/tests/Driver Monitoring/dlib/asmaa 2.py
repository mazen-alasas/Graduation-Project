import cv2
import dlib
from scipy.spatial import distance as dist
from playsound import playsound
import threading
import time

def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

EAR_THRESHOLD = 0.25
ALARM_DURATION_THRESHOLD = 3
NO_FACE_THRESHOLD = 5

closed_eyes_start_time = None
no_face_start_time = None
alarm_on = False

def play_alarm():
    playsound("alarm.wav")

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)

    if len(faces) == 0:
        if no_face_start_time is None:
            no_face_start_time = time.time()
        elif time.time() - no_face_start_time >= NO_FACE_THRESHOLD and not alarm_on:
            cv2.putText(frame, "Face not detected!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            alarm_on = True
            threading.Thread(target=play_alarm).start()
    else:
        no_face_start_time = None
        for face in faces:
            landmarks = predictor(gray, face)
            left_eye = [(landmarks.part(i).x, landmarks.part(i).y) for i in range(36, 42)]
            right_eye = [(landmarks.part(i).x, landmarks.part(i).y) for i in range(42, 48)]
            ear = (eye_aspect_ratio(left_eye) + eye_aspect_ratio(right_eye)) / 2.0

            if ear < EAR_THRESHOLD:
                if closed_eyes_start_time is None:
                    closed_eyes_start_time = time.time()
                elif time.time() - closed_eyes_start_time >= ALARM_DURATION_THRESHOLD and not alarm_on:
                    cv2.putText(frame, "Driver sleeping!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                    alarm_on = True
                    threading.Thread(target=play_alarm).start()
            else:
                closed_eyes_start_time = None
                alarm_on = False

    cv2.imshow("Driver Status", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()