def serialize_todo(document):
    """Convert a raw Mongo document into a clean, JSON-safe dict."""
    return {
        "id": str(document["_id"]),
        "description": document["description"],
    }
    
def list_todos(db):
    """Return all todos, newest first, as JSON-safe dicts."""
    documents = db.todos.find().sort("_id", -1)
    return [serialize_todo(doc) for doc in documents]

def create_todo(db, description):
    """Insert one todo and return it as a JSON-safe dict."""
    result = db.todos.insert_one({"description": description})
    created = db.todos.find_one({"_id": result.inserted_id})
    return serialize_todo(created)