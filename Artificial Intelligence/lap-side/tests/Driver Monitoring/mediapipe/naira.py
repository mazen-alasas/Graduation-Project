import cv2
import mediapipe as mp
import time
from playsound import playsound
import threading

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)

holding = True
start_time = 0
ALARM_THRESHOLD = 2
ALARM_FILE_PATH = r'C:\Users\Nayira Mamdouh\Downloads\test\mixkit-rooster-crowing-in-the-morning-2462.wav'
alarm_playing = False

def play_alarm():
    global alarm_playing
    while alarm_playing:
        playsound(ALARM_FILE_PATH)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb_frame)

    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
        holding = True
        alarm_playing = False
        start_time = time.time()
    else:
        if holding and time.time() - start_time > ALARM_THRESHOLD:
            print("تنبيه: تم ترك الشيء!")
            if not alarm_playing:
                alarm_playing = True
                threading.Thread(target=play_alarm).start()
            holding = False

    cv2.imshow('Hand Detection', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
alarm_playing = False