from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from typing import Optional

@app.get("/api/dishes")
def get_dishes(q: Optional[str] = None):
    dishes = [
        {
            "id": "apidish1",
            "name": "Truffle Mushroom Risotto",
            "category": "Italian · Rice",
            "time": "45 min",
            "servings": 2,
            "image": "https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=600&q=80"
        },
        {
            "id": "apidish2",
            "name": "Spicy Tuna Rolls",
            "category": "Japanese · Seafood",
            "time": "30 min",
            "servings": 4,
            "image": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80"
        },
        {
            "id": "apidish3",
            "name": "French Croissant",
            "category": "French · Bakery",
            "time": "3 hrs",
            "servings": 6,
            "image": "https://images.unsplash.com/photo-1555507036-ab1e4006aaeb?w=600&q=80"
        },
        {
            "id": "apidish4",
            "name": "Classic Beef Wellington",
            "category": "British · Beef",
            "time": "2.5 hrs",
            "servings": 6,
            "image": "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80"
        },
        {
            "id": "apidish5",
            "name": "Tom Yum Soup",
            "category": "Thai · Soup",
            "time": "20 min",
            "servings": 3,
            "image": "https://images.unsplash.com/photo-1548943487-a2e4e43b4859?w=600&q=80"
        },
        {
            "id": "apidish6",
            "name": "Classic Butter Chicken",
            "category": "Indian · Curry",
            "time": "40 min",
            "servings": 4,
            "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80"
        },
        {
            "id": "apidish7",
            "name": "Palak Paneer",
            "category": "Indian · Vegetarian",
            "time": "30 min",
            "servings": 4,
            "image": "https://images.unsplash.com/photo-1601050690597-df0568a7094b?w=600&q=80"
        },
        {
            "id": "apidish8",
            "name": "Hyderabadi Chicken Biryani",
            "category": "Indian · Rice",
            "time": "1.5 hrs",
            "servings": 6,
            "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80"
        },
        {
            "id": "apidish9",
            "name": "Crispy Punjabi Samosas",
            "category": "Indian · Snack",
            "time": "1 hr",
            "servings": 8,
            "image": "https://images.unsplash.com/photo-1601050690597-df0568a7094b?w=600&q=80"
        },
        {
            "id": "apidish10",
            "name": "Chana Masala",
            "category": "Indian · Vegan",
            "time": "35 min",
            "servings": 4,
            "image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80"
        },
        {
            "id": "apidish11",
            "name": "Chicken Tikka Masala",
            "category": "Indian · Curry",
            "time": "45 min",
            "servings": 4,
            "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80"
        },
        {
            "id": "apidish12",
            "name": "Mango Lassi",
            "category": "Indian · Mocktail",
            "time": "10 min",
            "servings": 2,
            "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80"
        },
        {
            "id": "apidish13",
            "name": "Masala Chai",
            "category": "Indian · Hot Drink",
            "time": "15 min",
            "servings": 2,
            "image": "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=600&q=80"
        },
        {
            "id": "apidish14",
            "name": "Mumbai Pav Bhaji",
            "category": "Indian · Street Food",
            "time": "40 min",
            "servings": 4,
            "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80"
        },
        {
            "id": "apidish15",
            "name": "Hakka Noodles",
            "category": "Indo-Chinese · Noodles",
            "time": "25 min",
            "servings": 3,
            "image": "https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&q=80"
        },
        {
            "id": "apidish16",
            "name": "Crispy French Fries",
            "category": "American · Fast Food",
            "time": "30 min",
            "servings": 2,
            "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80"
        },
        {
            "id": "apidish17",
            "name": "Vegetable Spring Rolls",
            "category": "Chinese · Appetizer",
            "time": "45 min",
            "servings": 6,
            "image": "https://images.unsplash.com/photo-1544265736-224cc9e08eb6?w=600&q=80"
        }
    ]
    
    if q:
        query = q.lower()
        dishes = [d for d in dishes if query in d["name"].lower() or query in d["category"].lower()]
        
    return dishes

