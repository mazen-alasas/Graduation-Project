from src.drv_face_rec.face_recognition_module import FaceRecognition
from src.utils.helper import play_alarm_sound

DFR = FaceRecognition()
DFR.load_users_data()
DFR.run()

same_person: bool = DFR.is_verified()
print(same_person)
# if not same_person:
#     play_alarm_sound()          # play alarm sound





# send same_person value to FireBase (asmaa)

# name of image
# name = os.path.splitext(os.path.basename(r"G:\Sub Projects For GP\AI\Mazen Ahmed.jpg"))[0]
# print(name) 

"""
DMS = DriverMonitor()
DMS.run()
"""


# cap = cv2.VideoCapture(0)
# while cap.isOpened():
#     success, frame = cap.read()

#     if not success:
#         print("Error reading frame.")
#         break
    
#     gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#     faces = DMS.detector(gray)

#     if len(faces) == 0:
#         DMS._handle_no_face_detected()
#     else:
#         DMS.no_face_start_time = None
#         DMS._handle_faces_detected(faces, gray, frame)

#     if DMS.message_text and time.time() - DMS.message_time <= DMS.MESSAGE_DISPLAY_DURATION:
#         cv2.putText(frame, DMS.message_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

#     cv2.imshow("Driver Status", frame)

#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# cap.release()
# cv2.destroyAllWindows()
