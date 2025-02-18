from deepface import DeepFace
import cv2


# تحميل الصورة المعروفة

known_img = cv2.imread("D:\FaceRecognition-deepface\h1.jpg")


# التأكد من تحميل الصورة
if known_img is None:
    print(f"Error: Unable to load image from {known_img }")
    exit()

# استخدام كاميرا الويب
cap = cv2.VideoCapture(0)

frame_num = 0
same_person = False

# تحقق من هوية الشخص في 30 إطارًا
while frame_num < 30:
    ret, frame = cap.read()

    if not ret:
        print("Error: Unable to read frame from camera.")
        break

    cv2.imshow("Frame", frame)

    try:

        same_person = DeepFace.verify(img1_path= known_img, img2_path=frame)["verified"]
    except:
     pass

    print(f'Frame number: {frame_num + 1} - Verified: {same_person}')

    if same_person:
        break

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

    frame_num += 1

cap.release()
cv2.destroyAllWindows()

print("Same person verified:", same_person)
