from extensions  import ma
from models.userModel import User
from models.NewsModel import News

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        exclude = ("password",)


user_schema = UserSchema()
users_schema = UserSchema(many=True)