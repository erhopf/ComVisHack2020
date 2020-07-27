from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from msrest.authentication import CognitiveServicesCredentials
import time
import jsonify
import json


"""
if 'subscription_key' in os.environ:
    subscription_key = os.environ['subscription_key']
else:
    print('Environment variable for subscription_key is not set.')
    exit()
    
if 'endpoint' in os.environ:
    endpoint = os.environ['endpoint']
else:
    print('Environment variable for endpoint is not set.')
    exit()
"""

# Add your Computer Vision subscription key to your environment variables.

subscription_key = "5ee02059585546c7b0a3990a1f37e070"
endpoint = "https://comvis-hack2020.cognitiveservices.azure.com/"


def read_image(image_uri):

    computervision_client = ComputerVisionClient(endpoint, CognitiveServicesCredentials(subscription_key))

    # Call API with URL and raw response (allows you to get the operation location)
    recognize_ocr_results = computervision_client.read(image_uri,  raw=True)

    # Get the operation location (URL with an ID at the end) from the response
    operation_location_remote = recognize_ocr_results.headers["Operation-Location"]

    # Grab the ID from the URL
    operation_id = operation_location_remote.split("/")[-1]

    # Call the "GET" API and wait for it to retrieve the results
    while True:
        get_text_results = computervision_client.get_read_result(operation_id)
        if get_text_results.status not in ['notStarted', 'running']:
            break
        time.sleep(1)

    all_lines = ""
    # Print the detected text, line by line
    if get_text_results.status == OperationStatusCodes.succeeded:
        for text_result in get_text_results.analyze_result.read_results:
            for line in text_result.lines:
                all_lines += line.text + " "

    split_lines = all_lines.split(",")
    output = [s.replace('(', "") for s in split_lines]
    output = [s.replace(')', "") for s in output]
    output = [s.strip() for s in output]

    return json.dumps({'ocr_results': output})
