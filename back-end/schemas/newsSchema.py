from extensions import ma
from models.NewsModel import News
from marshmallow import fields

class NewsSchema(ma.SQLAlchemyAutoSchema):
    title = fields.String(required=True)
    content = fields.String(required=True)
    image_url = fields.String(allow_none=True)
    user_id = fields.Int(dump_only=True)

    class Meta:
        model = News
        include_fk = False
        load_instance = False 


news_schema = NewsSchema()
newss_schema = NewsSchema(many=True)
