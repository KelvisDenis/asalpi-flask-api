from flask import Flask, request, jsonify, send_from_directory, render_template, Blueprint
from dotenv import load_dotenv
import datetime
import cv2
load_dotenv()
from extensions import db, ma, bcrypt, jwt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import os, uuid
from config import Config
from models.userModel import User
from models.NewsModel import News
from schemas.userSchema import user_schema, users_schema
from schemas.newsSchema import news_schema, newss_schema
from flask_talisman import Talisman

# ----------------- Inicialização -----------------
app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
ma.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)


keepalive_bp = Blueprint('keepalive', __name__)

# ----------------- Segurança -----------------
csp = {
    'default-src': ["'self'"],
    'img-src': ["'self'", "data:", "https:"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"]
}

talisman = Talisman(app, content_security_policy=csp)


CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    expose_headers=["Authorization"],
    supports_credentials=True
)

# ----------------- Upload -----------------
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
app.config["ALLOWED_EXTENSIONS"] = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in app.config["ALLOWED_EXTENSIONS"]

# ----------------- Rotas Usuário -----------------
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Todos os campos são obrigatórios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "E-mail já cadastrado"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return user_schema.jsonify(new_user), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    print("Login recebido:", data)

    if not username or not password:
        return jsonify({"error": "E-mail e senha são obrigatórios"}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Senha inválida"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Login realizado com sucesso", "token": access_token}), 200

@app.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    all_users = User.query.all()
    return jsonify(users_schema.dump(all_users))

# ----------------- Rotas Notícias -----------------
@app.route('/news', methods=['POST'])
@jwt_required()
def create_news():
    incoming_json = request.get_json()
    try:
        data = news_schema.load(incoming_json)
    except Exception as e:
        return jsonify({"error": "Erro de validação", "details": str(e)}), 422

    user_id = get_jwt_identity()
    new_news = News(
        title=data["title"],
        content=data["content"],
        image_url=data.get("image_url"),
        user_id=user_id
    )

    db.session.add(new_news)
    db.session.commit()
    return news_schema.jsonify(new_news), 201

@app.route('/news', methods=['GET'])
def get_news():
    all_news = News.query.order_by(News.created_at.desc()).all()
    return jsonify(newss_schema.dump(all_news))

@app.route('/news/<int:id>', methods=['GET'])
def get_news_by_id(id):
    news_item = News.query.get(id)
    if not news_item:
        return jsonify({"error": "Notícia não encontrada"}), 404
    return news_schema.jsonify(news_item)

@app.route('/news/<int:id>', methods=['PUT'])
@jwt_required()
def update_news(id):
    news_item = News.query.get(id)
    if not news_item:
        return jsonify({"error": "Notícia não encontrada"}), 404

    user_id = get_jwt_identity()
    if str(news_item.user_id) != user_id:
        return jsonify({"error": "Você não pode editar esta notícia"}), 403

    data = request.get_json()
    news_item.title = data.get("title", news_item.title)
    news_item.content = data.get("content", news_item.content)
    news_item.image_url = data.get("image_url", news_item.image_url)
    db.session.commit()
    return news_schema.jsonify(news_item)

@app.route('/news/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_news(id):
    news_item = News.query.get(id)
    if not news_item:
        return jsonify({"error": "Notícia não encontrada"}), 404

    user_id = get_jwt_identity()
    if str(news_item.user_id) != user_id:
        return jsonify({"error": "Você não pode deletar esta notícia"}), 403

    db.session.delete(news_item)
    db.session.commit()
    return jsonify({"message": "Notícia removida com sucesso"}), 200

# ----------------- Upload -----------------
@app.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():
    print("Arquivos recebidos:", request.files)

    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Nome de arquivo vazio"}), 400

    if file and allowed_file(file.filename):
        filename = f"{uuid.uuid4().hex}_{file.filename}"
        today = datetime.date.today()
        folder_path = os.path.join(app.config["UPLOAD_FOLDER"], str(today.year), str(today.month))
        os.makedirs(folder_path, exist_ok=True)
        filepath = os.path.join(folder_path, filename)

        # ----------- Redimensionar e otimizar imagem com OpenCV -----------
        file_bytes = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        # Redimensiona mantendo proporção
        max_dim = 1024
        h, w = img.shape[:2]
        if max(h, w) > max_dim:
            scale = max_dim / max(h, w)
            img = cv2.resize(img, (int(w*scale), int(h*scale)))

        # Salvar como JPEG otimizado
        cv2.imwrite(filepath, img, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        # -------------------------------------------------------------------

        host = app.config.get("LOCAL_IP", "127.0.0.1")
        port = app.config.get("PORT", 5000)
        file_url = f"http://{host}:{port}/uploads/{today.year}/{today.month}/{filename}"

        return jsonify({"url": file_url}), 201

    return jsonify({"error": "Extensão de arquivo não permitida"}), 400

@app.route('/uploads/<int:year>/<int:month>/<filename>')
def uploaded_file(year, month, filename):
    folder_path = os.path.join(app.config['UPLOAD_FOLDER'], str(year), str(month))
    return send_from_directory(folder_path, filename)



@keepalive_bp.route("/keepalive", methods=["GET"])
def keepalive():
    return jsonify({"status": "ok", "message": "pong"}), 200


# ----------------- Rotas HTML -----------------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/noticias')
def news():
    return render_template('NewsList.html')

@app.route('/Asalp/admin')
def admin():
    return render_template('newsadmin.html')

@app.route('/clube')
def clube():
    return render_template('clube.html')

@app.route('/colonia')
def colonia():
    return render_template('colonia.html')

@app.route('/escola')
def escola():
    return render_template('escola.html')

@app.route('/noticias/<int:id>')
def news_single(id):
    return render_template('News.html', news_id=id)


# ----------------- Rodar App -----------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    host = app.config.get("LOCAL_IP", "0.0.0.0")
    port = app.config.get("PORT", 5000)
    app.run(host=host, port=port, debug=True)
