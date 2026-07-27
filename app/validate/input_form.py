from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime, time

class InputForm(BaseModel):

    age: int = Field(ge=18, le=50)
    gender: Literal['m', 'f']
    ethnicity: str = Field(max_length=50)

    city: str = Field(max_length=50)

    skincare_routine: str = Field(max_length=50)           # None / Basic cleanser only / 3-step / 5+ step
    skin_products: Optional[str] = Field(default=None, max_length=300)  # which products already using (conditional)
    oil_dry: Literal['oily', 'dry']                        
    sensitive_resistant: Literal['sensitive', 'resistant'] 
   
    water_intake: str = Field(max_length=50)               # Less than 2 glasses / 3-5 / 6+
    spf_habit: str = Field(max_length=50)                  # Yes daily / Sometimes / No rarely
    spf_level: Optional[str] = Field(default=None, max_length=20)  # SPF 30 / 50 / 50+ / Not sure (conditional)


    body_type: str = Field(max_length=50)
    height: float = Field(ge=120, le=230)
    weight: float = Field(ge=30, le=200)


    hair_type: str = Field(max_length=50)                  # Straight / Wavy / Curly / Coily
    hair_texture: str = Field(max_length=50)               # Fine / Medium / Coarse


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
      
            "height": self.height,
            "weight": self.weight,
            "bmi": self.calculate_bmi(),
            "body_type": self.body_type,
     
            "skincare_routine": self.skincare_routine,
            "skin_products": self.skin_products or "Not specified",
            "skin_type": f"{self.oil_dry.capitalize()}-{self.sensitive_resistant.capitalize()}",  # e.g. Oily-Sensitive
          
            "water_intake": self.water_intake,
            "spf_habit": self.spf_habit,
            "spf_level": self.spf_level or "Not specified",
    
            "hair_type": self.hair_type,
            "hair_texture": self.hair_texture,
         
            "monthly_budget": self.monthly_budget,
            "currency": self.currency,
            "gym_fitness": self.gym_fitness,
     
            "sleep_hours": self.sleep_hours,
            "bmi": self.calculate_bmi(),
        }
    