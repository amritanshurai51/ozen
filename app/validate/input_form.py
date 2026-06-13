# from pydantic import BaseModel, ValidationError, Field
# from datetime import datetime
# from typing import Literal

# class Input_form_type(BaseModel):
#     # name: str
#     age: int = Field(ge=18,le=50)
#     height: float = Field(ge=150,le=214)
#     weight: float = Field(ge=40)
#     gender: Literal ['m','f']
#     sleep: float = Field(ge=1,le=20)
#     city: str
#     primary_goal: str 
#     body_type: str 
#     style_type: str
#     monthly_budget: str = Field(max_length=100)
#     gym_fitness: str





# def calculate_bmi(height: float, weight: float):

#     if(height == None or weight == None):
#         return "Height or weight values Missing"
    
#     else: 
#         height_in_meters = height/100
#         bmi = weight / (height ** 2)
#         return bmi
    

from pydantic import BaseModel, Field
from typing import Literal

class InputForm(BaseModel):
    age: int = Field(ge=18, le=50)
    gender: Literal['m', 'f']
    ethnicity: str = Field(max_length=50)
    city: str = Field(max_length=50)
    primary_goal: str = Field(max_length=200)
    skincare_routine: str = Field(max_length=50)
    skin_issues: str = Field(max_length=200)
    body_type: str = Field(max_length=50)
    height: float = Field(ge=120, le=230)
    weight: float = Field(ge=30, le=200)
    style_type: str = Field(max_length=200)
    monthly_budget: str = Field(max_length=100)
    currency: Literal['inr', 'aed']
    gym_fitness: str = Field(max_length=50)
    sleep_bed: str = Field(max_length=5)
    sleep_wake: str = Field(max_length=5)
    sleep_hours: float = Field(ge=0, le=24)

    def calculate_bmi(self) -> float:
        height_m = self.height / 100
        return round(self.weight / (height_m ** 2), 1)

    def to_claude_dict(self) -> dict:
        return {
            "age": self.age,
            "gender": self.gender,
            "ethnicity": self.ethnicity,
            "city": self.city,
            "primary_goal": self.primary_goal,
            "skincare_routine": self.skincare_routine,
            "skin_issues": self.skin_issues,
            "body_type": self.body_type,
            "height": self.height,
            "weight": self.weight,
            "bmi": self.calculate_bmi(),
            "style_type": self.style_type,
            "monthly_budget": self.monthly_budget,
            "currency": self.currency,
            "gym_fitness": self.gym_fitness,
            "sleep_hours": self.sleep_hours,
        }
    

    