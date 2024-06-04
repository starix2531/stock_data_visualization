from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Union
from google.cloud import aiplatform
from google.protobuf import json_format
from google.protobuf.struct_pb2 import Value
import google.auth
from dotenv import dotenv_values
import uvicorn
import logging

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

config = dotenv_values(".env")
credentials, project = google.auth.default()

aiplatform.init(project=config.get('PROJECT', project), location=config['REGION'], credentials=credentials)

class PredictionRequest(BaseModel):
    prompt: str

# Configure logging
logging.basicConfig(level=logging.INFO)

@app.post("/predict")
async def predict(request: PredictionRequest):
    request_dict = {
        "instances": [
            {"prompt": request.prompt}
        ]
    }

    try:
        logging.info(f"Received prediction request: {request_dict}")
        response = predict_custom_trained_model_sample(
            project=config.get('PROJECT', project),
            endpoint_id=config['ENDPOINT_ID'],  # Ensure to have ENDPOINT_ID in your .env
            location=config['REGION'],
            instances=request_dict['instances'],
            credential=credentials
        )
        logging.info(f"Prediction response: {response}")
        return response
    except Exception as e:
        logging.error(f"Error during prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def predict_custom_trained_model_sample(
    project: str,
    endpoint_id: str,
    instances: Union[Dict, List[Dict]],
    location: str = "us-west1",
    api_endpoint: str = "us-west1-aiplatform.googleapis.com",
    credential = None
):
    """
    Perform prediction using a custom-trained model on Google AI Platform.
    """
    client_options = {"api_endpoint": api_endpoint}
    client = aiplatform.gapic.PredictionServiceClient(client_options=client_options, credentials=credential)
    
    # Ensure instances is a list of dictionaries
    if not isinstance(instances, list):
        instances = [instances]
    
    logging.info(f"Instances before conversion: {instances}")
    
    try:
        instances = [
            json_format.ParseDict(instance_dict, Value()) for instance_dict in instances
        ]
    except Exception as e:
        logging.error(f"Error parsing instances: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error parsing instances: {str(e)}")
    
    parameters_dict = {}
    parameters = json_format.ParseDict(parameters_dict, Value())
    endpoint = client.endpoint_path(
        project=project, location=location, endpoint=endpoint_id
    )
    response = client.predict(
        endpoint=endpoint, instances=instances, parameters=parameters
    )
    predictions = response.predictions
    results = []
    for prediction in predictions:
        results.append(json_format.MessageToDict(prediction))  # Convert to dict for better readability
    return {"predictions": results}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
