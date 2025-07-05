import os
import time
import spidev
import socket
import threading
import cv2
from ultralytics import YOLO

#############################################
# Constants for socket connection
HOST = '0.0.0.0'
PORT = 1234

# Constants for message types
STOP:    int = 0
PLAY:    int = 1
AWAKE:   int = 3
WARN:    int = 4  # sleeping or dead
MOVE:    int = 5  # NO_FACE
FINISH:  int = 6

#############################################
# SPI
spi = spidev.SpiDev()
spi.open(0, 0)
spi.max_speed_hz = 50000
spi.mode = 0
spi.bits_per_word = 8

# Socket
server_socket = socket.socket()
server_socket.bind((HOST, PORT))

# camera initialization & YOLO
cap = cv2.VideoCapture(0)
model = YOLO("/models/bestOfYolov8.pt")

# Class IDs of (interest)
stop_class: int = 13
stop_spi:   int = 3
finish_spi: int = 2

#############################################
def send_integer(num):
    """
    Sends an integer over SPI.
    :param num: Integer to send
    :return: None
    """
    spi.xfer2([num])
    if num == stop_class:
	      print(f"Data: [STOP sign] is sended..(SPI)")

#############################################
def yolo_loop(conn):
    """
    YOLO object detection loop 
    Captures frames from the camera, processes them with YOLO to recognize traffic signs,
    and displays the annotated frames in a window.
    Updates the feature state in Firebase to indicate that YOLO is running.
    :return: None
    """

    if not cap.isOpened():
        print("Cannot open camera")
        exit()

    while True:
        ret, frame = cap.read()
        
        if not ret:
            print("Can't receive frame ..")
            break
       
        #annotated_frame = results[0].plot()
        #cv2.imshow('annotated frame', annotated_frame)
        
        boxes = results[0].boxes
        for box in boxes:
            class_id = int(box.cls[0])
            class_name = model.names[class_id]
            print(f"class: [{class_id} -> {class_name}")
            if class_id == 13:
                send_integer(STOP)

        if cv2.waitKey(1) == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


def socket_listener():
    """
    Listens for incoming socket connections and processes commands.
    Commands include PLAY, STOP, WARN, and NO_FACE.
    When a PLAY command is received, it starts the YOLO thread.
    When a STOP command is received, it stops the YOLO thread and exits.
    When WARN or NO_FACE commands are received, it sends the respective integer codes.
    :return: None
    """
    server_socket.listen(1)
    print(f"Listening on port {PORT} ...")

    conn, addr = server_socket.accept()
    print(f"Connected by {addr}")
    data = conn.recv(1024)
    message = int(data.decode())
    print(f"[Socket] Received: {message}")
        
    yolo_thread_started = False
    is_stopped = 2
    
    if message == STOP:
	    send_integer(STOP)
	    conn.close()
	    server_socket.close()
	    os._exit(0)
    elif message == PLAY and not yolo_thread_started:
	    send_integer(PLAY)
	    yolo_thread = threading.Thread(target=yolo_loop, args=(conn,))
		  yolo_thread.start()
	    yolo_thread_started = True

		  # Continue listening for additional commands like STOP
	    while True:
		    try:
			    data = conn.recv(1024)
			    if not data:
				    continue
            
			    message = int(data.decode())
			    print(f"[Socket] Received: {message}")
          
			    if message == FINISH or (message in [WARN, NO_FACE] and not is_stopped):
				    send_integer(finish_spi)
				    conn.close()
				    break
			    elif message in (WARN, NO_FACE):
				    send_integer(WARN)
				    is_stopped -= 1
		    except Exception as e:
			    print(f"[Socket] Error during loop: {e}")
			    break
		
		
#############################################
# Start only socket thread (YOLO starts after PLAY command)
socket_thread = threading.Thread(target=socket_listener)
socket_thread.start()
socket_thread.join()


server_socket.close()
os._exit(0)
