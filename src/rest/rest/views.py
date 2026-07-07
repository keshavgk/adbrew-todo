from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from pymongo import MongoClient
from . import repository

mongo_uri = 'mongodb://' + os.environ["MONGO_HOST"] + ':' + os.environ["MONGO_PORT"]
db = MongoClient(mongo_uri)['test_db']

class TodoListView(APIView):

    def get(self, request):
        
        try:
            todos = repository.list_todos(db)
            return Response(todos, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"error": "Failed to fetch."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
    def post(self, request):
       
        description = request.data.get("description")

        if not isinstance(description, str) or not description.strip():
            return Response(
                {"error": "A non-empty 'description' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            todo = repository.create_todo(db, description.strip())
            return Response(todo, status=status.HTTP_201_CREATED)
        except Exception:
            return Response(
                {"error": "Failed to create todo."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

