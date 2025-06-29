import cv2
import mediapipe as mp
import numpy as np
import pygame
import time

# إعداد المكونات الأساسية
mp_face_mesh = mp.solutions.face_mesh

# تحميل صوت الإنذار
pygame.mixer.init()
try:
    pygame.mixer.music.load(r"C:\Users\Nayira Mamdouh\Downloads\test\mixkit-rooster-crowing-in-the-morning-2462.wav")
    print("Sound loaded successfully.")
except pygame.error as e:
    print(f"Failed to load sound: {e}")

# حساب نسبة فتح العين (EAR)
def calculate_ear(eye):
    A = np.linalg.norm(eye[1] - eye[5])
    B = np.linalg.norm(eye[2] - eye[4])
    C = np.linalg.norm(eye[0] - eye[3])
    ear = (A + B) / (2.0 * C)
    return ear

# حساب نسبة فتح الفم (MAR)
def calculate_mar(mouth):
    A = np.linalg.norm(mouth[13] - mouth[14])
    B = np.linalg.norm(mouth[15] - mouth[16])
    C = np.linalg.norm(mouth[17] - mouth[18])
    D = np.linalg.norm(mouth[12] - mouth[11])
    mar = (A + B + C) / (2.0 * D)
    return mar

# النقاط المميزة للعينين والفم
LEFT_EYE = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33, 160, 158, 133, 153, 144]
MOUTH = [61, 291, 78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178]

EAR_THRESHOLD = 0.25
MAR_THRESHOLD = 0.5
ALARM_DURATION_THRESHOLD = 10  # المدة بالثواني
closed_eyes_start_time = None
alarm_on = False

# بدء الكاميرا
cap = cv2.VideoCapture(0)

with mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True, 
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5) as face_mesh:

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(frame_rgb)

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                # لن نرسم العلامات على الإطار
                landmarks = face_landmarks.landmark

                # استخراج النقاط المميزة للعينين والفم
                left_eye = np.array([(landmarks[i].x, landmarks[i].y) for i in LEFT_EYE])
                right_eye = np.array([(landmarks[i].x, landmarks[i].y) for i in RIGHT_EYE])
                mouth = np.array([(landmarks[i].x, landmarks[i].y) for i in MOUTH])

                left_ear = calculate_ear(left_eye)
                right_ear = calculate_ear(right_eye)
                ear = (left_ear + right_ear) / 2.0
                mar = calculate_mar(mouth)

                # التحقق من حالة النعاس
                if ear < EAR_THRESHOLD:
                    if closed_eyes_start_time is None:
                        closed_eyes_start_time = time.time()
                    elif (time.time() - closed_eyes_start_time) >= ALARM_DURATION_THRESHOLD:
                        if not alarm_on:
                            alarm_on = True
                            pygame.mixer.music.play(-1)  # تشغيل صوت الإنذار في تكرار
                else:
                    closed_eyes_start_time = None
                    alarm_on = False
                    pygame.mixer.music.stop()  # إيقاف صوت الإنذار عند عدم الحاجة

                # التحقق من حالة التثاؤب
                if mar > MAR_THRESHOLD:
                    if not pygame.mixer.music.get_busy():
                        pygame.mixer.music.play()  # تشغيل صوت الإنذار
                else:
                    if not alarm_on:
                        pygame.mixer.music.stop()  # إيقاف صوت الإنذار عند عدم الحاجة

        cv2.imshow('Driver Monitoring', frame)
        if cv2.waitKey(5) & 0xFF == 27:
            break

cap.release()
cv2.destroyAllWindows()
pygame.mixer.quit()