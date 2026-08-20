from flask import Flask, jsonify

from app.config import Config
from app.extensions import cors, init_db, jwt


def create_app(config_class=Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    # --- Extensions ---
    init_db(app.config["MONGO_URI"])
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGIN"]}},
        supports_credentials=True,
    )

    # --- Blueprints ---
    from app.routes.admin import admin_bp
    from app.routes.ai import ai_bp
    from app.routes.auth import auth_bp
    from app.routes.community import community_bp
    from app.routes.insights import insights_bp
    from app.routes.journal import journal_bp
    from app.routes.mood import mood_bp
    from app.routes.privacy import privacy_bp
    from app.routes.resources import resources_bp
    from app.routes.user import user_bp
    from app.routes.wellness import wellness_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(mood_bp)
    app.register_blueprint(journal_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(wellness_bp)
    app.register_blueprint(insights_bp)
    app.register_blueprint(community_bp)
    app.register_blueprint(resources_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(privacy_bp)

    # --- Seed default crisis/wellness resources on first run ---
    from app.services.resource_service import seed_default_resources

    seed_default_resources()

    # --- Health check ---
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "mindmate-ai-backend"})

    # --- Uniform error handling: never leak stack traces ---
    @app.errorhandler(404)
    def not_found(_e):
        return jsonify({"error": "Resource not found."}), 404

    @app.errorhandler(500)
    def server_error(_e):
        app.logger.exception("Unhandled server error")
        return jsonify({"error": "Something went wrong. Please try again."}), 500

    @jwt.unauthorized_loader
    def unauthorized_callback(_reason):
        return jsonify({"error": "Authentication required."}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(_reason):
        return jsonify({"error": "Invalid or expired session. Please log in again."}), 401

    @jwt.expired_token_loader
    def expired_token_callback(_jwt_header, _jwt_payload):
        return jsonify({"error": "Session expired. Please log in again."}), 401

    return app
