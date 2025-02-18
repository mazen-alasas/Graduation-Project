import cv2  
import os  

# Check if the file exists and print the result
print("File exists?", os.path.exists("h1.jpg"))  

# Print all files in the current directory to verify the image is there
print("Files in current directory:", os.listdir("."))  

# Try to read the image from the file
img = cv2.imread("h1.jpg")  

# Check if the image was successfully loaded
if img is None:  
    print("Error: Could not load image.") # Print an error message if the image is missing or corrupted
else:
    print("Image loaded successfully!")  # Print success message if the image was loaded correctly

    cv2.imshow("Image", img)  
    cv2.waitKey(0)  
    cv2.destroyAllWindows()  

