import cv2                                              # For image processing
import dlib                                             # For face detection
from scipy.spatial import distance                      # For equclidean distance
from playsound import playsound                         # For alarm
import threading                                        # For multithreading
import time                                             # For time

def eye_aspect_ratio(eye):
    A = distance.euclidean(eye[1], eye[5])
    B = distance.euclidean(eye[2], eye[4])
    C = distance.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

detector    = dlib.get_frontal_face_detector()          # Face detector
predictor   = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

EAR_THRESHOLD = 0.25
ALARM_DURATION_THRESHOLD = 3
closed_eyes_start_time = None
alarm_on = False
alarm_thread = None

def play_alarm():
    playsound("alarm.wav")

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)

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
            elif time.time() - closed_eyes_start_time >= ALARM_DURATION_THRESHOLD and not alarm_on:
                cv2.putText(frame, "السائق نائم!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                alarm_on = True
                alarm_thread = threading.Thread(target = play_alarm)
                alarm_thread.start()
        else:
            closed_eyes_start_time = None
            if alarm_on:
                alarm_on = False

    cv2.imshow("Driver Status", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()