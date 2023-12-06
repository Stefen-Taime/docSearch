from fastapi import FastAPI, HTTPException, Query
from typing import List
from pydantic import BaseModel
from elasticsearch import Elasticsearch
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette import status

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Specifies the allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

es = Elasticsearch("http://localhost:9200")

class ProcessedFileDTO(BaseModel):
    id: str
    content: str
    processed_at: str

class FilesSearchResponseCode:
    SEARCH_RESULTS = 200
    NO_FILES_PROCESSED_FOUND = 404
    CATEGORY_NAME = "FILES_SEARCH_SERVICE"

    @classmethod
    def get_response_message(cls, code):
        if code == cls.SEARCH_RESULTS:
            return "Search results"
        elif code == cls.NO_FILES_PROCESSED_FOUND:
            return "No Files found"
        else:
            return "Unknown error"

@app.get("/api/v1/search/", response_model=List[ProcessedFileDTO])
def search_files_processed(
    search: str = Query(..., description="Text to search for"),
    page: int = Query(0, description="Page number"),
    size: int = Query(20, description="Page size")
):
    query_body = {
        "query": {
            "match": {
                "document.document.content": search
            }
        },
        "from": page * size,
        "size": size
    }

    response = es.search(index="processed_files", body=query_body)
    hits = response['hits']['hits']

    if not hits:
        raise HTTPException(
            status_code=FilesSearchResponseCode.NO_FILES_PROCESSED_FOUND,
            detail=FilesSearchResponseCode.get_response_message(FilesSearchResponseCode.NO_FILES_PROCESSED_FOUND)
        )

    results = [
        ProcessedFileDTO(
            id=hit["_id"], 
            content=hit["_source"]["document"]["document"]["content"],
            processed_at=hit["_source"]["document"]["document"]["processed_at"]
        ).dict() 
        for hit in hits
    ]

    return JSONResponse(
        status_code=FilesSearchResponseCode.SEARCH_RESULTS,
        content={
            "code": FilesSearchResponseCode.SEARCH_RESULTS,
            "category": FilesSearchResponseCode.CATEGORY_NAME,
            "message": FilesSearchResponseCode.get_response_message(FilesSearchResponseCode.SEARCH_RESULTS),
            "data": results
        }
    )

@app.get("/api/v1/autocomplete/")
def autocomplete(query: str = Query(..., description="Text to autocomplete")):
    suggest_body = {
        "query": {
            "match_phrase_prefix": {
                "document.document.content": {
                    "query": query
                }
            }
        },
        "size": 5  
    }
    response = es.search(index="processed_files", body=suggest_body)
    hits = response['hits']['hits']
    suggestions = [hit["_source"]["document"]["document"]["content"] for hit in hits]
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"suggestions": suggestions}
    )
# Lancement de l'application FastAPI
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
