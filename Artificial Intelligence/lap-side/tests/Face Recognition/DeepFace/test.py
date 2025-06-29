from deepface import DeepFace
import cv2

known_img = cv2.imread("C:/Users/Mariam Elyamany/OneDrive/Desktop/imges/8.jpg")

if known_img is None:
    print(f"Error: Unable to load image from {known_img }")
    exit()

cap = cv2.VideoCapture(0)

frame_num = 0
same_person = False

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

# ___________________________________________________________________________________________________________

# العثور على شخص في مجموعة بيانات (إذا كان لديك مجموعة صور)
data_set_path = "images 1"  # تأكد من أن هذا هو المسار الصحيح للمجلد

# استخدام الكاميرا مرة أخرى
cap = cv2.VideoCapture(0)

frame_num = 0

# العثور على شخص في 30 إطارًا
while frame_num < 30:
    ret, frame = cap.read()

    if not ret:
        print("Error: Unable to read frame from camera.")
        break

    cv2.imshow("Frame", frame)

    try:
        # استخدام img_path بشكل صحيح
        same_person = DeepFace.find(img1_path=data_set_path, img2_path=frame)
        print(f'Frame number: {frame_num + 1} - Found: {same_person}')
    except:
      pass

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

    frame_num += 1

cap.release()
cv2.destroyAllWindows()

# ___________________________________________________________________________________________________________

# تحليل الصورة المعروفة
try:
    analysis = DeepFace.analyze(img_path=known_img)
    print(analysis)
except:
  pass
    

   